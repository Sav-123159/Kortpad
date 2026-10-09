import { useState, useEffect, useMemo } from "react";
import CampusMapControls from "./CampusMapControls";
import { MapContainer, ImageOverlay, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "../css/Admin.css";

// Pas die kaart aan wanneer die admin paneel se grootte verander.
function FitCampusMap({ bounds }) {
    const leafletMap = useMap();

    // Fit the selected campus when its bounds change.
    useEffect(() => {
        leafletMap.fitBounds(bounds, {
            padding: [15, 15],
            animate: false
        });
    }, [leafletMap, bounds]);

    // Recalculate dimensions without resetting pan or zoom.
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            leafletMap.invalidateSize({
                pan: false,
                animate: false
            });
        });

        observer.observe(leafletMap.getContainer());

        return () => observer.disconnect();
    }, [leafletMap]);

    return null;
}

function AnimatedEdge({ edge, duration }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frameId;
        let startTime;

        function animate(timestamp) {
            if (startTime === undefined) {
                startTime = timestamp;
            }

            const elapsed = timestamp - startTime;
            const nextProgress = Math.min(elapsed / duration, 1);

            setProgress(nextProgress);

            if (nextProgress < 1) {
                frameId = requestAnimationFrame(animate);
            }
        }

        frameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameId);
    }, [duration]);

    const [startLat, startLon] = edge.from;
    const [endLat, endLon] = edge.to;

    const currentEnd = [
        startLat + (endLat - startLat) * progress,
        startLon + (endLon - startLon) * progress
    ];

    return (
        <Polyline
            positions={[edge.from, currentEnd]}
            pathOptions={{ color: "#375534", weight: 4 }}
        >
            <Tooltip>
                Hoekpunt {edge.vertex_a} ↔ {edge.vertex_b}:
                {" "}gewig {edge.weight}
            </Tooltip>
        </Polyline>
    );
}

export default function AdminMST({ setCollapsed, collapsed, setMobieleLPaneel }) {
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [map, setMap] = useState(null);
    const [edges, setEdges] = useState([]);
    const [visibleEdgeCount, setVisibleEdgeCount] = useState(0);
    const [vertices, setVertices] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [stepDelay, setStepDelay] = useState(500);
    const [focusRequest, setFocusRequest] = useState(0);
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
    const bounds = useMemo(() => {
        if (!map) return null;

        return [
            [0, 0],
            [Number(map.bounds_lat), Number(map.bounds_lon)]
        ];
    }, [map]);
    // Ondersteun beide /beeld.jpg en /maps/beeld.jpg uit die databasis.
    const imagePath = map?.image_path.replace(/^\/?maps\//, '').replace(/^\//, '');

    useEffect(() => {
        if (!isPlaying || visibleEdgeCount >= edges.length) {
            return;
        }

        const timer = setTimeout(() => {
            const nextCount = visibleEdgeCount + 1;

            setVisibleEdgeCount(nextCount);

            if (nextCount >= edges.length) {
                setIsPlaying(false);
            }
        }, stepDelay);

        return () => clearTimeout(timer);
    }, [isPlaying, visibleEdgeCount, edges.length, stepDelay]);

    return (
        <div className="Info GraphInfo">
            <div className="MobileHeader">
                {collapsed && (
                    <button className="Hamburger" onClick={() => {  
                    setCollapsed(false); 
                    setMobieleLPaneel(true)}}>
                        ☰
                    </button>
                )}

                <h3>Minimum Spanboom</h3>
            </div>
            <div className="Lokaal__titel">
                <h2>Minimum Spanboom</h2>
            </div>

            <div className="Lokale__kampus">
                <div>
                    <h3>Kampus: </h3>
                    <select value={selectedCampus} onChange={e => {
                        setSelectedCampus(e.target.value);
                        setMap(null); setEdges([]); setVertices([]); setError("");
                        setLoading(Boolean(e.target.value));
                        setVisibleEdgeCount(0);
                        setIsPlaying(false);
                        setFocusRequest(0);
                    }}>
                        <option value="">Kies kampus</option>
                        {campuses.map(campus => (
                            <option key={campus.campus_id} value={campus.campus_id}>
                                {campus.campus_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <p role="status">Laai kampuskaart en spanboom...</p>}
            {error && <p role="alert">{error}</p>}
            {map && <p>{vertexCount} hoekpunte; {edges.length} rande; totale gewig: {edges.reduce((sum, edge) => sum + edge.weight, 0).toFixed(2)}.
                {vertexCount > 0 && edges.length < vertexCount - 1 && ` Die grafiek is ontkoppel: ${vertexCount - edges.length} komponente (minimum spanwoud).`}
            </p>}
            <div className="GraphControls">
                <button
                    disabled={!edges.length}
                    onClick={() => {
                        if (isPlaying) {
                            setIsPlaying(false);
                            return;
                        }

                        const restarting = visibleEdgeCount >= edges.length;

                        if (restarting) {
                            setVisibleEdgeCount(0);
                        }

                        if (visibleEdgeCount === 0 || restarting) {
                            setFocusRequest(request => request + 1);
                        }

                        setIsPlaying(true);
                    }}
                >
                    {isPlaying && visibleEdgeCount < edges.length
                        ? "Stop"
                        : visibleEdgeCount >= edges.length
                            ? "Vertoon weer"
                            : "Vertoon"}
                </button>

                <button
                    disabled={visibleEdgeCount >= edges.length}
                    onClick={() => {
                        setIsPlaying(false);

                        if (visibleEdgeCount === 0) {
                            setFocusRequest(request => request + 1);
                        }

                        setVisibleEdgeCount(count => 
                            Math.min(count + 1, edges.length)
                        );
                    }}
                >
                    Volgende stap
                </button>

                <button
                    onClick={() => {
                        setIsPlaying(false);
                        setVisibleEdgeCount(0);
                    }}
                >
                    Herstel
                </button>

                <label>
                    Spoed
                    <select
                        value={stepDelay}
                        onChange={e => setStepDelay(Number(e.target.value))}
                    >
                        <option value={750}>Stadig</option>
                        <option value={375}>Normaal</option>
                        <option value={180}>Vinnig</option>
                    </select>
                </label>

                <span>
                    {visibleEdgeCount} / {edges.length} rande
                </span>
            </div>
            {map && (
                <MapContainer
                    key={selectedCampus}
                    crs={CRS.Simple}
                    bounds={bounds}
                    maxBounds={bounds}
                    maxBoundsViscosity={1}
                    zoomSnap={0}
                    zoomDelta={0.5}
                    bounceAtZoomLimits={false}
                    inertia={false}
                    maxZoom={3}
                    className="GraphMap"
                >
                    <ImageOverlay url={`/maps/${imagePath}`} bounds={bounds} />
                    {edges.slice(0, visibleEdgeCount).map(edge => (
                        <AnimatedEdge
                            key={`${edge.vertex_a}-${edge.vertex_b}`}
                            edge={edge}
                            duration={150}
                        />
                    ))}
                    {vertices.map(vertex => (
                        <CircleMarker key={vertex.vertex_id}
                            center={[vertex.latitude, vertex.longitude]} radius={4}
                            pathOptions={{ color: '#0f2a1d', fillColor: '#e5efd7', fillOpacity: 1, weight: 2 }}>
                            <Tooltip>Hoekpunt {vertex.vertex_id}</Tooltip>
                        </CircleMarker>
                    ))}
                    <CampusMapControls
                        bounds={bounds}
                        focusPoint={edges[0]?.from}
                        focusRequest={focusRequest}
                    />
                </MapContainer>
            )}
        </div>
    );
}
