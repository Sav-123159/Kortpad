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
    const [route, setRoute] = useState(null);

    // useEffect(() => {
    //     // Change map to the selected campus' map
    // }, [selectedCampus]);
    const imageUrl = '/maps/Leriba Kaart (2026).jpg';
    const bounds = [
        [0,0],
        [1500, 2000]
    ];

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