import { useState, useEffect } from "react";

function SearchForm({ onSearch, onTimeChange, selectedCampus, setSelectedCampus, setStartVenue }) {
    const [campuses, setCampuses] = useState([]);
    const [venues, setVenues] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then((response) => response.json())
            .then((data) => {
                setCampuses(data);
                if (data.length > 0) {
                    setSelectedCampus(data[0].campus_id);
                }
            })
            .catch((error) => console.error("Failed to fetch campuses:", error));
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSearch({
            kampus: formData.get("kampusNaam"),
            lokaal: formData.get("lokaal"),
            tyd: formData.get("tyd"),
        });
        
        setStartVenue(formData.get("lokaal"));
    };

    useEffect(() => {
        if (!selectedCampus) {
            setVenues([]);
            return;
        }

        fetch(`http://127.0.0.1:8000/venue/by-campus/${selectedCampus}`)
            .then((response) => response.json())
            .then((data) => setVenues(data))
            .catch((error) => console.error("Failed to fetch venues:", error));
    }, [selectedCampus]);

    return (
        <fieldset>
            <form id="soekForm" onSubmit={handleSubmit}>
                <label htmlFor="kampus">Kampus:</label>
                <select id="kampus" name="kampusNaam"
                    onChange={(e) => {
                        setSelectedCampus(e.target.value);
                    }} required>
                    {campuses.map((campus) => (
                        <option key={campus.campus_id} value={campus.campus_id}>
                            {campus.campus_name}
                        </option>
                    ))}
                </select>

                <label htmlFor="lokaal">Huidige Lokaal:</label>
                <select id="lokaal" name="lokaal" required>
                    {venues.map((venue) => (
                        <option key={venue.venue_id} value={venue.venue_id}>
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

export default SearchForm;
