import { useState, useEffect, useRef } from "react";
import LogIn from "./LogIn";

import "../css/Admin.css"; 

export default function Header(){
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
                <button>
                    Student
                </button>
                <button>
                    Admin
                </button>
                <button onClick={showModal}>
                    Log In
                </button>
                <LogIn show={show} onClose={hideModal}/>
            </div>
        </header>
    );
}
