import { useState } from "react";
import Header from "./Header";
import LeftPanel from "./LeftPanel";
import KortpadMap from "./KortpadMap";
import '../css/Gebruiker.css';
import '../css/Style.css';

function StudentContainer() {


    return (
        <div className="app">
            <div className="Container">
                <LeftPanel/>
                <div className="MapPaneel">
                    <KortpadMap/>
                </div>
            </div>
            
        </div>
    );
}

export default StudentContainer;
