// invoere
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import PopupAnimation from "./PopupAnimation";
import GeneralPopupModal from "./GeneralPopupModal";

// Laat gebruiker toe om hul eie rekening te wysig of te skrap. 
// Het slegs die opsie as ingeteken is. 
// Wys nie vir admin gebruikers nie, kan in admin paneel verander word.

export default function UserEdit({ show, onClose }) {
    const { user, isLoggedIn, login, logout } = useAuth();
    const modalRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [tempValue, setTempValue] = useState({});

    /*
        Globale luisteraars sodat die modal toe gemaak word wanneer dat buite hom geklik word
        Word van voor af opgestel nadat "show" of "onClose" verander. Dit verwyder
        ou luisteraars om duplikate te voorkom
    */

    useEffect(() => {
        const closeOnClickOut = (e) => {
            if (
                show &&
                !confirmDelete &&
                modalRef.current &&
                !modalRef.current.contains(e.target)
            ) {
                onClose?.();
            }
        };

        const closeOnEscKeyDown = (e) => {
            if (show && !confirmDelete && e.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("mousedown", closeOnClickOut);
        document.addEventListener("keydown", closeOnEscKeyDown);

        return () => {
            document.removeEventListener("mousedown", closeOnClickOut);
            document.removeEventListener("keydown", closeOnEscKeyDown);
        };
    }, [show, onClose, confirmDelete]);

    // Moet nie laai as een van die drie nie waar is nie
    if (!show || !isLoggedIn || !user) {
        return null;
    }

    // Eerste klik -> Skakel wysiging aan, stoor die huidige waardes
    // Tweede klik -> Stuur PUT om te stoor
    const hanteerEditUser = async () => {
        if (!isEditing) {
            setTempValue({
                fname: user.fname,
                sname: user.sname,
                email: user.email,
            });
            setIsEditing(true);
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/user/${user.user_id}?is_admin=${user.is_admin}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fname: tempValue.fname,
                        sname: tempValue.sname,
                        email: tempValue.email,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Kon jou inligting nie opdateer nie");
            }

            login({ ...user, ...tempValue });
            setIsEditing(false);
        } catch (err) {
            // console.error("Error updating profile:", err);
        }
    };

    // Kanselleer wysiging, stel die temp waardes terug na die oorspronklikes toe
    const kanselleerEditUser = () => {
        setTempValue({
            fname: user.fname,
            sname: user.sname,
            email: user.email,
        });
        setIsEditing(false);
    };

    // Eerste klik -> vra bevestiging
    // Tweede klik (bevestig) -> skrap die rekening en teken uit
    const hanteerDeleteClick = () => {
        setConfirmDelete(true);
    };

    const kanselleerDelete = () => {
        setConfirmDelete(false);
    };

    const bevestigDelete = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/user/${user.user_id}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Kon rekening nie skrap nie");
            }

            logout();
            onClose?.();
        } catch (err) {
            console.error("Error deleting account:", err);
            setConfirmDelete(false);
        }
    };

    return (
        <>
            <div className="popup-page">
                <PopupAnimation as="div" className="edit-container" ref={modalRef}>
                    <div className="form">
                        <h1>My Profiel</h1>

                        <form className="edit" onSubmit={(e) => e.preventDefault()}>
                            {isEditing ? (
                                <>
                                    <label htmlFor="fname">Voornaam:</label>
                                    <input
                                        id="fname"
                                        type="text"
                                        value={tempValue.fname}
                                        onChange={(e) =>
                                            setTempValue({ ...tempValue, fname: e.target.value })
                                        }
                                    />
                                    <label htmlFor="sname">Van:</label>
                                    <input
                                        id="sname"
                                        type="text"
                                        value={tempValue.sname}
                                        onChange={(e) =>
                                            setTempValue({ ...tempValue, sname: e.target.value })
                                        }
                                    />
                                    <label htmlFor="email">E-pos:</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={tempValue.email}
                                        onChange={(e) =>
                                            setTempValue({ ...tempValue, email: e.target.value })
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <label htmlFor="fname">Voornaam:</label>
                                    <input id="fname" type="text" value={user.fname} readOnly />
                                    <label htmlFor="sname">Van:</label>
                                    <input id="sname" type="text" value={user.sname} readOnly />
                                    <label htmlFor="email">E-pos:</label>
                                    <input id="email" type="email" value={user.email} readOnly />
                                </>
                            )}

                            <div>
                                {/* Potlood verander na regmerkie terwyl daar gewysig word */}
                                <button
                                    type="button"
                                    className={isEditing ? "Edit_Aktief" : ""}
                                    onClick={hanteerEditUser}
                                >
                                    {isEditing ? "\u2713" : "\u270E"}
                                </button>

                                {/* Kruisie wys net terwyl daar gewysig word */}
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="Cancel_Edit"
                                        onClick={kanselleerEditUser}
                                    >
                                        &#x2716;
                                    </button>
                                )}

                                <button type="button" onClick={hanteerDeleteClick}>
                                    &#x1F5D1;
                                </button>
                            </div>

                        </form>
                    </div>

                    <div className="deco">
                        <svg
                            width="320"
                            height="170"
                            viewBox="0 0 320 170"
                        >
                            {/* Begin posisies van nodes */}
                            <circle cx="80" cy="85" r="10" className="node" id="node1" />
                            <circle cx="120" cy="35" r="10" className="node" id="node2" />
                            <circle cx="170" cy="135" r="10" className="node" id="node3" />
                            <circle cx="210" cy="85" r="10" className="node" id="node4" />
                            <path
                                // Pad wat die "pad" oor gaan beweeg
                                className="animated-path"
                                d=" M80 85 C95 65 110 55 140 85 C170 115 195 105 210 85"
                            />
                        </svg>
                        <img src="../../public/LOGO_Cropped.jpeg" className="login-logo" />
                    </div>
                </PopupAnimation>

                <GeneralPopupModal
                    show={confirmDelete}
                    onConfirm={bevestigDelete}
                    onCancel={kanselleerDelete}
                    prompt="Is jy seker jy wil jou rekening permanent skrap?"
                />
            </div>

        </>
    );
}
