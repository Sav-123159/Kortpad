import { useState } from "react";
import LogIn from "./LogIn";
import LogOut from "./LogOut";
import { useAuth } from "./AuthContext";

export default function Header({ aktieweContainer, setAktieweContainer }) {
    const [show, setShow] = useState(false); //wys login modal
    const [showLogOut, setShowLogOut] = useState(false); //wys logout modal
    const { user, isLoggedIn, logout } = useAuth(); //AuthContext metode vir die user data 

    const showModal = () => {
        setShow(true);
    };

    const hideModal = () => {
        setShow(false);
    };

    const handleAuthButtonClick = () => {
        if (isLoggedIn){
            setShowLogOut(true);
        } 
        else{
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

    //Student en Admin buttons wys net as die user ingelog is en is admin
    //user?, vir die geval dat daar nie 'n user is nie (user is null)
    //!! vir null of undefined user wat dan nogsteeds 'n waarde terug gee
    const isAdmin = isLoggedIn && !!user?.is_admin;


    console.log("user object:", user);
    console.log("is_admin value:", user?.is_admin, typeof user?.is_admin);

    return (
        <header className="HeadNav">
            <div className="Logo">
                <img src="/Kortpad_LOGO.jpeg" alt="Kortpad logo" />
            </div>

            {/*user se naam wys regs van  logo (maybe moet email of naam en van wys idk lmk) kode, Savannah asb help met css hier dit lyk bietjie garbage*/}
            {isLoggedIn && (<p className="Nav_Gebruiker">{user.fname}</p>)}

            <div className="Nav">
                {/*studente button word net gerender as isAdmin true is, ander wat is die punt (glo my dit lyk nie reg nie)*/}
                {isAdmin && (
                    <button
                        className={aktieweContainer === "StudentContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                        onClick={() => setAktieweContainer("StudentContainer")}
                    >Student</button>)}

                {/*admin button, selfde as student*/}
                {isAdmin && (
                    <button
                        className={aktieweContainer === "AdminContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                        onClick={() => setAktieweContainer("AdminContainer")}
                    >Admin</button>)}

                {/*wys either log in of log out*/}
                <button className="Nav_Knoppie" onClick={handleAuthButtonClick}>{isLoggedIn ? "Log Out" : "Log In"}</button>

                <LogIn show={show} onClose={hideModal}/>

                <LogOut
                    show={showLogOut}
                    onConfirm={confirmLogout}
                    onCancel={cancelLogout}/>
            </div>
        </header>
    );
}