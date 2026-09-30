// imports om data te kan verander
import { useState, useEffect } from "react";
import "../css/Admin.css"
import AdminConfirmPopUp from "./AdminConfirmPopUp.jsx";
import { useAuth } from "./AuthContext.jsx";

// Formateer die datum laat ek hom kan stoor/gebruik
// Die offsetDate maak dat ek die korrekte tyd kry vir as ek dit na ISO formaat omskakel
// Ek split die date time om net die datum te kry
function formatDate(date) {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split("T")[0]; // YYYY-MM-DD
}

// Formateer die tyd laat ek hom kan stoor/gebruik
// Hier kry ek nou net die tyd en formateer hom 
function formatTime(date) {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split("T")[1].split(".")[0]; // HH:MM:SS
}

// Maak die funksie wat die data regmaak om na die backend gestuur te word
// Hierdie is spesifiek vir om n nuwe bespreking te maak
function maakCreatePayload(start, end, user_id, selectedVenue) {
    return {
        venue_id: Number(selectedVenue),
        user_id: user_id,
        start_time: formatTime(start),
        end_time: formatTime(end),
        booking_date: formatDate(start)
    };
}

// Maak die funksie wat die data regmaak om na die backend gestuur te word
// Hierdie is spesifiek vir oorskryf van funksie
function maakUpdatePayload(start, end, user_id, selectedVenue) {
    return {
        venue_id: Number(selectedVenue),
        user_id: user_id,
        start_time: formatTime(start),
        end_time: formatTime(end),
        booking_date: formatDate(start)
    };
}

// Hierdie roep die POST om die bespreking te skep
async function boekBespreking(payload) {
    try {
        const res = await fetch("http://127.0.0.1:8000/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`POST failed: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Fout met POST:", err);
        alert("Kon nie bespreking skep nie." + err.message);
    }
}

// Hierdie roep die PUT om n bestaande bespreking te oorskryf
async function oorskryfBespreeking(bookingId, payload) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/booking/${bookingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`PUT failed: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Fout met PUT:", err);
        alert("Kon nie bespreking oorskryf nie." + err.message);
    }
}

// Wanneer die gebruiker Ja se met confirmation word die funksie geroep
// Dit bepaal of daar klaar 'n booking is in die tyd wat die admin n booking wil maak
async function hanteerConfirm(selectedVenue, duur, datumTyd, user_id) {
    const start = new Date(datumTyd);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + Number(duur));

    try {
        const res = await fetch(
            `http://127.0.0.1:8000/booking/check-conflict/${selectedVenue}?booking_date=${formatDate(start)}&start_time=${formatTime(start)}&end_time=${formatTime(end)}`
        );

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Conflict check failed: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const result = await res.json();
        // As die backend se daar is konflip dan vat ek die 1ste bestaande booking uit die lys, 
        // roep die PUT en stuur bestaande booking se id sodat die backend weet watter booking verander moet word
        //Anders skep ek net n nuwe een :)
        if (result.conflict) {
            const existingBooking = result.bookings[0];
            await oorskryfBespreeking(
                existingBooking.booking_id,
                maakUpdatePayload(start, end, user_id, selectedVenue)
            );
        } else {
            await boekBespreking(
                maakCreatePayload(start, end, user_id, selectedVenue)
            );
        }
    } catch (err) {
        console.error("Fout met hanteerConfirm:", err);
        alert("Kon nie bevestig nie: " + err.message);
    }
}

