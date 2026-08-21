import { useEffect, useState } from "react";
import LeftPanel from "./LeftPanel";
import KortpadMap from "./KortpadMap";
import '../css/Gebruiker.css';
import '../css/Style.css';

function StudentContainer() {
    const [selectedCampus, setSelectedCampus] = useState(1);
    const [startVenue, setStartVenue] = useState("");
    const [endVenue, setEndVenue] = useState("");
    
    const [hasSearched, setHasSearched] = useState(false);

    const [collapsed, setCollapsed] = useState(false);

    const endJourney = () => {
        setHasSearched(false);
        setStartVenue("");
        setEndVenue("");
        setCollapsed(false);
    }

    return (
        <div className="app">
            <div className="Container">
                <LeftPanel
                    hasSearched={hasSearched}
                    setHasSearched={setHasSearched}
                    selectedCampus={selectedCampus}
                    setSelectedCampus={setSelectedCampus}
                    setStartVenue={setStartVenue}
                    setEndVenue={setEndVenue}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
                <div className="MapPaneel">
                    <KortpadMap 
                        selectedCampus={selectedCampus}
                        startVenue={startVenue}
                        endVenue={endVenue}
                        collapsed={collapsed}
                    />

                    {collapsed && (
                        <button
                            className="endJourneyBtn"
                            onClick={endJourney}
                        >
                            Beïndig rit
                        </button>
                    )}
                </div>
            </div>
            
        </div>
    );
}

export default StudentContainer;
