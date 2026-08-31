import { useState, useEffect, useMemo } from "react";
import { 
    MapContainer,
    ImageOverlay,
    Polyline,
    Marker,
    Popup,
    useMap
} from 'react-leaflet';
import L, { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Hierdie handler word gebruik om die map mooi te animate wanneer die LeftPanel collapse
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

// Hierdie funkise help om maklik merkers te teken en maak op Leaflet se map rendering
function pinIcon({ fillColor, iconMarkup, className }) {
    const html = `
        <svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20 1C9.5 1 1 9.5 1 20c0 14 19 30 19 30s19-16 19-30C39 9.5 30.5 1 20 1z"
                fill="${fillColor}"
                stroke="var(--ink)"
                stroke-width="3"
            />
            <circle cx="20" cy="20" r="12" fill="var(--paper)" stroke="var(--ink)" stroke-width="3" />
            <g transform="translate(20,20)">${iconMarkup}</g>
        </svg>
    `;
    return L.divIcon({
        className: className,
        html,
        iconSize: [40, 52],
        iconAnchor: [20, 52],
        popupAnchor: [0, -46],
    });
}

// Hierdie is 'n persoon-teken wat ons binne die merker kan vertoon wat ons maklik kan hergebruik, dit gebruik Leaflet Marker formaat 
const personIcon = `
    <circle cx="0" cy="-4" r="4" fill="var(--pine-dark)" />
    <path d="M-6 8c0-5 3-8 6-8s6 3 6 8" fill="var(--pine-dark)" />
`;

// Hierdie is 'n book-teken wat ons binne die merker kan vertoon wat ons maklik kan hergebruik, dit gebruik Leaflet Marker formaat
const bookIcon = `
    <rect x="-6" y="-8" width="12" height="16" rx="2" fill="var(--pine-dark)" />
    <line x1="-6" y1="-3" x2="6" y2="-3" stroke="var(--paper)" stroke-width="1.5" />
`;

// Stel ons begin merker
const startIcon = pinIcon({
    fillColor: 'var(--pine)',
    iconMarkup: personIcon,
    className: 'KortpadMarker KortpadMarker--start',
});

// Stel ons einde merker
const endIcon = pinIcon({
    fillColor: 'var(--pine)',
    iconMarkup: bookIcon,
    className: 'KortpadMarker KortpadMarker--end',
});

// Stel ons transisionele merker
const transitionIconInstance = L.divIcon({
    className: 'KortpadMarker KortpadMarker--transition',
    html: `
        <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
            <circle cx="13" cy="13" r="11" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
            <circle cx="8" cy="13" r="1.6" fill="var(--ink)" />
            <circle cx="13" cy="13" r="1.6" fill="var(--ink)" />
            <circle cx="18" cy="13" r="1.6" fill="var(--ink)" />
        </svg>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
});

// Hierdie is die hoof kaart komponent wat gebruik word om die regte kaart te vertoon
function KortpadMap({ selectedCampus, startVenue, endVenue, pageIndex, setPageCount, collapsed }) {
    const [map, setMap] = useState(null);
    const [route, setRoute] = useState(null);
    const [buildingMaps, setBuildingMaps] = useState({});

    // Al die nodige API versoeke vir die kaart om reg te vertoon
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

    // Hier kry bou ons sleutels uit die roete data om 'n stel gebou ids en vloer nommers te kry sodat ons net kaarte gaan haal vir geboue wat ons kort en nie alle kampus gebou kaarte nie
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

    // Hier gebruik ons daardie sleutels om die gebou kaarte te gaan haal
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

    // Hier bou ons bladsye, omdat as ons deur meer as een kaart gaan beweeg dan bou hy 'n bladsy wat die gebruiker deur kan navigeer
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

    useEffect(() => {
        setPageCount?.(pages.length);
    }, [pages]);

    // As 'n kampus kaart nie bestaan nie sal daar 'n plekhouer vertoon inplaas van niks
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

    // Stel die aktiewe huidgie bladsy, kaart en bounds van die huidige kaart vir Leaflet
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

                {/* Teken roete se lyn op die kaart net as active bestaan en ons het koordinate */ }
                {active?.coordinates?.length > 0 && (
                    <>
                        <Polyline
                            key={`${pageIndex}-solid`}
                            positions={active.coordinates}
                            className="KortpadRoute KortpadRoute--solid"
                            pathOptions={{
                                lineJoin: 'round',
                                lineCap: 'round',
                                weight: 6,
                                color: '#42643f'
                            }}
                        />
                        <Polyline
                            key={`${pageIndex}-dashed`}
                            positions={active.coordinates}
                            className="KortpadRoute KortpadRoute--dashed"
                            pathOptions={{
                                lineJoin: 'round',
                                lineCap: 'round',
                                weight: 6,
                                color: '#42643f'
                            }}
                        />
                    </>
                )}
                {/* Hierdie kondisionele toetse bepaal watse teken ons gaan tekens ons gebruik afhangend van waar ons kaart is */}
                {pageIndex >= 0 && active?.coordinates?.length > 0 && (
                    <Marker position={active.coordinates[0]} icon={startIcon} />
                )}

                {pageIndex === pages.length - 1 && active?.coordinates?.length > 0 && (
                    <Marker position={active.coordinates[active.coordinates.length - 1]} icon={endIcon} />
                )}

                {pageIndex !== pages.length - 1 && active?.coordinates?.length > 0 && (
                    <Marker
                        position={active.coordinates[active.coordinates.length - 1]}
                        icon={transitionIconInstance}
                    />
                )}
            </MapContainer>
        </div>
    );
}

export default KortpadMap;