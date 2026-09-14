//Invoere
import { useState, useEffect, useRef } from "react";
import LogIn from "./LogIn";
import GeneralPopupModal from "./GeneralPopupModal";
import Hamburger from "./Hamburger";
import { useAuth } from "./AuthContext";

//Gebruik AuthContext om localstorage te soek vir enige heidige in-getekende gebruiker (user) en hul besonderhede
//Gebruik AuthContext onderling metodes 
// -> user, isLoggedIn, logout

//As gebruiker admin is -> render "Student" en "Admin" knoppies
//As gebruiker in-geteken is 
// -> verander teks "Log In" na "Log Out"
// -> wys gebruiker naam (user -> fname)


export default function Header({ aktieweContainer, setAktieweContainer }) {
    const [show, setShow] = useState(false);
    const [showLogOut, setShowLogOut] = useState(false);
    const { user, isLoggedIn, logout } = useAuth();
    const [popupPrompt, setPopupPrompt] = useState();
    const greetingRef = useRef(null);

    //Wys die Login modal
    const showModal = () => {
        setShow(true);
    };

    //Maak die Login modal toe
    const hideModal = () => {
        setShow(false);
    };

    //Wys Logout boodksap as gebruiker klaar ingeteken is, anders wys Login-modal
    const handleAuthButtonClick = () => {
        if (isLoggedIn) {
            setPopupPrompt("Is jy seker jy wil uit teken?")
            setShowLogOut(true);
        }
        else {
            showModal();
        }
    };

    //Teken gebruiker uit, en gaan terug na student container toe
    const confirmLogout = () => {
        logout();
        setShowLogOut(false);
        setAktieweContainer("StudentContainer")
    };

    //Maak Logout toe, en bly in geteken
    const cancelLogout = () => {
        setShowLogOut(false);
    };

    /*
        Waai animasie by groet knoppie wanneer die muis daaroor beweeg
        isCoolingDown keer dat die animasie weer van voor af begin voordat die vorige
        siklus verby is.
        Herlaai wanneer isLoggedIn verander, want greetingRef bestaan eers nadat daar ingeteken word
    */
    useEffect(() => {
        const greetingBtn = greetingRef.current;
        if (!greetingBtn) return;

        //Local flag, en nie 'n state nie -> Die bladsy hoef nie herlaai te word nie
        let isCoolingDown = false;

        const handleMouseEnter = () => {
            if (isCoolingDown) return;
            isCoolingDown = true;
            //Koppel aan waai css
            greetingBtn.classList.add('is-waving');

            setTimeout(() => {
                //Verwyder waai css 
                greetingBtn.classList.remove('is-waving');
                isCoolingDown = false;
            }, 650);
        };

        greetingBtn.addEventListener('mouseenter', handleMouseEnter);

        //Verwyder listener wanneer effect herlaai word of komponent nie meer sigbaar is nie
        return () => {
            greetingBtn.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isLoggedIn]);

    //Jy is admin net as die localstorage se "is_admin" waarde waar is en die "isLoggedIn" metode waar teruggee

    //"...user?..." kyk veilig of daar 'n gebruiker is sonder om die hele website te crash
    //  if user == null 
    //      -> user?.is_admin == undefined

    //"!!user..." vat enige null/undefined waardes en maak hulle false
    //  if user == null 
    //      -> user?.is_admin == undefined 
    //      -> !!user?.is_admin == false

    const isAdmin = isLoggedIn && !!user?.is_admin;

    return (
        <header className="HeadNav">
            <div className="Logo">
                <img src="/Kortpad_LOGO.jpeg" alt="Kortpad logo" />
            </div>

            {isLoggedIn && (
                <div className="greeting" ref={greetingRef}>
                    <p>Hello {user.fname}!</p>
                </div>
            )}

            <div className="Nav">
                {/* {isAdmin && (
                    <button
                        className={aktieweContainer === "StudentContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                        onClick={() => setAktieweContainer("StudentContainer")}
                    >Student</button>)}

                {isAdmin && (
                    <button
                        className={aktieweContainer === "AdminContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                        onClick={() => setAktieweContainer("AdminContainer")}
                    >Admin</button>)} */}

                {/* <button className="Nav_Knoppie" onClick={handleAuthButtonClick}>{isLoggedIn ? "Log Out" : "Log In"}</button> */}

                <LogIn show={show} onClose={hideModal} />

                <GeneralPopupModal
                    show={showLogOut}
                    onConfirm={confirmLogout}
                    onCancel={cancelLogout}
                    prompt={popupPrompt}/>
                
                <Hamburger
                    aktieweContainer={aktieweContainer}
                    setAktieweContainer={setAktieweContainer}
                    handleAuthButtonClick={handleAuthButtonClick}
                />
            </div>
        </header>
    );
}
