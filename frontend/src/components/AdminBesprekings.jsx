import { useState, useEffect } from "react";
import "../css/Admin.css"
import AdminConfirmPopUp from "./AdminConfirmPopUp.jsx";

export default function AdminBesprekings(){
    const [isConfirmOop, setIsConfirmOop] = useState(false);

    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
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
    return(
        <div className="Info Besprekings__Inligting" data-for-tab="Besprekings">
            <h2>Besprekings</h2>
            &ensp;Besprekings kan hier gemaak word om ander besprekings te oorskryf.
            <form>
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
                    <br/>

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

                    <label htmlFor="name">Naam van bespreking</label>
                    <input type="text" id="name" name="name"/> <br/>

                    <label htmlFor="kapasiteit">Kapasiteit</label>
                    <input type="number" id="kapasiteit" name="kapasiteit" 
                    value={capacity} onChange={(e) => setCapacity(e.target.value)}/> <br/>

                    <label htmlFor="tyd">Tyd</label>
                    <input type="time" id="time" name="time"/> <br/>

                </fieldset>
                
                <button type="submit">Bevestig</button>     
            </form>
            <AdminConfirmPopUp
                isConfirmOop={isConfirmOop}
                setIsConfirmOop={setIsConfirmOop}
                setIsPopupOop={() => {}}
                tipe="CapacityError"
                venueCapacity={selectedVenueData?.capacity}
                requestedCapacity={capacity}
            />
        </div>
    )
}