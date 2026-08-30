import { useState, useEffect, useRef } from "react";
import "../css/Admin.css"
import AdminConfirmPopUp from "./AdminConfirmPopUp";
import PopupAnimation from "./PopupAnimation";

function AddLokaal({setIsPopupOop, campuses, selectedCampus, setSelectedCampus, buildings, selectedBuilding, setSelectedBuilding, setVenues}){
        const [capacity, setCapacity] = useState(0);
        const [floor, setFloor] = useState(0);
        const hanteerAdd = async () => {
    try {
        const res = await fetch("http://127.0.0.1:8000/venue", {
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify({
            building_id: parseInt(selectedBuilding),
            venue_name: lokaalNaam,
            capacity: parseInt(capacity),
            floor: parseInt(floor)
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

                <label htmlFor="floor">Kies vloer nommer: </label>
                <input type="number" id="floor" name="floor" min={0} value={floor} onChange={(e) => setFloor(e.target.value)} /> <br />
                
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

function AddGebruiker({ setIsPopupOop, setUsers }) {
    const [isConfirmOop, setIsConfirmOop] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState("");

    const hanteerAdd = async () => {
        setError("");

        if (password !== confirmPassword) {
            setError("Wagwoord stem nie ooreen nie.");
            setPassword("");
            setConfirmPassword("");
            return;
        }

        const userInfo = {
            fname: firstName,
            sname: lastName,
            email: email,
            is_admin: isAdmin,
        };

        try {
            const res = await fetch("http://127.0.0.1:8000/user/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: userInfo, auth: { password } }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Email bestaan reeds.");
                setEmail("");
                return;
            }

            const newUser = await res.json();
            console.log("User added:", newUser);

            const res2 = await fetch("http://127.0.0.1:8000/users");
            const allUsers = await res2.json();
            setUsers?.(allUsers);

            setIsPopupOop(false);
        } catch (err) {
            console.error("Error adding user:", err);
            setError("Kon nie rekening skep nie.");
        }
    };

    return (
        <fieldset className="VoegBy">
            <h3>Voeg 'n gebruiker by:</h3>

            <label htmlFor="fName">Voor Naam:</label>
            <input
                type="text"
                id="fName"
                name="fName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            /> <br />

            <label htmlFor="lName">Van:</label>
            <input
                type="text"
                id="lName"
                name="lName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            /> <br />

            <label htmlFor="email">Epos:</label>
            <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            /> <br />

            <label htmlFor="admin">Admin Regte:</label>
            <input
                type="checkbox"
                id="admin"
                name="admin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
            /> <br />

            <label htmlFor="password">Wagwoord:</label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            /> <br />

            <label htmlFor="password--confirm">Bevestig Wagwoord:</label>
            <input
                type="password"
                id="password--confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            /> <br />

            {error && <p className="register-error">{error}</p>}

            <button type="button" onClick={() => setIsConfirmOop(true)}>Voeg By.</button>
            <AdminConfirmPopUp
                setIsPopupOop={setIsPopupOop}
                isConfirmOop={isConfirmOop}
                setIsConfirmOop={setIsConfirmOop}
                gebruikerNaam={`${firstName} ${lastName}`.trim()}
                isAdmin={isAdmin}
                tipe="ConfirmGebruiker"
                onConfirm={hanteerAdd}
            />
        </fieldset>
    );
}

export default function AdminVoegByPopUp({isPopupOop, setIsPopupOop, tipe, lokaalNaam, setVenues, setEquipment, setUsers, venueId }) {
    const modalRef = useRef(null);
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
            <PopupAnimation as="div" ref={modalRef}>
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
                    {tipe === "VoegGebruikerBy" &&
                        <AddGebruiker
                            setIsPopupOop={setIsPopupOop}
                            setUsers={setUsers}
                        />}
                </form>
            </PopupAnimation>
        </div>
    )
}