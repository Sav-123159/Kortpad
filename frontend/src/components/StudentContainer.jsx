import { use, useEffect, useState } from "react";
import LeftPanel from "./LeftPanel";
import KortpadMap from "./KortpadMap";
import '../css/Gebruiker.css';
import '../css/Style.css';

function StudentContainer() {
    const [selectedCampus, setSelectedCampus] = useState(1);
    const [startVenue, setStartVenue] = useState("");
    const [endVenue, setEndVenue] = useState("");

    const [pageIndex, setPageIndex] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    
    const [hasSearched, setHasSearched] = useState(false);

    const [collapsed, setCollapsed] = useState(false);

    const endJourney = () => {
        setHasSearched(false);
        setStartVenue("");
        setEndVenue("");
        setCollapsed(false);
    }

    useEffect(() => { setPageIndex(0); }, [startVenue, endVenue]);

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
                        pageIndex={pageIndex}
                        setPageCount={setPageCount}
                        collapsed={collapsed}
                    />

                    {pageCount > 1 && (
                        <div className="RoutePager">
                            <button disabled={pageIndex === 0} onClick={() => setPageIndex(i => i - 1)}>&larr; Terug</button>
                            <span>{pageIndex + 1} / {pageCount}</span>
                            <button disabled={pageIndex === pageCount - 1} onClick={() => setPageIndex(i => i + 1)}>Volgende &rarr;</button>
                        </div>
                    )}

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
