import { useState, useEffect } from "react";
import "../css/Admin.css";
import AdminVoegByPopUp from "../components/AdminVoegByPopUp.jsx";
import AdminConfirmPopUp from "./AdminConfirmPopUp.jsx";
import "../css/Style.css";

export default function AdminLokaleInfo(){
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
    const [selectedVenue, setSelectedVenue] = useState(null);

    useEffect(() => {
        if (selectedBuilding === "") return;

        fetch(`http://127.0.0.1:8000/venues/by-building/${selectedBuilding}`)
            .then(res => res.json())
            .then(data => setVenues(data))
            .catch(error => console.error(error));
    }, [selectedBuilding]);

    const selectedVenueName = venues.find(venue => venue.venue_id === selectedVenue)?.venue_name;

    const deleteVenue = async () => {
        try {
            await fetch(`http://127.0.0.1:8000/venue/${selectedVenue}`, {
                method: "DELETE",
            });

            setVenues(venues.filter(venue => venue.venue_id !== selectedVenue));
            setIsDeleteOop(false);
            setSelectedVenue(null);
        } catch (err) {
            console.error("Error deleting venue:", err);
        }
    };

    const [editingName, setEditingName] = useState(null);
    const [tempName, setTempName] = useState({});
      
    return(
        <div className="Info Lokale__Inligting" data-for-tab="Lokale">
            <div className="Lokaal__titel">
                <h2>Lokale</h2>

                <button onClick={() => setIsPopupOop(true)}>Voeg lokaal by.</button>
                <AdminVoegByPopUp 
                    isPopupOop={isPopupOop}
                    setIsPopupOop={setIsPopupOop}
                    tipe="VoegLokaalBy"
                    setVenues={setVenues}
                />
            </div>
            &ensp;Lokale gerigistreerd <br/>
            <div className="Lokale__kampus">
                <h3>Kampus: </h3>
                <select
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                >
                    <option value="">Kies 'n kampus</option>
                    {campuses.map((campus) => (
                        <option key={campus.campus_id} value={campus.campus_id}>
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
                        <option key={building.building_id} value={building.building_id}>
                            {building.building_name}
                        </option>
                    ))}
                </select>
            </div>
            
            <div>
                {(!selectedCampus || !selectedBuilding || venues.length === 0) ? (
                    <div className="loading-overlay">
                        <div className="deco">
                            <svg width="320" height="170" viewBox="0 0 320 170">
                                <circle cx="80" cy="85" r="10" className="node" id="node1" />
                                <circle cx="120" cy="35" r="10" className="node" id="node2" />
                                <circle cx="170" cy="135" r="10" className="node" id="node3" />
                                <circle cx="210" cy="85" r="10" className="node" id="node4" />
                                <path
                                    className="animated-path"
                                    d="M80 85 C95 65 110 55 140 85 C170 115 195 105 210 85"
                                />
                            </svg>
                            <img src="../../public/LOGO_Cropped.jpeg" className="login-logo" />
                        </div>
                    </div>
                ) : (
                    venues.map((venue) => (
                        <div className="Lokale__lys" key={venue.venue_id}>
                            <div>
                                <h3>Lokaal Naam:</h3>
                                <input
                                    type="text"
                                    value={editingName === venue.venue_id ? tempName[venue.venue_id] : venue.venue_name}
                                    readOnly={editingName !== venue.venue_id}
                                    onChange={(e) => {
                                        setTempName({ ...tempName, [venue.venue_id]: e.target.value });
                                    }}
                                />
                                <button
                                    className={editingName === venue.venue_id ? "Edit_Aktief" : ""}
                                    onClick={async () => {
                                        if (editingName !== venue.venue_id) {
                                            setEditingName(venue.venue_id);
                                            setTempName({ ...tempName, [venue.venue_id]: venue.venue_name });
                                        } else {
                                            try {
                                                await fetch(`http://127.0.0.1:8000/venue/${venue.venue_id}`, {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        building_id: selectedBuilding,   
                                                        venue_name: tempName[venue.venue_id],
                                                        capacity: venue.capacity ?? 0,
                                                        floor: venue.floor ?? 0
                                                    }),
                                                });

                                                setVenues(
                                                    venues.map((ven) =>
                                                        ven.venue_id === venue.venue_id
                                                            ? { ...ven, venue_name: tempName[venue.venue_id] }
                                                            : ven
                                                    )
                                                );
                                                setEditingName(null);
                                            } catch (err) {
                                                console.error("Error updating venue:", err);
                                            }
                                        }
                                    }}
                                >
                                    {editingName === venue.venue_id ? "\u2713" : "\u270E"}
                                </button>


                                {editingName === venue.venue_id && (
                                    <button
                                        className="Edit_Aktief"
                                        onClick={() => {
                                            setTempName({ ...tempName, [venue.venue_id]: venue.venue_name });
                                            setEditingName(null);
                                        }}
                                    >
                                        &#x2716;
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setIsDeleteOop(true);
                                    setSelectedVenue(venue.venue_id);
                                }}
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
                    onConfirm={deleteVenue}
                    itemName={selectedVenueName}
                />
            </div>
        </div>           
    )
}