// hierdie funksie is waar die vorm is om n bespreking te skep
export default function AdminBesprekings() {
    const [isConfirmOop, setIsConfirmOop] = useState(false);

    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");

    const {user} = useAuth();
    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then(res => res.json())
            .then(data => setCampuses(data))
            .catch(error => console.error(error));
    }, []);

    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState("");
    useEffect(() => {
        if (selectedCampus === "") return;

        fetch(`http://127.0.0.1:8000/buildings/by-campus/${selectedCampus}`)
            .then(res => res.json())
            .then(data => setBuildings(data))
            .catch(error => console.error(error));

    }, [selectedCampus]);

    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState("");
    useEffect(() => {
        if (selectedBuilding === "") return;

        fetch(`http://127.0.0.1:8000/venues/by-building/${selectedBuilding}`)
            .then(res => res.json())
            .then(data => {
                setVenues(data);
            })
            .catch(error => console.error(error));

    }, [selectedBuilding]);

    const selectedVenueData = venues.find(venue => venue.venue_id === Number(selectedVenue));
    const [capacity, setCapacity] = useState("");

    const [duur, setDuur] = useState("");
    const [datumTyd, setDatumTyd] = useState("");

    const user_id = user.user_id;

    const clearForm = () => {
        setSelectedCampus("");
        setSelectedBuilding("");
        setSelectedVenue("");
        setDuur("");
        setDatumTyd("");
        setCapacity("");
    }

    return (
        <div className="Info Besprekings__Inligting" data-for-tab="Besprekings">
            <h2>Besprekings</h2>
            &ensp;Besprekings kan hier gemaak word om ander besprekings te oorskryf.
            <form onSubmit={(e) => { e.preventDefault(); setIsConfirmOop(true); }}>
                <fieldset>
                    <label htmlFor="kampus">Kampus: </label>
                    <select name="kampus" id="kampus"
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                    >
                        <option value="">Kies 'n kampus</option>

                        {campuses.map((campus) => (
                            <option
                                key={campus.campus_id}
                                value={campus.campus_id}
                            >
                                {campus.campus_name}
                            </option>
                        ))}
                    </select>
                    <br />

                    <label htmlFor="gebou">Gebou: </label>
                    <select name="gebou" id="gebou"
                        value={selectedBuilding}
                        onChange={(e) => setSelectedBuilding(e.target.value)}
                    >
                        <option value="">Kies 'n gebou</option>

                        {buildings.map((building) => (
                            <option
                                key={building.building_id}
                                value={building.building_id}
                            >
                                {building.building_name}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="lokaal">Lokaal: </label>
                    <select name="lokaal" id="lokaal"
                        value={selectedVenue}
                        onChange={(e) => setSelectedVenue(e.target.value)}
                    >
                        <option value="">Kies 'n lokaal</option>

                        {venues.map((venue) => (
                            <option
                                key={venue.venue_id}
                                value={venue.venue_id}
                            >
                                {venue.venue_name}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="duur">Duur van bespreking: </label>
                    <select
                        id="duur"
                        value={duur}
                        onChange={(e) => setDuur(e.target.value)}
                    >
                        <option value="">Kies duur</option>
                        <option value="60">1 uur</option>
                        <option value="120">2 ure</option>
                        <option value="180">3 ure</option>
                        <option value="240">4 ure</option>
                        <option value="480">Hele dag (8 ure)</option>
                    </select>


                    <label htmlFor="kapasiteit">Kapasiteit: </label>
                    <input type="number" id="kapasiteit" name="kapasiteit"
                        value={capacity} onChange={(e) => setCapacity(e.target.value)}
                    />
                    <br />

                    <label htmlFor="dateTime">Datum en Tyd: </label>
                    <input type="datetime-local" id="dateTime" name="dateTime"
                        value={datumTyd}
                        onChange={(e) => setDatumTyd(e.target.value)}
                    />
                    <br />

                </fieldset>
                <button type="submit">Bevestig</button>
            </form>
            <AdminConfirmPopUp
                isConfirmOop={isConfirmOop}
                setIsConfirmOop={setIsConfirmOop}
                setIsPopupOop={() => { }}
                tipe="HanteerBespreking"
                venueCapacity={selectedVenueData?.capacity}
                requestedCapacity={capacity}
                lokaalNaam={selectedVenueData?.venue_name}
                duur={duur}
                datumTyd={datumTyd}
                selectedCampus={selectedCampus}
                selectedBuilding={selectedBuilding}
                selectedVenue={selectedVenue}
                onConfirm={async () => {await hanteerConfirm(selectedVenue, duur, datumTyd, user_id); clearForm();}}
            />

        </div>
    )
}