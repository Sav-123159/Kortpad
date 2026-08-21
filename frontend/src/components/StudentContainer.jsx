import { useEffect, useState } from "react";
import LeftPanel from "./LeftPanel";
import KortpadMap from "./KortpadMap";
import '../css/Gebruiker.css';
import '../css/Style.css';

function StudentContainer() {
    const [selectedCampus, setSelectedCampus] = useState(1);
    const [startVenue, setStartVenue] = useState("");
    const [endVenue, setEndVenue] = useState("");  

    return (
        <div className="app">
            <div className="Container">
                <LeftPanel
                    selectedCampus={selectedCampus}
                    setSelectedCampus={setSelectedCampus}
                    setStartVenue={setStartVenue}
                    setEndVenue={setEndVenue}
                />
                <div className="MapPaneel">
                    <KortpadMap 
                        selectedCampus={selectedCampus}
                        startVenue={startVenue}
                        endVenue={endVenue}
                    />
                </div>
            </div>
            
        </div>
    );
}

export default StudentContainer;
