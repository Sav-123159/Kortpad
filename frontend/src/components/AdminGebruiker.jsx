import { useState, useEffect } from "react";
import "../css/Admin.css";
import AdminVoegByPopUp from "../components/AdminVoegByPopUp.jsx";
import AdminConfirmPopUp from "./AdminConfirmPopUp.jsx";
import "../css/Style.css";

export default function AdminGebruiker() {
    const [isPopupOop, setIsPopupOop] = useState(false);
    const [isDeleteOop, setIsDeleteOop] = useState(false);

    const [gebruikers, setGebruikers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

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

    const selectedUserName = gebruikers.find(
        gebruiker => gebruiker.user_id === selectedUser
    )?.fname;

    const hanteerDeleteUser = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/user/${selectedUser}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Kon gebruiker nie delete nie");
            }

            setGebruikers(
                gebruikers.filter(gebruiker => gebruiker.user_id !== selectedUser)
            );

            setIsDeleteOop(false);
            setSelectedUser(null);

        } catch (err) {
            console.error("Error deleting user:", err);
        }
    };

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
                                    setSelectedUser(gebruiker.user_id);
                                    setIsDeleteOop(true);
                                }}>
                                    &#x1F5D1;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <AdminConfirmPopUp
                    isConfirmOop={isDeleteOop}
                    setIsConfirmOop={setIsDeleteOop}
                    tipe="ConfirmDel"
                    onConfirm={hanteerDeleteUser}
                    itemName={selectedUserName}
                />
            </div>
        </div>
    );
}