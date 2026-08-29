import { useState, useEffect } from "react";
import "../css/Admin.css"
import AdminConfirmPopUp from "./AdminConfirmPopUp";

function AddLokaal({setIsPopupOop, campuses, selectedCampus, setSelectedCampus, buildings, selectedBuilding, setSelectedBuilding, setVenues}){
        const [capacity, setCapacity] = useState("");
        const hanteerAdd = async () => {
    try {
        const res = await fetch("http://127.0.0.1:8000/venue", {
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify({
            building_id: parseInt(selectedBuilding),
            venue_name: lokaalNaam,
            capacity: parseInt(capacity),
        }),
        });
        const data = await res.json();
        // console.log("Venue added:", data);

        // Herlaai die volledige lys venues ná insert
        const res2 = await fetch(`http://127.0.0.1:8000/venues/by-building/${selectedBuilding}`);
        const allVenues = await res2.json();
        setVenues(allVenues);

        setIsPopupOop(false);
    } catch (err) {
        console.error("Error adding venue:", err);
    }
};

    
    const [isConfirmOop, setIsConfirmOop] = useState(false);
    const [lokaalNaam, setLokaalNaam] = useState("");
    return(
        <>
            <fieldset className="VoegBy">
                <h3>Voeg 'n lokaal by: </h3>

                <label htmlFor="kampus">Kampus: </label>
                <select
                    name="kampus"
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
                </select> <br />

                <label htmlFor="building">Gebou: </label>
                <select
                    name="building"
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
                </select> <br />

                <label htmlFor="venue_name">Lokaal Naam:</label>
                <input type="text" id="venue_name" name="venue_name" value={lokaalNaam}
                    onChange={(e) => setLokaalNaam(e.target.value)}/> <br />

                <label htmlFor="capacity">Kapasiteit: </label>
                <input type="number" id="capacity" name="capacity" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)}/> <br />
                
                <button type="button" onClick={() => setIsConfirmOop(true)}>Voeg By.</button> 
                <AdminConfirmPopUp 
                    setIsPopupOop={setIsPopupOop}
                    isConfirmOop = {isConfirmOop}
                    setIsConfirmOop = {setIsConfirmOop}
                    lokaalNaam={lokaalNaam}
                    tipe = "ConfirmAdd"
                    onConfirm={hanteerAdd}
                />

            </fieldset>
        </>
    )
}

function AddToerusting({ setIsPopupOop, lokaalNaam, venueId, setEquipment }) {
    const [isConfirmOop, setIsConfirmOop] = useState(false);
    const [equipNaam, setEquipNaam] = useState("");
    const [equipQty, setEquipQty] = useState(1);

    const hanteerAdd = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/equipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    venue_id: venueId,
                    equip_name: equipNaam,
                    equip_qty: parseInt(equipQty),
                }),
            });
            const data = await res.json();
            // console.log("Equipment added:", data);

            const res2 = await fetch(`http://127.0.0.1:8000/equipment/by-venue_id/${venueId}`);
            const allEquip = await res2.json();
            setEquipment(allEquip);

            setIsPopupOop(false);
        } catch (err) {
            console.error("Error adding equipment:", err);
        }
    };

    return (
        <fieldset className="VoegBy">
            <h3>Voeg toerusting vir {lokaalNaam} by: </h3> <br />

            <label htmlFor="equip_name">Toerusting Naam: </label>
            <input
                type="text"
                id="equip_name"
                name="equip_name"
                value={equipNaam}
                onChange={(e) => setEquipNaam(e.target.value)}
            /> <br />

            <label htmlFor="equip_qty">Hoeveelheid: </label>
            <input
                type="number"
                id="equip_qty"
                name="equip_qty"
                min={1}
                value={equipQty}
                onChange={(e) => setEquipQty(e.target.value)}
            /> <br />

            <button type="button" onClick={() => setIsConfirmOop(true)}>Voeg By.</button>
            <AdminConfirmPopUp
                setIsPopupOop={setIsPopupOop}
                isConfirmOop={isConfirmOop}
                setIsConfirmOop={setIsConfirmOop}
                equipNaam={equipNaam}
                lokaalNaam={lokaalNaam}
                tipe="ConfirmAdd"
                onConfirm={hanteerAdd}
            />
        </fieldset>
    );
}


export default function AdminVoegByPopUp({isPopupOop, setIsPopupOop, tipe, lokaalNaam, setVenues, setEquipment, venueId }) {
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
 
    // console.log(isPopupOop);
    if (!isPopupOop){
        return null;
    }

    return(
        // As jy buite die vorm klik maak hy toe
        <div className="Popup_Houer" onClick={() => setIsPopupOop(false)}>
            {/* As iemand binne die vorm klik moet hy nie toe maak nie */}
            <form className="voegby_vorm" onClick={(e)=> e.stopPropagation()}>
                {tipe === "VoegLokaalBy" && (
                    <AddLokaal
                        setIsPopupOop={setIsPopupOop}
                        campuses={campuses}
                        selectedCampus={selectedCampus}
                        setSelectedCampus={setSelectedCampus}
                        buildings={buildings}
                        selectedBuilding={selectedBuilding}
                        setSelectedBuilding={setSelectedBuilding}
                        setVenues={setVenues}
                    />
                )}
                {tipe === "VoegToerustingBy" && 
                    <AddToerusting 
                        setIsPopupOop={setIsPopupOop} 
                        lokaalNaam={lokaalNaam}
                        venueId={venueId}
                        setEquipment={setEquipment}
                    />}
            </form>
        </div>
    )
}