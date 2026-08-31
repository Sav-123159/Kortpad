// Imports vir die komponent
// useState word ingevoer om data te stoor wat in die komponent kan verander
// useEffect word gebruik wanneer ons wil hê iets in die komponent moet gebeur as hy laai, of wanneer sekere data verander word
import { useState, useEffect } from "react";
import "../css/Style.css";
import "../css/Admin.css";
import AdminVoegByPopUp from "../components/AdminVoegByPopUp.jsx";
import AdminConfirmPopUp from "./AdminConfirmPopUp.jsx";
import { createRoot } from 'react-dom/client';


// Kan hierdie komponent vanuit ander lêers invoer bv. vir die AdminContainer
export default function AdminToerusting(){
    // Boolean state om die popup oop en toe te maak
    const [isPopupOop, setIsPopupOop] = useState(false);
    const [isDeleteOop, setIsDeleteOop] = useState(false);

    // skikking veranderlike wat die kampusse van die databasis af laai in die veranderlike in
    // Die selectedCampus hou tred met watse kampus die gebruiker kies
    // useEffect word hier gebruik om die kampusse vanaf die databasis te laai in die komponent in
    // die leë [] se vir die useEffect om te laai wanneer die komponent oopgemaak word
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then(res => res.json())
            .then(data => setCampuses(data))
            .catch(error => console.error(error));
    }, []);

    // Hierdie afdeling doen dieselfde as die kampusse
    // die [] aan die einde sê net vir die useEffect om te laai wanneer 'n kampus gekies word
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState("");
    useEffect(() => {
        if (selectedCampus === "") return;

        fetch(`http://127.0.0.1:8000/buildings/by-campus/${selectedCampus}`)
            .then(res => res.json())
            .then(data => setBuildings(data))
            .catch(error => console.error(error));

    }, [selectedCampus]);

    // Hierdie afdeling doen dieselfde as die kampusse
    // Die useEffect laai eers as die gebou gekies word
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

    // Hierdie afdeling doen dieselfde as die kampusse
    // Die useEffect laai eers as die venue gekies word
    const [equipment, setEquipment] = useState([]);
    const [selectedEquip, setSelectedEquip] = useState(null);
    useEffect(() => {
        if (selectedVenue === "") return;

        fetch(`http://127.0.0.1:8000/equipment/by-venue_id/${selectedVenue}`)
            .then(res => res.json())
            .then(data => {
                setEquipment(data);
            })
            .catch(error => console.error(error));

    },[selectedVenue]);

    // Kry die naam van die lokaal gebaseer op sy id en as 'n naam nie gevind word nie kry ons 'undefined' eerder as 'n error
    const selectedEquipName = equipment.find(item => item.equip_id === selectedEquip)?.equip_name;

    // Verwyder die equipment uit die databasis uit
    // async want ons wag vir die backend
    // setEquipment skikking word nou nuut gelaai met die toerusting sonder die toerusting wat nou verwyder is
    // Maak die delete popup toe en die geselekteerde toerusting is nou null, want hy was verwyder
    const hanteerDeleteEquip = async () => {
        try {
            await fetch(`http://127.0.0.1:8000/equipment/${selectedEquip}`, {
                method: "DELETE",
            });
            setEquipment(equipment.filter(item => item.equip_id !== selectedEquip));
            setIsDeleteOop(false);
            setSelectedEquip(null);
        } catch (err) {
            console.error("Error deleting equipment:", err);
        }
    };

    // Veranderlikes om die toerusting hoeveelheid te edit
    // editingEquip hou die ID van die toerusting se hoeveelheid wat nou geedit word
    // tempValue hou die tydelike hoeveelheid terwyl die gebruiker dit verander
    const [editingEquip, setEditingEquip] = useState(null);
    const [tempValue, setTempValue] = useState({});

    // Soek die lokaal wat tans gekies 
    // Hierdie is vir die popup voeg by vorm om te se vir watter lokaal ek die nuwe toerusting byvoeg
    const selectedVenueName = venues.find(venue => venue.venue_id === selectedVenue)?.venue_name;

    // Hier is al die komponente wat ons op die skerm kan sien wat gelaai word
    return(

        <div className="Info Toerusting__Inligting" data-for-tab="Toerusting">
            {/* Toerusting se opskrif en die knoppie om nuwe toerusting by te voeg */}
            {/* Stuur data na die AdminVoegByPopUp deur props te gebruik */}
            <div className="Toerusting__title">
                <h2>Lokale Toerusting</h2>

                <button onClick={() => setIsPopupOop(true)}>Voeg toerusting by.</button>
                <AdminVoegByPopUp 
                    isPopupOop = {isPopupOop}
                    setIsPopupOop={setIsPopupOop}
                    tipe="VoegToerustingBy"
                    lokaalNaam={selectedVenueName}
                    setEquipment={setEquipment}
                    venueId={selectedVenue}
                />
            </div>
            &ensp;Toerusting in elke lokaal  
            {/* Select drop downs om kampus, gebou en die venue te kies */}
            {/* die value in die select beteken react kan beheer watter waarde tans gekies word */}
            {/* die onchange kry die gekose toerusting se id en verander die state van setSelected_____ */}
            {/* die .map, skep die skikking van al die waardes om in <option>s */}
            {/* die ids word gebruik as die keys om die lys met .map() te skep */}
            <div className="Lokale__kampus">
                <h3>Kampus: </h3>
                
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

                <h3>Gebou:</h3>
                <select 
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

                <h3>Lokaal: </h3>
                <select
                    name="lokale"
                    id="lokale"
                    value={selectedVenue}
                    onChange={(e) => setSelectedVenue(Number(e.target.value))}
                    
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
            </div>

            {/* Die toerusting word hier vertoon */}
            {/* Ek gebruik basically 'n if konsep om te bepaal of ek die loading screen wys, of die toerusting */}
            {/* Die loading screen word geteken met svg wat 'n sirkel en n path teken en dan die logo onder aan vertoon */}
            {/* Elke toerusting kry sy eie div om in te vertoon en word met 'n map funksie vertoon */}
            <div>
                {(!selectedCampus || !selectedBuilding || !selectedVenue) ? (
                    <div className="loading-overlay">
                        <div className="deco">
                            <svg width="320" height="170" viewBox="0 0 320 170">
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
                    </div>
                ) : (
                    // Editing van toerusting
                    // by value gebruik ek weer 'n if konsep om te bepaal watter hoeveelheid word vertoon (databasis sin of temp geedited hoeveelheid)
                    // readonly is van toepassing net as die hoeveelheid nie huidiglik geedit word nie
                    // onChange stoor die nuwe hoeveelheid in die setTempValue
                        // ...tempValue -> kopieer die bestaande hoeveelheid in die objek sodat ons nie die bestaande state direk verander nie
                        // elke toerusting se tydelike hoeveelheid word volgens sy id gestoor
                        // e.target.value -> hou die nuwe hoeveelheid
                    // PUT request word gemaak om die hoeveelheid te verander in die databasis
                    // Die setEquipment update nadat die hoeveelheid verander is
                        // Gebruik weer 'n if konsep om te bepaal of die die toerusting is wat verander was, as hy is dan maak ek n kopie daarvan en verander net sy hoeveelheid
                    // Die knoppie gebruik ook 'n if konsep, om te verander van die edit ikoon na n regmerkie as hy geklik word
                        // Wys die kruisie as die toerusting geedit word, as die kruisie geklik word, dan vee hy die verandering uit en gebruik die onveranderde hoeveelheid
                    // Delete knoppie stuur 'n confirm popup deur as geklik word en die id van die toerusting word gestoor in die knoppie  
                    equipment.map((item) => (
                        <div className="Lokale__equip" key={item.equip_id}>

                            <label>
                                {item.equip_name}
                            </label>

                            <div>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={editingEquip === item.equip_id ? tempValue[item.equip_id] : item.equip_qty}
                                    readOnly={editingEquip !== item.equip_id}
                                    onChange={(e) => {
                                        setTempValue({ ...tempValue, [item.equip_id]: e.target.value });
                                    }}
                                />

                                <button
                                    className={editingEquip === item.equip_id ? "Edit_Aktief" : ""}
                                    onClick={async () => {
                                        if (editingEquip !== item.equip_id) {
                                            setEditingEquip(item.equip_id);
                                            setTempValue({ ...tempValue, [item.equip_id]: item.equip_qty });
                                        } else {
                                            try{
                                                await fetch(`http://127.0.0.1:8000/equipment/${item.equip_id}`, {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        venue_id: item.venue_id,
                                                        equip_name: item.equip_name,
                                                        equip_qty: tempValue[item.equip_id]
                                                    }),
                                                });

                                                setEquipment(
                                                    equipment.map((equip) =>
                                                        equip.equip_id === item.equip_id 
                                                        ? { ...equip, equip_qty: tempValue[item.equip_id]}
                                                        : equip
                                                    )
                                                );
                                                setEditingEquip(null);
                                                
                                            }catch (err){
                                                console.error("Error updating venue: ", err);
                                            }
                                            
                                        }
                                    }}

                                >
                                    {editingEquip === item.equip_id ? "\u2713" : "\u270E"}
                                </button>

                                {editingEquip === item.equip_id && (
                                    <button 
                                        className={editingEquip === item.equip_id ? "Edit_Aktief" : ""}
                                        onClick={() => {
                                        setTempValue({ ...tempValue, [item.equip_id]: item.equip_qty});
                                        setEditingEquip(null);
                                    }}>
                                        &#x2716;
                                    </button>
                                )}
                    
                            </div>

                            <button onClick={() => {
                                setIsDeleteOop(true);
                                setSelectedEquip(item.equip_id)}}
                            >
                                &#x1F5D1;
                            </button>
                        </div>
                    ))
                )}
                <AdminConfirmPopUp
                    isConfirmOop={isDeleteOop}
                    setIsConfirmOop={setIsDeleteOop}
                    tipe="ConfirmDel"
                    onConfirm={hanteerDeleteEquip}
                    itemName={selectedEquipName}
                />
            </div>              
        </div>
    )
}