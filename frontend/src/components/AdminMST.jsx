import { useState, useEffect } from "react";
import { MapContainer, ImageOverlay, Polyline } from 'react-leaflet';
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "../css/Admin.css";

export default function AdminMST() {
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [map, setMap] = useState(null);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then(res => res.json())
            .then(data => setCampuses(data))
            .catch(err => console.error("Failed to fetch campuses:", err));
    }, []);

    useEffect(() => {
        if (!selectedCampus) return;

        fetch(`http://127.0.0.1:8000/campus-map/${selectedCampus}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => setMap(data))
            .catch(err => console.error("Failed to fetch map:", err));

        fetch(`http://127.0.0.1:8000/mst/${selectedCampus}`)
            .then(res => res.json())
            .then(data => setEdges(data))
            .catch(err => console.error("Failed to fetch MST:", err));
    }, [selectedCampus]);

    return (
        <div className="Info">
            <div className="Lokaal__titel">
                <h2>Minimum Opspanboom</h2>
            </div>

            <select value={selectedCampus} onChange={e => setSelectedCampus(e.target.value)}>
                <option value="">Kies kampus</option>
                {campuses.map(campus => (
                    <option key={campus.campus_id} value={campus.campus_id}>
                        {campus.campus_name}
                    </option>
                ))}
            </select>

            {map && (
                <MapContainer
                    crs={CRS.Simple}
                    bounds={[[0, 0], [map.bounds_lat, map.bounds_lon]]}
                    style={{ height: "70vh", width: "100%" }}
                >
                    <ImageOverlay url={`/maps${map.image_path}`} bounds={[[0, 0], [map.bounds_lat, map.bounds_lon]]} />
                    {edges.map((edge, i) => (
                        <Polyline
                            key={i}
                            positions={[edge.from, edge.to]}
                            pathOptions={{ color: 'var(--pine)', weight: 4 }}
                        />
                    ))}
                </MapContainer>
            )}
        </div>
    );
}