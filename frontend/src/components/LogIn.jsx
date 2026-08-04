import { useEffect, useRef, useState } from "react";
import { createRoot } from 'react-dom/client';
import "../css/Style.css";
import "../css/Gebruiker.css";


function LoginModal() {

    return (
        <form className="login">
            <label htmlFor="email">Epos:</label>
            <input
                type="email"
                id="email"
                required
            />

            <label htmlFor="password">Wagwoord:</label>
            <input
                type="password"
                id="password"
                required
            />
            <button type="submit">Teken In</button>
        </form>
    )
}

function RegisterModal() {

    return (
        <form className="login">
            <label htmlFor="name">Naam:</label>
            <input
                type="name"
                id="name"
                required
            />

            <label htmlFor="surname">Van:</label>
            <input
                type="surname"
                id="surname"
                required
            />

            <label htmlFor="email">Epos:</label>
            <input
                type="email"
                id="email"
                required
            />

            <label htmlFor="password">Wagwoord:</label>
            <input
                type="password"
                id="password"
                required
            />

            <label htmlFor="password--confirm">Bevestig Wagwoord:</label>
            <input
                type="password"
                id="password--confirm"
                required
            />

            <button type="submit">Registreer</button>
        </form>
    )
}

function LogIn({ show, onCancel, onClose }) {
    const modalRef = useRef(null);
    let codeToDisplay = null;
    let buttonPhrase = null;
    const [isRegistered, setIsRegistered] = useState(true);

    useEffect(() => {
        const closeModalOnClickOut = (e) => {
            if (
                show &&
                modalRef.current &&
                !modalRef.current.contains(e.target)
            ) {
                onClose?.();
            }
        };

        const closeModalOnEscKeyDown = (e) => {
            if (show && e.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("mousedown", closeModalOnClickOut);
        document.addEventListener("keydown", closeModalOnEscKeyDown);

        return () => {
            document.removeEventListener("mousedown", closeModalOnClickOut);
            document.removeEventListener("keydown", closeModalOnEscKeyDown);
        };
    }, [show, onClose]);

    function onCancelClicked() {
        if (onClose) onClose();
        if (onCancel) onCancel();
    }

    const showRegister = () => {
        setIsRegistered(!isRegistered);
    };

    if (isRegistered) {
        codeToDisplay = <LoginModal />
        buttonPhrase = "Skep Rekening";
    } else {
        codeToDisplay = <RegisterModal />
        buttonPhrase = "Teken In";
    }

    if (!show) return null;

    return (
        <div className="login-page">
            <div className="login-container" ref={modalRef}>
                <div className="form">
                    <h1>Welkom!</h1>
                    <h3>Teken Aan Of Registreer</h3>
                    <>
                        {codeToDisplay}
                    </>
                    <div className="button-group">
                        <button onClick={onCancelClicked} className="form-button">
                            Kanselleer
                        </button>
                        <button className="form-button" onClick={showRegister}>{buttonPhrase}</button>
                    </div>
                </div>

                <div className="deco">
                    <svg
                        width="320"
                        height="170"
                        viewBox="0 0 320 170"
                    >
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
        </div>
    );
}

export default LogIn;
