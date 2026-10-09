import { useState, useEffect } from "react";
import { MapContainer, ImageOverlay, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "../css/Admin.css";

// Pas die kaart aan wanneer die admin paneel se grootte verander.
function FitCampusMap({ bounds }) {
    const leafletMap = useMap();

    useEffect(() => {
        const resize = () => {
            leafletMap.invalidateSize();
            leafletMap.fitBounds(bounds, { padding: [15, 15], animate: false });
        };
        const observer = new ResizeObserver(resize);
        observer.observe(leafletMap.getContainer());
        resize();
        return () => observer.disconnect();
    }, [leafletMap, bounds]);

    return null;
}

export default function AdminMST() {
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [map, setMap] = useState(null);
    const [edges, setEdges] = useState([]);
    const [vertices, setVertices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then(res => res.json())
            .then(data => setCampuses(data))
            .catch(err => console.error("Failed to fetch campuses:", err));
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (selectedCampus) {
            Promise.all([
                fetch(`http://127.0.0.1:8000/campus-map/${selectedCampus}`, { signal: controller.signal }),
                fetch(`http://127.0.0.1:8000/mst/${selectedCampus}`, { signal: controller.signal }),
                fetch(`http://127.0.0.1:8000/evacuation-vertices/${selectedCampus}`, { signal: controller.signal })
            ]).then(async responses => Promise.all(responses.map(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || "Graph could not be loaded");
                return data;
            }))).then(([campusMap, mstEdges, vertices]) => {
                if (controller.signal.aborted) return;
                setMap(campusMap);
                setEdges(mstEdges);
                setVertices(vertices);
            }).catch(err => { if (err.name !== 'AbortError') setError(err.message); })
                .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        }
        return () => controller.abort();
    }, [selectedCampus]);

    const vertexCount = vertices.length;
    const bounds = map ? [[0, 0], [Number(map.bounds_lat), Number(map.bounds_lon)]] : null;
    // Ondersteun beide /beeld.jpg en /maps/beeld.jpg uit die databasis.
    const imagePath = map?.image_path.replace(/^\/?maps\//, '').replace(/^\//, '');

    return (
        <div className="Info GraphInfo">
            <div className="Lokaal__titel">
                <h2>Minimum Spanboom</h2>
            </div>

            <select value={selectedCampus} onChange={e => {
                setSelectedCampus(e.target.value);
                setMap(null); setEdges([]); setVertices([]); setError("");
                setLoading(Boolean(e.target.value));
            }}>
                <option value="">Kies kampus</option>
                {campuses.map(campus => (
                    <option key={campus.campus_id} value={campus.campus_id}>
                        {campus.campus_name}
                    </option>
                ))}
            </select>

            {loading && <p role="status">Laai kampuskaart en spanboom...</p>}
            {error && <p role="alert">{error}</p>}
            {map && <p>{vertexCount} hoekpunte; {edges.length} rande; totale gewig: {edges.reduce((sum, edge) => sum + edge.weight, 0).toFixed(2)}.
                {vertexCount > 0 && edges.length < vertexCount - 1 && ` Die grafiek is ontkoppel: ${vertexCount - edges.length} komponente (minimum spanwoud).`}
            </p>}
            {map && (
                <MapContainer
                    key={selectedCampus}
                    crs={CRS.Simple}
                    bounds={bounds}
                    minZoom={-5}
                    maxZoom={3}
                    className="GraphMap"
                >
                    <FitCampusMap bounds={bounds} />
                    <ImageOverlay url={`/maps/${imagePath}`} bounds={bounds} />
                    {edges.map((edge, i) => (
                        <Polyline
                            key={i}
                            positions={[edge.from, edge.to]}
                            pathOptions={{ color: '#375534', weight: 4 }}
                        >
                            <Tooltip>Hoekpunt {edge.vertex_a} ↔ {edge.vertex_b}: gewig {edge.weight}</Tooltip>
                        </Polyline>
                    ))}
                    {vertices.map(vertex => (
                        <CircleMarker key={vertex.vertex_id}
                            center={[vertex.latitude, vertex.longitude]} radius={4}
                            pathOptions={{ color: '#0f2a1d', fillColor: '#e5efd7', fillOpacity: 1, weight: 2 }}>
                            <Tooltip>Hoekpunt {vertex.vertex_id}</Tooltip>
                        </CircleMarker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
}