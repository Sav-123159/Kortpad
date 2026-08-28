import { useState, useEffect } from "react";
import "../css/Admin.css";
import AdminVoegByPopUp from "../components/AdminVoegByPopUp.jsx";
import "../css/Style.css";

export default function AdminGebruiker() {

    const [isPopupOop, setIsPopupOop] = useState(false);
    const [gebruikers, setGebruikers] = useState([]);
    const [tipe, setTipe] = useState("gebruiker");

    useEffect(() => {
        haalGebruikers();
    }, []);

    const haalGebruikers = async () => {
        try {
            const response = await fetch("http://localhost:8000/users");

            if (!response.ok) {
                throw new Error("Kon nie gebruikers laai nie.");
            }

            const data = await response.json();
            setGebruikers(data);

        } catch (error) {
            console.error("Fout met laai van gebruikers:", error);
        }
    };

    const gefiltreerdeGebruikers = gebruikers.filter((gebruiker) => {
        if (tipe === "admin") {
            return gebruiker.is_admin === true;
        }

        return gebruiker.is_admin === false;
    });

    return (
        <div className="Info Gebruiker_Inligting" data-for-tab="Gebruiker">

            <div className="Gebruiker_Title">
                <h2>Gebruikers</h2>

                <button onClick={() => setIsPopupOop(true)}>
                    Voeg gebruiker by
                </button>

                <AdminVoegByPopUp 
                    isPopupOop={isPopupOop}
                    setIsPopupOop={setIsPopupOop}
                    tipe="VoeggebruikerBy"
                />
            </div>
            &ensp;Geregistreerde gebruikers
            <div className="Gebruiker_Keuse">
                <label>
                    <input
                        type="radio"
                        name="gebruikerTipe"
                        value="gebruiker"
                        checked={tipe === "gebruiker"}
                        onChange={() => setTipe("gebruiker")}
                    />
                    Gewone gebruikers
                </label>
                <label>
                    <input
                        type="radio"
                        name="gebruikerTipe"
                        value="admin"
                        checked={tipe === "admin"}
                        onChange={() => setTipe("admin")}
                    />
                    Admins
                </label>
            </div>

            <div className="Gebruiker_Lys">
                    {gefiltreerdeGebruikers.length === 0 ? (
                    <p>Geen gebruikers om te vertoon nie.</p>
                ) : (
                    <div className="Gebruiker__lys">
                        {gefiltreerdeGebruikers.map((gebruiker) => (
                            <div className="Gebruiker__item" key={gebruiker.user_id}>
                                <label>
                                    {gebruiker.fname} {gebruiker.sname}
                                </label>
                                <span>
                                    {gebruiker.email}
                                </span>
                                <button onClick={() => {
                                    setIsDeleteOop(true);
                                    setSelectedEquip(item.equip_id)}}
                                >
                                    &#x1F5D1;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}