// Imports vir die komponent
// useState word ingevoer om data te stoor wat in die komponent kan verander
// useEffect word gebruik wanneer ons wil hê iets in die komponent moet gebeur as hy laai, of wanneer sekere data verander word
import { useState, useEffect, useRef } from "react";
import "../css/Admin.css"
import AdminConfirmPopUp from "./AdminConfirmPopUp";
import PopupAnimation from "./PopupAnimation";

// Hierdie funksie werk baie soos die AddLokaal funksie, net toerusting i.p.v n lokaal
function AddToerusting({ setIsPopupOop, lokaalNaam, venueId, setEquipment }) {
    // Veranderlikes om die nuwe toerusting waardes te stoor
    const [isConfirmOop, setIsConfirmOop] = useState(false);
    const [equipNaam, setEquipNaam] = useState("");
    const [equipQty, setEquipQty] = useState(1);

    // Word geroep om die nuwe toerusting in die databasis te stoor
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
            
            const res2 = await fetch(`http://127.0.0.1:8000/equipment/by-venue_id/${venueId}`);
            const allEquip = await res2.json();
            setEquipment(allEquip);
            setIsPopupOop(false);
        } catch (err) {
            console.error("Error adding equipment:", err);
        }
    };

    // Bou die vorm wat vertoon as die gebruiker op die voeg toerusting by klik
    return (
        // Die h3 gebruik die veranderlike wat die naam van die gekose lokaal gestoor het om dit dan te vertoon
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

// Voeg 'n nuwe gebruiker by
function AddGebruiker({ setIsPopupOop, setUsers }) {
    const [isConfirmOop, setIsConfirmOop] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState("");

    // Word geroep om die nuwe gebruiker in die databasis te stoor
    // Kyk eers of wagwoorde ooreenstem voordat die versoek gestuur word
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

            // As epos reeds bestaan of daar is 'n ander fout, wys dit 'n foutboodskap sonder om die modal toe te maak
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Email bestaan reeds.");
                setEmail("");
                return;
            }

            const newUser = await res.json();
            console.log("User added:", newUser);

            // Haal die opgedateerde gebruikers lys sodat alle gebruikers aan die admin kant vertoon kan word
            const res2 = await fetch("http://127.0.0.1:8000/users");
            const allUsers = await res2.json();
            setUsers?.(allUsers);

            setIsPopupOop(false);
        } catch (err) {
            console.error("Error adding user:", err);
            setError("Kon nie rekening skep nie.");
        }
    };

    // Bou die vorm wat vertoon as die gebruiker op die voeg gebruikerby knoppie klik
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

    // Building word binne die popup gestoor
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState("");
    useEffect(() => {
        if (selectedCampus === "") return;

        fetch(`http://127.0.0.1:8000/buildings/by-campus/${selectedCampus}`)
            .then(res => res.json())
            .then(data => setBuildings(data))
            .catch(error => console.error(error));

    }, [selectedCampus]);
    
    // Bepaal of iets op die bladsy gerender moet word
    if (!isPopupOop){
        return null;
    }

    // Hier word die funksies geroep om te bepaal watse vorm moet verskein
    return(
        // As jy buite die vorm klik maak hy toe
        // Hierdie kies watter vorm vertoon word gebaseer op die tipe
        // So in die ander komponente spesifiseer ek die tipe en dan kies hy hier watse vorm om oop te maak
        <div className="Popup_Houer" onClick={() => setIsPopupOop(false)}>
            {/* As iemand binne die vorm klik moet hy nie toe maak nie */}
            <PopupAnimation as="div" ref={modalRef} className="popup-container">
                <form className="voegby_vorm" onClick={(e)=> e.stopPropagation()}>
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