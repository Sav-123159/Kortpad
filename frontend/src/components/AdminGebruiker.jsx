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

    const [editingUser, setEditingUser] = useState(null);
    const [tempValue, setTempValue] = useState({});

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

    const hanteerEditUser = async (gebruiker) => {
        if (editingUser !== gebruiker.user_id) {
            setEditingUser(gebruiker.user_id);
            setTempValue({
                ...tempValue,
                [gebruiker.user_id]: {
                    fname: gebruiker.fname,
                    sname: gebruiker.sname,
                    email: gebruiker.email,
                    is_admin: gebruiker.is_admin,
                },
            });
            return;
        }

        try {
            const updated = tempValue[gebruiker.user_id];

            const response = await fetch(
                
                `http://127.0.0.1:8000/user/${gebruiker.user_id}?is_admin=${updated.is_admin}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fname: updated.fname,
                        sname: updated.sname,
                        email: updated.email,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Kon gebruiker nie opdateer nie");
            }

            setGebruikers(
                gebruikers.map((g) =>
                    g.user_id === gebruiker.user_id
                        ? { ...g, ...updated }
                        : g
                )
            );
            setEditingUser(null);

        } catch (err) {
            // console.error("Error updating user: ", err);
        }
    };

    const kanselleerEditUser = (gebruiker) => {
        setTempValue({
            ...tempValue,
            [gebruiker.user_id]: {
                fname: gebruiker.fname,
                sname: gebruiker.sname,
                email: gebruiker.email,
                is_admin: gebruiker.is_admin,
            },
        });
        setEditingUser(null);
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
                    tipe="VoegGebruikerBy"
                    setUsers={setGebruikers}
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
                        {gefiltreerdeGebruikers.map((gebruiker) => {
                            const isEditing = editingUser === gebruiker.user_id;
                            const huidige = tempValue[gebruiker.user_id] || {
                                fname: gebruiker.fname,
                                sname: gebruiker.sname,
                                email: gebruiker.email,
                                is_admin: gebruiker.is_admin,
                            };

                            return (
                                <div className="Gebruiker__item" key={gebruiker.user_id}>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={huidige.fname}
                                                onChange={(e) =>
                                                    setTempValue({
                                                        ...tempValue,
                                                        [gebruiker.user_id]: {
                                                            ...huidige,
                                                            fname: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                            <input
                                                type="text"
                                                value={huidige.sname}
                                                onChange={(e) =>
                                                    setTempValue({
                                                        ...tempValue,
                                                        [gebruiker.user_id]: {
                                                            ...huidige,
                                                            sname: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                            <input
                                                type="email"
                                                value={huidige.email}
                                                onChange={(e) =>
                                                    setTempValue({
                                                        ...tempValue,
                                                        [gebruiker.user_id]: {
                                                            ...huidige,
                                                            email: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                            <label className="Edit_Admin_Label">
                                                <input
                                                    type="checkbox"
                                                    checked={huidige.is_admin}
                                                    onChange={(e) =>
                                                        setTempValue({
                                                            ...tempValue,
                                                            [gebruiker.user_id]: {
                                                                ...huidige,
                                                                is_admin: e.target.checked,
                                                            },
                                                        })
                                                    }
                                                />
                                                Admin
                                            </label>
                                        </>
                                    ) : (
                                        <>
                                            <label>
                                                {gebruiker.fname} {gebruiker.sname}
                                            </label>
                                            <span>
                                                {gebruiker.email}
                                            </span>
                                            {gebruiker.is_admin && (
                                                <span className="Gebruiker__is_admin">
                                                    Admin
                                                </span>
                                            )}
                                        </>
                                    )}

                                    <div>
                                        <button
                                            className={isEditing ? "Edit_Aktief" : ""}
                                            onClick={() => hanteerEditUser(gebruiker)}
                                        >
                                            {isEditing ? "\u2713" : "\u270E"}
                                        </button>

                                        {isEditing && (
                                            <button
                                                className="Cancel_Edit"
                                                onClick={() => kanselleerEditUser(gebruiker)}
                                            >
                                                &#x2716;
                                            </button>
                                        )}


                                    </div>
                                    <button onClick={() => {
                                        setSelectedUser(gebruiker.user_id);
                                        setIsDeleteOop(true);
                                    }}>
                                        &#x1F5D1;
                                    </button>
                                </div>
                            );
                        })}
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