import { useState, useEffect } from "react";
import Header from "./components/Header";
import StudentContainer from "./components/StudentContainer";
import AdminContainer from "./components/AdminContainer";
import "./css/Style.css";


function App() {
    const [introState, setIntroState] = useState('playing');
    const [aktieweContainer, setAktieweContainer] = useState("StudentContainer");

    useEffect(() => {
        const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");

        if (hasSeenIntro) {
            setIntroState("done");
            return;
        }

        const fadeTimer = setTimeout(() => {
            setIntroState("fading");
        }, 4200);

        const endTimer = setTimeout(() => {
            setIntroState("done");
            sessionStorage.setItem("hasSeenIntro", "true");
        }, 5000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(endTimer);
        };
    }, []);
    
    return (
        <div className="app">

            {introState !== 'done' && (
                <div className={`global-intro-overlay ${introState === 'fading' ? 'fade-out-active' : ''}`}>
                    <div className="intro-deco">
                        <svg width="320" height="170" viewBox="0 0 320 170">
                            <circle cx="80" cy="85" r="10" className="intro-node" id="intro-node1" />
                            <circle cx="120" cy="35" r="10" className="intro-node" id="intro-node2" />
                            <circle cx="170" cy="135" r="10" className="intro-node" id="intro-node3" />
                            <circle cx="210" cy="85" r="10" className="intro-node" id="intro-node4" />
                            <path
                                className="intro-animated-path"
                                d="M80 85 C95 65 110 55 140 85 C170 115 195 105 210 85"
                            />
                        </svg>
                        <h2 className="welkom-text">Welkom</h2>
                    </div>
                </div>
            )}

            <Header
                aktieweContainer={aktieweContainer}
                setAktieweContainer={setAktieweContainer} />

            {aktieweContainer === "StudentContainer" && <StudentContainer />}
            {aktieweContainer === "AdminContainer" && <AdminContainer />}
        </div>
    );
}

export default App;