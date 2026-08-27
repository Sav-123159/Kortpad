import { useState, useEffect, useRef } from "react";
import LogIn from "./LogIn";
import GeneralPopupModal from "./GeneralPopupModal";
import Hamburger from "./Hamburger";
import { useAuth } from "./AuthContext";

export default function Header({ aktieweContainer, setAktieweContainer }) {
    const [show, setShow] = useState(false); //wys login modal
    const [showLogOut, setShowLogOut] = useState(false); //wys logout modal
    const { user, isLoggedIn, logout } = useAuth(); //AuthContext metode vir die user data 
    const [popupPrompt, setPopupPrompt] = useState();
    const greetingRef = useRef(null);

    const showModal = () => {
        setShow(true);
    };

    const hideModal = () => {
        setShow(false);
    };

    const handleAuthButtonClick = () => {
        if (isLoggedIn){
            setPopupPrompt("Is jy seker jy wil uit teken?")
            setShowLogOut(true);
        }
        else {
            showModal();
        }
    };

    const confirmLogout = () => {
        logout(); //logout metode van AuthContext
        setShowLogOut(false);
        setAktieweContainer("StudentContainer") //terug na student view, daar was 'n bug met admin profiles wat uitlog, die fix daai bug
    };

    const cancelLogout = () => {
        setShowLogOut(false);
    };

 useEffect(() => {
        const greetingBtn = greetingRef.current;
        if (!greetingBtn) return; // not logged in yet, nothing to attach to

        let isCoolingDown = false;

        const handleMouseEnter = () => {
            if (isCoolingDown) return;
            isCoolingDown = true;
            greetingBtn.classList.add('is-waving');

            setTimeout(() => {
                greetingBtn.classList.remove('is-waving');
                isCoolingDown = false;
            }, 650);
        };

        greetingBtn.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            greetingBtn.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isLoggedIn]);

    //Student en Admin buttons wys net as die user ingelog is en is admin
    //user?, vir die geval dat daar nie 'n user is nie (user is null)
    //!! vir null of undefined user wat dan nogsteeds 'n waarde terug gee
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
                {isAdmin && (
                    <button
                        className={aktieweContainer === "StudentContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                        onClick={() => setAktieweContainer("StudentContainer")}
                    >Student</button>)}

                {isAdmin && (
                    <button
                        className={aktieweContainer === "AdminContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                        onClick={() => setAktieweContainer("AdminContainer")}
                    >Admin</button>)}

                <button className="Nav_Knoppie" onClick={handleAuthButtonClick}>{isLoggedIn ? "Log Out" : "Log In"}</button>

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
