//Houer vir Studente Koppelvlak om studente en admin kante te skei

//Invoere
import { use, useEffect, useState } from "react";
import LeftPanel from "./LeftPanel";
import KortpadMap from "./KortpadMap";
import '../css/Gebruiker.css';
import '../css/Style.css';

//Hoof komponent wat uit gevoer word
function StudentContainer() {

    //Veranderlikes
    const [selectedCampus, setSelectedCampus] = useState(1);
    const [startVenue, setStartVenue] = useState("");
    const [endVenue, setEndVenue] = useState("");

    const [pageIndex, setPageIndex] = useState(0);
    const [pageCount, setPageCount] = useState(0);

    const [hasSearched, setHasSearched] = useState(false);

    const [collapsed, setCollapsed] = useState(false);


    /*
        Stel al die soek toestande na hul verstek waardes,
        sodat 'n nuwe roete begin kan word
    */
    const endJourney = () => {
        setHasSearched(false);
        setStartVenue("");
        setEndVenue("");
        setCollapsed(false);
    }

    useEffect(() => { setPageIndex(0); }, [startVenue, endVenue]);

    //Html uitvoer
    return (
        <div className="app">
            <div className="Container">
                {/* Houer vir die linker paneel en sy kinders */}
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

                {/* Houer vir die kaart */}
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
                        <div className={`RoutePager ${pageIndex < pageCount - 1 ? 'RoutePager--pulse' : ''}`}>
                            <button disabled={pageIndex === 0} onClick={() => setPageIndex(i => i - 1)}>&larr; Terug</button>
                            <span>{pageIndex + 1} / {pageCount}</span>
                            <button disabled={pageIndex === pageCount - 1} onClick={() => setPageIndex(i => i + 1)}>Volgende &rarr;</button>
                        </div>
                    )}

                    {/*  Knoppie om die huidige roete te eindig, net sigbaar terwyl die paneel ingetrek is */}
                    {pageCount > 1 && (
                        <div className={`RoutePager ${pageIndex < pageCount - 1 ? 'RoutePager--pulse' : ''}`}>
                            <button disabled={pageIndex === 0} onClick={() => setPageIndex(i => i - 1)}>&larr; Terug</button>
                            <span>{pageIndex + 1} / {pageCount}</span>
                            <button disabled={pageIndex === pageCount - 1} onClick={() => setPageIndex(i => i + 1)}>Volgende &rarr;</button>
                        </div>
                    )}

                    {/*  Knoppie om die huidige roete te eindig, net sigbaar terwyl die paneel ingetrek is */}
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

        </div >
    );
}

//Uitvoer van StudentContainer funksie
export default StudentContainer;
