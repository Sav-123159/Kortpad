import { useState, useEffect } from "react";
import { 
    MapContainer,
    ImageOverlay,
    Polyline,
    Marker,
    Popup
} from 'react-leaflet';
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';

function KortpadMap({ selectedCampus, startVenue, endVenue }) {
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
            bounds={bounds}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
            style={{ height: "100vh", width: "100%" }}
        >
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