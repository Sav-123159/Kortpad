
// Laai die nodige modules in
// react-leaflet vir die kaart-rendering
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
// leaflet vir die kaart-logika
import 'leaflet/dist/leaflet.css';

// KortpadMap-komponent vat 'n prop lokale, pad, en middelpunt, en render 'n kaart met die beskikbare lokale as pins, en die kortste pad as 'n lyn
function KortpadMap({ lokale = [], pad = [], middelpunt = [-25.7479, 28.2293] }) {
    // Render die kaart met die beskikbare lokale as pins, en die kortste pad as 'n lyn
    return (
        // MapContainer is die hoof-komponent van react-leaflet wat die kaart render
        // center is die middelpunt van die kaart, zoom is die zoom-vlak, style is die styl van die kaart
        <MapContainer
            center={middelpunt}
            zoom={17}
            style={{ height: '500px', width: '100%', borderRadius: '15px'}}
        >
            {/* TileLayer is die laag wat die kaart-afbeeldings wys */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap bydraers'
            />
            {/* Marker is die pin wat die lokaal wys */}
            {lokale.map((lokaal) => (
                <Marker key={lokaal.id} position={[lokaal.lat, lokaal.lng]}>
                    <Popup>
                        <b>{lokaal.naam}</b>
                        <br />
                        {lokaal.beskikbaar ? 'Beskikbaar' : 'Besig'}
                    </Popup>
                </Marker>
            ))}
            {/* Polyline is die lyn wat die kortste pad wys */}
            {pad.length > 0 && (
                <Polyline positions={pad} pathOptions={{ color: '#8a5a34', weight: 4 }} />
            )}
        </MapContainer>
    );
}

export default KortpadMap;