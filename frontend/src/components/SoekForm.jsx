import { useState, useEffect } from "react";

function SoekForm({ onSoek, onTimeChange }) {
    const [campuses, setCampuses] = useState([]);
    const [venues, setVenues] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then((response) => response.json())
            .then((data) => setCampuses(data))
            .then((error) => console.error("Failed to fetch campuses:", error));

        fetch("http://127.0.0.1:8000/venues")
            .then((response) => response.json())
            .then((data) => setVenues(data))
            .then((error) => console.error("Failed to fetch venues:", error));
    }, []); // [] Needed. Without them on load React indefinitely calls the API

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);


        onSoek({
            kampus: formData.get("kampusNaam"),
            lokaal: formData.get("lokaal"),
            tyd: formData.get("tyd"),
        });
    };

    return (
        <fieldset>
            <form id="soekForm" onSubmit={handleSubmit}>
                <label htmlFor="kampus">Kampus:</label>
                <select id="kampus" name="kampusNaam" required>
                    {campuses.map((campus) => (
                        <option key={campus.campus_id} value={campus.campus_name}>
                            {campus.campus_name}
                        </option>
                    ))}
                    {campuses.map((campus) => (
                        <option key={campus.campus_id} value={campus.campus_name}>
                            {campus.campus_name}
                        </option>
                    ))}
                </select>

                <label htmlFor="lokaal">Huidige Lokaal:</label>
                <select id="lokaal" name="lokaal" required>
                    {venues.map((venue) => (
                        <option key={venue.venue_id} value={venue.venue_name}>
                            {venue.venue_name}
                        </option>
                    ))}
                    {venues.map((venue) => (
                        <option key={venue.venue_id} value={venue.venue_name}>
                            {venue.venue_name}
                        </option>
                    ))}
                </select>

                <label htmlFor="tyd">Tyd (Opsioneel):</label>
                <input 
                    type="time" 
                    id="form-time"
                    onChange={(e) => onTimeChange(e.target.value)} 
                />

                <button type="submit" className="soek-btn" id="soek">
                    Soek Lokaal
                </button>
            </form>
        </fieldset>
    );
}

export default SoekForm;

