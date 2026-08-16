import { useState, useEffect } from "react";
import "../css/Admin.css"
import AdminConfirmPopUp from "./AdminConfirmPopUp";

function AddLokaal({setIsPopupOop, campuses, selectedCampus, setSelectedCampus, buildings, selectedBuilding, setSelectedBuilding}){
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
                <input type="number" id="capacity" name="capacity" min={0} /> <br />
                
                <button type="button" onClick={() => setIsConfirmOop(true)}>Voeg By.</button> 
                <AdminConfirmPopUp 
                    setIsPopupOop={setIsPopupOop}
                    isConfirmOop = {isConfirmOop}
                    setIsConfirmOop = {setIsConfirmOop}
                    lokaalNaam={lokaalNaam}
                    tipe = "ConfirmAdd"
                />

            </fieldset>
        </>
    )
}

function AddToerusting({setIsPopupOop, lokaalNaam}){
    const [isConfirmOop, setIsConfirmOop] = useState(false);
    const [equipNaam, setEquipNaam] = useState("");
    return(
        <fieldset className="VoegBy">
            <h3>Voeg toerusting vir {lokaalNaam} by: </h3>  <br />

            <label htmlFor="equip_name">Toerusting Naam: </label>
            <input
                type="text"
                id="equip_name"
                name="equip_name"
                value={equipNaam}
                onChange={(e) => setEquipNaam(e.target.value)}
            /> <br />

            <label htmlFor="equip_qty">Hoeveelheid: </label>
            <input type="number" id="equip_qty" name="equip_qty" min={1} /> <br />
            
            <button type="button" onClick={() => setIsConfirmOop(true)}>Voeg By.</button> 
            <AdminConfirmPopUp 
                setIsPopupOop={setIsPopupOop}
                isConfirmOop = {isConfirmOop}
                setIsConfirmOop = {setIsConfirmOop}
                tipe = "ConfirmAdd"
                equipNaam={equipNaam}
                lokaalNaam={lokaalNaam}
            /> 

        </fieldset>
    )
}

export default function AdminVoegByPopUp({isPopupOop, setIsPopupOop, tipe, lokaalNaam}) {
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
 
    console.log(isPopupOop);
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
                    />
                )}
                {tipe === "VoegToerustingBy" && <AddToerusting setIsPopupOop={setIsPopupOop} lokaalNaam={lokaalNaam}/>}
            </form>
        </div>
    )
}