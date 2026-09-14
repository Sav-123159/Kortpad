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
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                <svg viewBox="0 0 24 24" width="26" height="26" className="hamburger-icon">
                    {/* account ikoon wys as dit nie geklik is nie */}
                    {/* g is svg se div */}
                    <g className="icon-account">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                    </g>

                    {/* hamburger ikoon wys as knoppie geklik is */}
                    <g className="icon-burger">
                        <line x1="4" y1="7" x2="20" y2="7" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="17" x2="20" y2="17" />
                    </g>
                </svg>

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