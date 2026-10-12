//Invoere
import { useEffect, useRef, useState } from "react";
import { createRoot } from 'react-dom/client';
import PopupAnimation from "./PopupAnimation";
import { useAuth } from "./AuthContext";
import "../css/Style.css";
import "../css/Gebruiker.css";

//Stell URL na vite se URL (localhost:5173)
const Api_Url = import.meta.env.VITE_API_URL;

/*
    Login-Vorm. Vra vir epos en wagwoord, en gee dit terug aan die ouer-komponent 
    se onLogin-Funksie wanneer due vorm ingedien word
*/
function LoginModal({ onLogin, error }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    //Keer volle bladsy indiening
    //  -> e.preventDefault();

    function HandleSubmit(e){
        e.preventDefault();
        onLogin(email, password);
    }

    return (
        <form className="login" onSubmit={HandleSubmit}>
            <label htmlFor="email">Epos:</label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <label htmlFor="password">Wagwoord:</label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {error && <p className="login-error">{error}</p>}

            <button type="submit">Teken In</button>
        </form>
    )
}

/*
    Vra vir naam, van, epos en wagwoord met 'n bevestiging
    Valideer dat die wagwoorde ooreenstem, en gee die 
    inligting terug na die ouer komponent se onRegister funksie
*/
function RegisterModal({ onRegister, error }) {
    //Laai "states" in constante waardes
    //Vir const [fname, setFname] = useState("");
    //  -> fname is heidige "state"
    //  -> setFname verander fname
    //  -> "useState("")" begin die "state" leeg

    const [fname, setFname] = useState("");
    const [sname, setSname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState("");

    function HandleSubmit(e){
        e.preventDefault();
        setLocalError("");

        if(password !== confirmPassword){
            setLocalError("Wagwoord stem nie ooreen nie.");
            setPassword("");
            setConfirmPassword("");
            return;
        }

        onRegister({ fname, sname, email }, password);
    }

    return (
        <form className="login" onSubmit={HandleSubmit}>
            <label htmlFor="name">Naam:</label>
            <input
                type="name"
                id="name"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                required
            />

            <label htmlFor="surname">Van:</label>
            <input
                type="surname"
                id="surname"
                value={sname}
                onChange={(e) => setSname(e.target.value)}
                required
            />

            <label htmlFor="email">Epos:</label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <label htmlFor="password">Wagwoord:</label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$"
                title="Wagwoord moet minstens 'n hoofletter, kleinletter en geen simbole nie"
                required
            />

            <label htmlFor="password--confirm">Bevestig Wagwoord:</label>
            <input
                type="password"
                id="password--confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />

            {(localError || error) && <p className="register-error">{localError || error}</p>}

            <button type="submit">Registreer</button>
        </form>
    )
}

/*
    Hoof login/registreer funksie. Wissel tussen login in en registreer, 
    hanteer API roep en maak die hele modal toe as daar buite/Esc geklik word
*/
function LogIn({ show, onCancel, onClose }) {
    const modalRef = useRef(null);
    const [isRegistered, setIsRegistered] = useState(true);
    const [error, setError] = useState("");
    const { login } = useAuth(); //Haal login funksie van AuthContext

    /*
        Globale luisteraars sodat die modal toe gemaak word wanneer dat buite hom geklik word
        Word van voor af opgestel nadat "show" of "onClose" verander. Dit verwyder
        ou luisteraars om duplikate te voorkom
    */
    useEffect(() => {
        const closeModalOnClickOut = (e) => {
            if (show &&modalRef.current &&!modalRef.current.contains(e.target)){
                onClose?.();
            }
        };

        const closeModalOnEscKeyDown = (e) => {
            if (show && e.key === "Escape"){
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

    //Kanseleer aanteken en maak die modal toe
    function onCancelClicked() {
        if (onClose) onClose();
        if (onCancel) onCancel();
    }

    //Wissel van Login na Registreer
    const showRegister = () => {
        setIsRegistered(!isRegistered);
        setError("");
    };

    /*
        Stuur Login versoek na API. Indien dit suksesvol is word die gebruiker in AuthContext
        gestoor en die modal word toe gemaak. Die gebruiker is nou in geteken
    */
    async function HandleLogin(email, password){
        setError("");

        try{
            const res = await fetch(`${Api_Url}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if(!res.ok){
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Login Failed");
                return;
            }

            const user = await res.json();
            login(user);
            onClose?.();
        }
        catch{
            setError("Kon nie in teken nie.")
        }
    }

    /*
        Stuur Registreer versoek na API om 'n nuwe rekening te skep
        Indien suksesvol is die gebruiker klaar ingeteken deur die HandleLogin te roep
    */
    async function HandleRegister(userInfo, password){
        setError("");
        try{
            const res = await fetch(`${Api_Url}/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: userInfo, auth: { password }  }),
            });

            if(!res.ok){
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Email bestaan reeds.");
                setEmail("");
                return;
            }

            await HandleLogin(userInfo.email, password);
        }
        catch{
            setError("Kon nie rekening skep nie.")
        }
    }

    //Hanteer watter teks op die knoppie verskyn
    const codeToDisplay = isRegistered
        ? <LoginModal onLogin={HandleLogin} error={error}/>
        :<RegisterModal onRegister={HandleRegister} error={error}/>
    const buttonPhrase = isRegistered ? "Skep Rekening" : "Teken In";

    //Keer dat modal laai as show nie true is nie
    if (!show) return null;

    return (
        <div className="login-page">
            <PopupAnimation as="div" className="login-container" ref={modalRef}>
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

                {/* Animasie vir inteken modal wat die logo wys */}
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
        </div>
    );
}

//Uitvoer van Login funksie
export default LogIn;
