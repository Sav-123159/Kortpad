import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function Hamburger({ aktieweContainer, setAktieweContainer, handleAuthButtonClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isLoggedIn } = useAuth();
    const isAdmin = isLoggedIn && !!user?.is_admin;

    const toggleMenu = () => setIsOpen(prev => !prev);

    const handleNavClick = (container) => {
        setAktieweContainer(container);
        setIsOpen(false);
    };

    const handleAuthClick = () => {
        handleAuthButtonClick();
        setIsOpen(false);
    };

    return (
        <div className="hamburger-wrapper">
            <button
                className={isOpen ? "hamburger hamburger--open" : "hamburger"}
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                <span className="burger burger1"></span>
                <span className="burger burger2"></span>
                <span className="burger burger3"></span>
            </button>

            {isOpen && (
                <div className="hamburger-menu">
                    {isAdmin && (
                        <button
                            className={aktieweContainer === "StudentContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                            onClick={() => handleNavClick("StudentContainer")}
                        >Student</button>
                    )}
                    {isAdmin && (
                        <button
                            className={aktieweContainer === "AdminContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                            onClick={() => handleNavClick("AdminContainer")}
                        >Admin</button>
                    )}
                    <button className="Nav_Knoppie" onClick={handleAuthClick}>
                        {isLoggedIn ? "Log Out" : "Log In"}
                    </button>
                </div>
            )}
        </div>
    );
}