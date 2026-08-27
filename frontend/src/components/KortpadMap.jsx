import { useState, useEffect } from "react";
import { 
    MapContainer,
    ImageOverlay,
    Polyline,
    Marker,
    Popup,
    useMap
} from 'react-leaflet';
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapSizeHandler({ collapsed }) {
    const map = useMap();

    useEffect(() => {
        let animationFrame;

        const updateMap = () => {
            map.invalidateSize({ animate: false });
            animationFrame = requestAnimationFrame(updateMap);
        };

        animationFrame = requestAnimationFrame(updateMap);

        const timeout = setTimeout(() => {
            cancelAnimationFrame(animationFrame);
        }, 450);

        return () => {
            cancelAnimationFrame(animationFrame);
            clearTimeout(timeout);
        };
    }, [collapsed, map]);

    return null;
}

function KortpadMap({ selectedCampus, startVenue, endVenue, collapsed }) {
    const [map, setMap] = useState(null);
    const [route, setRoute] = useState(null);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/campus-map/${selectedCampus}`)
            .then(res => {
                if (!res.ok) {
                    setMap(null);
                    throw new Error(`Campus map not found`);
                }
                return res.json();
            })
            .then(data => setMap(data))
            .catch(error => console.error("Failed to fetch map to render:", error));
    }, [selectedCampus]);

    useEffect(() => {
        if (!selectedCampus || !startVenue || !endVenue) {
            setRoute(null);
            return;
        }

        fetch(`http://127.0.0.1:8000/route/${selectedCampus}-${startVenue}-${endVenue}`)
            .then(res => res.json())
            .then(data => setRoute(data))
            .catch((error) => console.error("Failed to calculate route:", error));
    }, [startVenue, endVenue]);

    if (!map) {
        return (
            <div className="deco">
                <svg
                    width="320"
                    height="170"
                    viewBox="0 0 320 170"
                >
                    <circle cx="80" cy="85" r="10" className="node" id="node1" />
                    <circle cx="120" cy="35" r="10" className="node" id="node2" />
                    <circle cx="170" cy="135" r="10" className="node" id="node3" />
                    <circle cx="210" cy="85" r="10" className="node" id="node4" />
                    <path
                        className="animated-path"
                        d=" M80 85 C95 65 110 55 140 85 C170 115 195 105 210 85"
                    />
                </svg>
                <img src="../../public/LOGO_Cropped.jpeg" className="login-logo" />
            </div>
        );
    }

    const imageUrl = `/maps${map.image_path}`;
    const bounds = [
        [0,0],
        [map.bounds_lat, map.bounds_lon]
    ];

    return (
        <MapContainer
            crs={CRS.Simple}
            zoomControl={false}
            bounds={bounds}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
            style={{ height: "100vh", width: "100%" }}
        >
            <MapSizeHandler collapsed={collapsed} />

            <ImageOverlay
                url={imageUrl}
                bounds={bounds}
            />

            {route?.path_coordinates?.length > 0 && (
                <>
                    <Polyline 
                        positions={route.path_coordinates}
                        pathOptions={{
                            lineJoin: 'round',
                            lineCap: 'round',
                            weight: 6,
                            color: '#42643f'
                        }}
                    />
                    <Marker position={route.path_coordinates[0]}>
                        <Popup>Start</Popup>
                    </Marker>

                    <Marker
                        position={
                            route.path_coordinates[
                                route.path_coordinates.length - 1
                            ]
                        }
                    >
                        <Popup>Destination</Popup>
                    </Marker>
                </>
            )}
        </MapContainer>
    );
}

export default KortpadMap;