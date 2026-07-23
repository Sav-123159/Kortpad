// Form-komponent waar die gebruiker kampus, huidige lokaal, en tyd kies om vir 'n beskikbare studielokaal te soek
// Fieldset komponent
// SoekForm vat die onSoek funksie as prop, wat die soekdata hanteer wanneer die vorm ingedien word
// Die onSoek funksie word van die App-komponent af gestuur, en sal die beskikbare lokale filter en deurgee aan Resultate en KortpadMap
function SoekForm({ onSoek }) {
    // Hanteer die vorm indiening, en stuur die data na die onSoek funksie
    const handleSubmit = (e) => {
        // Voorkom dat die vorm die bladsy herlaai
        e.preventDefault();
        // Skep 'n FormData objek van die vorm, en stuur die data na die onSoek funksie
        const formData = new FormData(e.target);
        // Stuur die data na die onSoek funksie as 'n objek met kampus, lokaal, en tyd
        onSoek({
            kampus: formData.get("kampusNaam"),
            lokaal: formData.get("lokaal"),
            tyd: formData.get("tyd"),
        });
    };

    // Render die vorm met 'n veld vir kampus, lokaal, en tyd, en 'n soek-knoppie
    return (
        <fieldset>
            <form id="soekForm" onSubmit={handleSubmit}>
                <label htmlFor="kampus">Kampus:</label>
                <select id="kampus" name="kampusNaam" required>
                    <option value="Leriba">Leriba</option>
                    <option value="GerhardStraat">GerhardStraat</option>
                    <option value="Paarl">Paarl</option>
                </select>

                <label htmlFor="lokaal">Huidige Lokaal:</label>
                <select id="lokaal" name="lokaal" required>
                    <option value="Sowel-As">Sowel-As</option>
                    <option value="Bosvy">Bosvy</option>
                    <option value="Koning Protea">Koning Protea</option>
                </select>

                <label htmlFor="tyd">Tyd (Opsioneel):</label>
                <input type="time" id="tyd" name="tyd" />

                <button type="submit" className="soek-btn" id="soek">
                    Soek Lokaal
                </button>
            </form>
        </fieldset>
    );
}

// Stuur die SoekForm-komponent na die App-komponent
export default SoekForm;