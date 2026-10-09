// Imports vir die komponent
// useState word ingevoer om data te stoor wat in die komponent kan verander
// useEffect word gebruik wanneer ons wil he iets in die komponent moet gebeur as hy laai, of wanneer sekere data verander word
import { useState, useEffect } from "react";
import "../css/Admin.css";
import "../css/Style.css";
import AdminVoegByPopUp from "../components/AdminVoegByPopUp.jsx";
import AdminConfirmPopUp from "./AdminConfirmPopUp.jsx";

// Kan hierdie komponent vanuit ander lêers invoer bv. vir die AdminContainer
export default function AdminLokaleInfo({setCollapsed, collapsed, setMobieleLPaneel}){
    // Boolean state om die popup oop en toe te maak
    const [isPopupOop, setIsPopupOop] = useState(false);
    
    const [editingCapacity, setEditingCapacity] = useState(null);
    const [tempCapacity, setTempCapacity] = useState({});

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
    const [selectedVenue, setSelectedVenue] = useState(null);
    useEffect(() => {
        if (selectedBuilding === "") return;

        fetch(`http://127.0.0.1:8000/venues/by-building/${selectedBuilding}`)
            .then(res => res.json())
            .then(data => setVenues(data))
            .catch(error => console.error(error));
    }, [selectedBuilding]);

    // Kry die naam van die lokaal gebaseer op sy id en as 'n naam nie gevind word nie, kry ons 'undefined' eerder as 'n error
    const selectedVenueName = venues.find(venue => venue.venue_id === selectedVenue)?.venue_name;

    // Veranderlikes om die lokaal naam te edit
    // editingName hou die ID van die lokaal se naam wat nou geedit word
    // tempName hou die tydelike naam terwyl die gebruiker dit intik
    const [editingName, setEditingName] = useState(null);
    const [tempName, setTempName] = useState({});
    
    // Hier is al die komponente wat ons op die skerm kan sien wat gelaai word
    return(

        <div className="Info Lokale__Inligting" data-for-tab="Lokale">
            <div className="MobileHeader">
                {collapsed && (
                    <button className="Hamburger" onClick={() => { setCollapsed(false); 
                        setMobieleLPaneel(true); }}>
                        ☰
                    </button>
                )}

                <h3>Lokale</h3>
            </div>

            {/* Lokale se opskrif en die knoppie om 'n nuwe lokaal by te voeg */}
            {/* Stuur data na die AdminVoegByPopUp deur props te gebruik */}
            <div className="Lokaal__titel">           
                <h2>Lokale</h2>
            </div>
            &ensp;Lokale gerigistreerd <br/>
            {/* Select drop downs om kampus en die gebou te kies */}
            {/* die value in die select beteken react kan beheer watter waarde tans gekies word */}
            {/* die onchange kry die gekose lokaal se id en verander die state van setSelected_____ */}
            {/* die .map, skep die skikking van al die waardes om in <option>s */}
            {/* die ids word gebruik as die keys om die lys met .map() te skep */}
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
            
            {/* Die lokale word hier vertoon */}
            {/* Ek gebruik basically 'n if konsep om te bepaal of ek die loading screen wys, of die lokale */}
            {/* Die loading screen word geteken met svg wat 'n sirkel en n path teken en dan die logo onder aan vertoon */}
            {/* Elke lokaal kry sy eie div om in te vertoon en word met 'n map funksie vertoon */}
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
                    // Editing van elke lokaal
                    // by value gebruik ek weer 'n if konsep om te bepaal watter naam word vertoon (databasis naam of temp geedited naam)
                    // readonly is van toepassing net as die naam nie huidiglik geedit word nie
                    // onChange stoor die nuwe naam in die setTempName
                        // ...tempName -> kopieer die bestaande naam in die objek sodat ons nie die bestaande state direk verander nie
                        // elke lokaal se tydelike naam word volgens sy id gestoor
                        // e.target.value -> hou die nuwe naam
                    // PUT request word gemaak om die naam te verander in die databasis
                        // die capacity stel net ook as die capacity null of undefines is gebruik 0
                    // Die setVenues update nadat die naam verander is
                        // Gebruik weer 'n if konsep om te bepaal of die die lokaal is wat verander was, as hy is dan maak ek n kopie daarvan en verander net sy naam
                    // Die knoppie gebruik oof 'n if konsep, om te verander van die edit ikoon na n regmerkie as hy geklik word
                        // Wys die kruisie as die lokaal geedit word, as die kruisie geklik word, dan vee hy die verandering uit en gebruik die onveranderde naam
                    // Delete knoppie stuur 'n confirm popup deur as geklik word en die id van die lokaal word gestoor in die knoppie  
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
                                {/* Editing knoppie */}
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

                            {/* Capacity editing hier in */}
                            <div className="Lokaal__capacity">
                                <h3>Kapasiteit:</h3>

                                <input
                                    type="number"
                                    value={
                                        editingCapacity === venue.venue_id
                                            ? tempCapacity[venue.venue_id]
                                            : venue.capacity ?? 0
                                    }
                                    readOnly={editingCapacity !== venue.venue_id}
                                    onChange={(e) => {
                                        setTempCapacity({
                                            ...tempCapacity,
                                            [venue.venue_id]: e.target.value
                                        });
                                    }}
                                />

                                <button
                                    className={editingCapacity === venue.venue_id ? "Edit_Aktief" : ""}
                                    onClick={async () => {
                                        if (editingCapacity !== venue.venue_id) {

                                            setEditingCapacity(venue.venue_id);

                                            setTempCapacity({
                                                ...tempCapacity,
                                                [venue.venue_id]: venue.capacity ?? 0
                                            });

                                        } else {

                                            try {
                                                await fetch(`http://127.0.0.1:8000/venue/${venue.venue_id}`, {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        building_id: selectedBuilding,
                                                        venue_name: venue.venue_name,
                                                        capacity: Number(tempCapacity[venue.venue_id]),
                                                        floor: venue.floor ?? 0
                                                    })
                                                });

                                                setVenues(
                                                    venues.map((ven) =>
                                                        ven.venue_id === venue.venue_id
                                                            ? {
                                                                ...ven,
                                                                capacity: Number(tempCapacity[venue.venue_id])
                                                            }
                                                            : ven
                                                    )
                                                );

                                                setEditingCapacity(null);

                                            } catch (err) {
                                                console.error("Error updating venue capacity:", err);
                                            }
                                        }
                                    }}
                                >
                                    {editingCapacity === venue.venue_id ? "\u2713" : "\u270E"}
                                </button>

                                {editingCapacity === venue.venue_id && (
                                    <button
                                        className="Edit_Aktief"
                                        onClick={() => {
                                            setTempCapacity({
                                                ...tempCapacity,
                                                [venue.venue_id]: venue.capacity ?? 0
                                            });

                                            setEditingCapacity(null);
                                        }}
                                    >
                                        &#x2716;
                                    </button>
                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>           
    )
}
