import { useState, useEffect, useMemo } from "react";
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
    const [buildingMaps, setBuildingMaps] = useState({});
    const [pageIndex, setPageIndex] = useState(0);

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

    const buildingFloorKeys = useMemo(() => {
        if (!route?.path_data) return [];
        const seen = new Set();
        route.path_data.forEach(segment => {
            if (segment.context.level === 'building') {
                seen.add(`${segment.context.building_id}-${segment.context.floor}`);
            }
        });
        return Array.from(seen);
    }, [route]);

    useEffect(() => {
        if (buildingFloorKeys.length === 0) {
            setBuildingMaps({});
            return;
        }

        let cancelled = false

        Promise.all(
            buildingFloorKeys.map(key => {
                const [buildingId, floor] = key.split('-');

                return fetch(`http://127.0.0.1:8000/building-map/${selectedCampus}-${buildingId}-${floor}`)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null)
                    .then(data => [key, data]);
            })
        ).then(results => {
            if (cancelled) return;
            const lookup = {};
            results.forEach(([key, data]) => { lookup[key] = data; });
            setBuildingMaps(lookup);
        });

        return () => { cancelled = true; };
    }, [buildingFloorKeys]);

    const pages = useMemo(() => {
        if (!route?.path_data || !map) return [];

        const resolvedPages = [];
        let currentPage = null;
        let previousImageKey = null;

        route.path_data.forEach(segment => {
            let resolvedMap = map;
            let imageKey = 'campus';

            if (segment.context.level === 'building') {
                const key = `${segment.context.building_id}-${segment.context.floor}`;
                const buildingMap = buildingMaps[key];
                if (buildingMap) {
                    resolvedMap = buildingMap;
                    imageKey = key;
                }
            }

            if (imageKey !== previousImageKey) {
                currentPage = { map: resolvedMap, coordinates: [] };
                resolvedPages.push(currentPage);
            }
            currentPage.coordinates.push(...segment.coordinates);
            previousImageKey = imageKey;
        });

        return resolvedPages;
    }, [route, map, buildingMaps]);

    useEffect(() => { setPageIndex(0); }, [pages]);

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

    const active = pages[pageIndex];
    const activeMap = active?.map ?? map;
    const bounds = [
        [0,0],
        [activeMap.bounds_lat, activeMap.bounds_lon]
    ];

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
            <MapContainer
                key={pageIndex}
                crs={CRS.Simple}
                zoomControl={false}
                bounds={bounds}
                maxBounds={bounds}
                maxBoundsViscosity={1.0}
                style={{ height: "100vh", width: "100%" }}
            >
                <MapSizeHandler collapsed={collapsed} />

                <ImageOverlay
                    url={`/maps${activeMap.image_path}`}
                    bounds={bounds}
                />

                {active?.coordinates?.length > 0 && (
                    <Polyline
                        positions={active.coordinates}
                        pathOptions={{
                            lineJoin: 'round',
                            lineCap: 'round',
                            weight: 6,
                            color: '#42643f'
                        }}
                    />

                )}
            </MapContainer>

            {pages.length > 1 && (
                <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', gap: '10px' }}>
                    <button disabled={pageIndex === 0} onClick={() => setPageIndex(i => i - 1)}>&larr; Terug</button>
                    <span>{pageIndex + 1} / {pages.length}</span>
                    <button disabled={pageIndex === pages.length - 1} onClick={() => setPageIndex(i => i + 1)}>Volgende &rarr;</button>
                </div>
            )}
        </div>
    );
}

export default KortpadMap;