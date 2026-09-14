// Invoere
import { useState, useEffect } from "react";

/*
    Laat die gebruiker 'n kampus, lokaal en 'n optionele tyd kies om na beskikbare lokale te soek. 
    Haal kampusse en gepaste lokale van die API af, en gee die opsies wat gekies is terug na die ouer-komponent
*/
function SearchForm({ onSearch, onTimeChange, selectedCampus, setSelectedCampus, setStartVenue }) {
    const [campuses, setCampuses] = useState([]);
    const [venues, setVenues] = useState([]);

    /*
        Haal die lys van kampusse van die API af,
        stel die eerste kampus as die geselekteerde kampus
    */
    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then((response) => response.json())
            .then((data) => {
                setCampuses(data);
                //Stel eerste kampus as die verstek waarde
                if (data.length > 0) {
                    setSelectedCampus(data[0].campus_id);
                }
            })
            .catch((error) => console.error("Failed to fetch campuses:", error));
    }, []);


    /*
        Verwerk soek vorm indiening
        Keer dat die vorm die blad herlaai, en haal die vormdata
        Stuur die data na die ouer kompient se onSearch funksie
        Stel die begin posisie van die pad verwerking na die huidige lokaal gekies
    */
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

    /*
        Haal die lokale wat aan die gekose kampus behoort
        Indien daar geen kampus gekies is nie, is daar nie lokale om te laai nie
    */
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

    // HTML uitvoer
    return (
        <fieldset>
            <form id="soekForm" onSubmit={handleSubmit}>
                <label htmlFor="kampus">Kampus:</label>
                <select id="kampus" name="kampusNaam"
                    onChange={(e) => {
                        //Verander dadelik die geselekteerde kampus,
                        //sodat die gepaste lokale gelaai word
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

//Uitvoer van die SearchForm funksie
export default SearchForm;
