import { useState, useEffect } from "react";
import { MapContainer, ImageOverlay, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "../css/Admin.css";

async function fetchData(url, signal) {
    const response = await fetch(`http://127.0.0.1:8000${url}`, { signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Data could not be loaded");
    return data;
}

export default function AdminEvacuation() {
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [map, setMap] = useState(null);
    const [vertices, setVertices] = useState([]);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        fetchData('/campuses', controller.signal).then(setCampuses)
            .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (selectedCampus) {
            Promise.all([
                fetchData(`/campus-map/${selectedCampus}`, controller.signal),
                fetchData(`/evacuation-vertices/${selectedCampus}`, controller.signal)
            ]).then(([campusMap, campusVertices]) => {
                if (controller.signal.aborted) return;
                setMap(campusMap);
                setVertices(campusVertices);
            }).catch(err => { if (err.name !== 'AbortError') setError(err.message); });
        }
        return () => controller.abort();
    }, [selectedCampus]);

    useEffect(() => {
        const controller = new AbortController();
        if (selectedCampus && start && end && start !== end) {
            fetchData(`/max-flow/${selectedCampus}/${start}/${end}`, controller.signal)
                .then(data => { if (!controller.signal.aborted) setResult(data); })
                .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
                .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        }
        return () => controller.abort();
    }, [selectedCampus, start, end]);

    function selectVertex(value, point) {
        setResult(null);
        setError("");
        const nextStart = point === 'start' ? value : start;
        const nextEnd = point === 'end' ? value : end;
        setLoading(Boolean(nextStart && nextEnd && nextStart !== nextEnd));
        if (point === 'start') setStart(value);
        else setEnd(value);
    }

    function selectCampus(value) {
        setSelectedCampus(value);
        setMap(null);
        setVertices([]);
        setStart("");
        setEnd("");
        setResult(null);
        setError("");
        setLoading(false);
    }

    return (
        <div className="Info GraphInfo">
            <div className="Lokaal__titel">
                <div>
                    <h2>Maksimum Ontruimingsvloei</h2>
                    <p>Klik eers A en dan B op die kaart, of gebruik die keuselyste. Groen: A; rooi: B.</p>
                </div>

                <button onClick={() => { selectVertex('', 'start'); setEnd(''); }}>Herstel punte</button> 
            </div>
            <div className="GraphControls">
                <label>Kampus
                    <select value={selectedCampus} onChange={e => selectCampus(e.target.value)}>
                        <option value="">Kies kampus</option>
                        {campuses.map(campus => <option key={campus.campus_id} value={campus.campus_id}>{campus.campus_name}</option>)}
                    </select>
                </label>
                {[['start', 'Hoekpunt A', start], ['end', 'Hoekpunt B', end]].map(([point, label, value]) => (
                    <label key={point}>{label}
                        <select value={value} disabled={!vertices.length} onChange={e => selectVertex(e.target.value, point)}>
                            <option value="">Kies hoekpunt</option>
                            {vertices.map(vertex => <option key={vertex.vertex_id} value={vertex.vertex_id}>Hoekpunt {vertex.vertex_id}</option>)}
                        </select>
                    </label>
                ))}
                
            </div>
            
            {start && start === end && <p role="alert">Kies twee verskillende hoekpunte.</p>}
            {error && <p role="alert">{error}</p>}
            {loading && <p role="status">Bereken vloei...</p>}
            {result && <p role="status"><strong>Maksimum vloei: {result.max_flow.toLocaleString()} mense/minuut</strong>
                {result.max_flow === 0 && ' — Geen pad met positiewe kapasiteit tussen die punte nie.'}
            </p>}
            {map && <MapContainer key={selectedCampus} crs={CRS.Simple}
                bounds={[[0, 0], [map.bounds_lat, map.bounds_lon]]} className="GraphMap">
                <ImageOverlay url={`/maps${map.image_path}`} bounds={[[0, 0], [map.bounds_lat, map.bounds_lon]]} />
                {result?.edges.map(edge => <Polyline key={edge.edge_id} positions={[edge.from, edge.to]}
                    pathOptions={{ color: edge.flow > 0 ? '#375534' : '#777777', weight: edge.flow > 0 ? 5 : 2, opacity: edge.flow > 0 ? 1 : 0.35 }}>
                    <Tooltip>Hoekpunt {edge.vertex_a} → {edge.vertex_b}: {edge.flow} / {edge.capacity} mense/minuut</Tooltip>
                </Polyline>)}
                {vertices.map(vertex => <CircleMarker key={vertex.vertex_id} center={[vertex.latitude, vertex.longitude]} radius={5}
                    pathOptions={{ color: String(vertex.vertex_id) === start ? '#375534' : String(vertex.vertex_id) === end ? '#b52a2a' : '#2E2F22', fillOpacity: 1 }}
                    eventHandlers={{ click: () => {
                        const value = String(vertex.vertex_id);
                        if (!start || end) { selectVertex(value, 'start'); setEnd(''); setLoading(false); }
                        else selectVertex(value, 'end');
                    } }}>
                    <Tooltip>Hoekpunt {vertex.vertex_id}</Tooltip>
                </CircleMarker>)}
            </MapContainer>}
        </div>
    );
}
