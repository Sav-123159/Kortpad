import { useState, useEffect } from "react";
import "../css/Admin.css";
import AdminVoegByPopUp from "../components/AdminVoegByPopUp.jsx";
import AdminConfirmPopUp from "./AdminConfirmPopUp.jsx";
import { createRoot } from 'react-dom/client';
import "../css/Style.css";

export default function AdminToerusting(){
    const [isPopupOop, setIsPopupOop] = useState(false);
    const [isDeleteOop, setIsDeleteOop] = useState(false);

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

    const [equipment, setEquipment] = useState([]);
    const [selectedEquip, setSelectedEquip] = useState(null);
    useEffect(() => {
        if (selectedVenue === "") return;

        fetch(`http://127.0.0.1:8000/equipment/by-venue_id/${selectedVenue}`)
            .then(res => res.json())
            .then(data => {
                // console.log("EQUIPMENT:", data);
                setEquipment(data);
            })
            .catch(error => console.error(error));

    },[selectedVenue]);

    const selectedEquipName = equipment.find(item => item.equip_id === selectedEquip)?.equip_name;
    const deleteEquip = () => {
        setEquipment(equipment.filter(item => item.equip_id !== selectedEquip));

        setIsDeleteOop(false);
        setSelectedEquip(null);
    };

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



    const [editingEquip, setEditingEquip] = useState(null);
    const [tempValue, setTempValue] = useState({});

    const selectedVenueName = venues.find(
        venue => venue.venue_id === selectedVenue
    )?.venue_name;

    return(
        <div className="Info Toerusting__Inligting" data-for-tab="Toerusting">
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

                &ensp;&ensp;
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

                &ensp;&ensp;
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
            <div>
                
                {(!selectedCampus || !selectedBuilding || !selectedVenue) && (
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
                )}
                
                {equipment.map((item) => (
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
                ))}
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