import { useEffect, useRef, useState } from "react";
import { createRoot } from 'react-dom/client';
import PopupAnimation from "./PopupAnimation";
import { useAuth } from "./AuthContext";
import "../css/Style.css";
import "../css/Gebruiker.css";

//bug: wagwoord en herhaal wagwoord werk nie. maak nie saak wat jy in bevestig wagwoord sit nie, dit gee nie 'n error nie

const Api_Url = import.meta.env.VITE_API_URL; //stel url na vite se url waarde (localhost:5173)

function LoginModal({ onLogin, error }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    function HandleSubmit(e){
        //stop full page submit
        e.preventDefault();
        //gee waardes vir handleLogin
        onLogin(email, password);
    }

    //render login form
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

            {/*wys backend error message. Savannah, asb help met css maybe maak dit rooi en italic? unless jy dink dit lyk reg idk ydy. as dit bad lyk dan los dit maybe*/}
            {error && <p className="lgoin-error">{error}</p>}

            <button type="submit">Teken In</button>
        </form>
    )
}

function RegisterModal({ onRegister, error }) {
    const [fname, setFname] = useState("");
    const [sname, setSname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState(""); //client-side error

    function HandleSubmit(e){
        //stop full page submit
        e.preventDefault();

        if(password !== confirmPassword){
            setLocalError("Password does not match")
        }
        setLocalError("");

        //gee waardes vir handleLogin
        onRegister({ fname, sname, email }, password);
    }

    //render registreer form
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

            {/*word gestuur voordat dit 'n server error veroorsaak. @Savannah css pls, vir register-error, css dalk rooi en italics, weer eens as dit bad lyk kan jy dit los. Doen watever jou hart begeer*/}
            {(localError || error) && <p className="register-error">{localError || error}</p>}

            <button type="submit">Registreer</button>
        </form>
    )
}

function LogIn({ show, onCancel, onClose }) {
    const modalRef = useRef(null);
    //let codeToDisplay = null;
    //let buttonPhrase = null; afgeskyf en verander
    const [isRegistered, setIsRegistered] = useState(true);
    const [error, setError] = useState("");
    const { login } = useAuth(); //vat login function van AuthContext

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

    function onCancelClicked() {
        if (onClose) onClose();
        if (onCancel) onCancel();
    }

    const showRegister = () => {
        setIsRegistered(!isRegistered);
        setError(""); //clear die errors waneer jy forms switch
    };

    //call post /user/login, dan stoor returned user
    //die is di AutContext signal dat iemand in gelog is is

    async function HandleLogin(email, password){ //async want ons wag vir CRUD respons
        setError("");

        try{
            const res = await fetch(`${Api_Url}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if(!res.ok){ //as
                //res.json lees die FastAPI error 
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Iets het verkeerd gegaan unc :(");
                return;
            }

            const user = await res.json(); //UserCheck object van backend
            login(user);
            onClose?.();
        }
        catch{
            //network failure
            setError("Server is af koning :)")
        }
    }

    async function HandleRegister(userInfo, password){
        setError("");
        try{
            const res = await fetch(`${Api_Url}/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: userInfo, auth: { password }  }),
            });

            if(!res.ok){ //as die POST message nie 'n kode tussen 200-299 stuur nie is res.ok = false
                const data = await res.json().catch(() => ({}));
                //as email alklaar bestaan
                setError(data.detail || "Iets het verkeerd gegaan luhmayo :/"); //data.detail is die HTTPException message
                return;
            }

            //as jy registreer dan log dadelik in
            await HandleLogin(userInfo.email, password);
        }
        catch{
            setError("Server het ge-oopsie :P")
        }
    }


    /*if (isRegistered) {
        codeToDisplay = <LoginModal />
        buttonPhrase = "Skep Rekening";
    } else {
        codeToDisplay = <RegisterModal />
        buttonPhrase = "Teken In";
    }*/

    if (!show) return null;

    //cooler weergawe van die code hierbo
    const codeToDisplay = isRegistered
        ? <LoginModal onLogin={HandleLogin} error={error}/>
        :<RegisterModal onRegister={HandleRegister} error={error}/>
    const buttonPhrase = isRegistered ? "Skep Rekening" : "Teken In";



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
            </PopupAnimation>
        </div>
    );
}

export default LogIn;
