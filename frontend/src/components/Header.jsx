import { useState, useEffect, useRef } from "react";
import LogIn from "./LogIn";

export default function Header({aktieweContainer, setAktieweContainer}){
    const [show, setShow] = useState(false);
    
        const showModal = () => {
            setShow(true)
        }
    
        const hideModal = () => {
            setShow(false)
        }
    return (
        <header className="HeadNav">
            <div className="Logo">
                <img src="/Kortpad_LOGO.jpeg" alt="Kortpad logo"/>
            </div>
            <div className="Nav">
                <button className = {aktieweContainer === "StudentContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                onClick={() => setAktieweContainer("StudentContainer")}>
                    Student
                </button>
                <button className = {aktieweContainer === "AdminContainer" ? "Nav_Knoppie Nav_Knoppie--active" : "Nav_Knoppie"}
                onClick={() => setAktieweContainer("AdminContainer")}>
                    Admin
                </button>
                <button className="Nav_Knoppie" onClick={showModal}>
                    Log In
                </button>
                <LogIn show={show} onClose={hideModal}/>
            </div>
        </header>
    );
}
