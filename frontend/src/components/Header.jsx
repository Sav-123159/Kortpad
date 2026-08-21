import { useState } from "react";
import LogIn from "./LogIn";
import LogOut from "./LogOut";
import { useAuth } from "./AuthContext";

export default function Header({ aktieweContainer, setAktieweContainer }) {
    const [show, setShow] = useState(false); 
    const [showLogOut, setShowLogOut] = useState(false);
    const { user, isLoggedIn, logout } = useAuth();

    const showModal = () => {
        setShow(true);
    };

    const hideModal = () => {
        setShow(false);
    };

    const handleAuthButtonClick = () => {
        if (isLoggedIn) {
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

            {isLoggedIn && (
                <div className="greeting">
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

                <LogOut
                    show={showLogOut}
                    onConfirm={confirmLogout}
                    onCancel={cancelLogout} 
                    onClose={cancelLogout}/>
            </div>
        </header>
    );
}
