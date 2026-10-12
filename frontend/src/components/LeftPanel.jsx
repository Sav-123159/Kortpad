import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";

import { animate } from "motion";
import { motion } from "motion/react";

import SearchForm from "./SearchForm";
import Results from "./Results";
import Booking from "./Booking";

//Kyk of die skerm 'n foon grootte is, verander die linker paneel se breedte na 100% van die skerm
function useIsMobile(query = "(max-width: 480px)") {
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia(query).matches
    );

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (e) => setIsMobile(e.matches);

        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);

    return isMobile;
}

/*
    Houer wat die soek vorm, resultate en die besprekings modal bevat.
    Kan in mekaar in getrek word (collapse) wanneer 'n lokaal gekies word uit resultate
    Beweeg outomaties af van die soek vorm na die resultate deur 'n animasie
*/
export default function LeftPanel({
    hasSearched,
    setHasSearched,
    selectedCampus,
    setSelectedCampus,
    setStartVenue,
    setEndVenue,
    collapsed,
    setCollapsed
}) {
    const [selectedTime, setSelectedTime] = useState("");
    const [show, setShow] = useState(false);

    const panelRef = useRef(null);
    const resultsRef = useRef(null);

    //Bepaal of daar 'n nuwe soektog geskuif moet word, sonder om 'n herlaai te veroorsaak
    const shouldScrollToResults = useRef(false);

    const isMobile = useIsMobile();
    const expandedWidth = isMobile ? "100%" : 360;

    //Wys die besprekings modal
    const showModal = () => {
        setShow(true);
    };

    //Maak die besprekings modal toe
    const hideModal = () => {
        setShow(false);
    };

    /*
        Word deur Search Vorm geroep wanneer 'n nuwe soektog gemaak word
        Dui aan dat daar weer af geblaai moet word na die nuwe resultate wanneer
        hulle klaar gelaai is
    */
    const onSearch = () => {
        shouldScrollToResults.current = true;
        setHasSearched(true);
    };


    /*
        Skuif "glad" na die Resultate opskrif toe binne die linker paneel, indien daar
        'n nuwe soektog gemaak word. Word deur Results se onLoaded geroep sodra dit
        klaar gelaai het. Gebruik Motion om die in blaai en stadig stop effek te kry
    */
    function smoothScrollToResults() {
        //Daar moeet slegs af geblaai word wanneer 'n nuwe soektog ingedien word
        if (!shouldScrollToResults.current) return;

        const container = panelRef.current;
        const target = resultsRef.current;

        if (!container || !target) return;

        //herstel die sodat resultate wat later verander nie nog 'n afblaai veroorskaak nie
        shouldScrollToResults.current = false;

        const start = container.scrollTop;

        //Blaai na die resultate opskrif
        const end = target.offsetTop - 120;

        animate(start, end, {
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],

            onUpdate: (value) => {
                container.scrollTop = value;
            },
        });
    }




    return (
        // Motion vir die af blaai animasie
        //Begin posisie van animasie
        <motion.section
            className="LeftPanel"
            ref={panelRef}
            animate={{
                width: collapsed ? 0 : expandedWidth,
                padding: collapsed ? 0 : 20,
            }}
            transition={{
                duration: 0.4,
                ease: "easeInOut",
            }}
        >

            <button onClick={showModal}>
                Besprekings
            </button>

            <Booking
                show={show}
                onClose={hideModal}
            />

            <SearchForm
                onSearch={onSearch}
                onTimeChange={setSelectedTime}
                selectedCampus={selectedCampus}
                setSelectedCampus={setSelectedCampus}
                setStartVenue={setStartVenue}
            />

            {hasSearched && (
                <>
                    {/* Eindpunt wat aan die bokant van die paneel gaan wys wanneer die animasie klaar is.
                    Hierdie animasie is slegs vir die af blaai effek*/}
                    <motion.div
                        id="results"
                        ref={resultsRef}
                        initial={{
                            opacity: 0,
                            y: 30,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                    >
                        <h2>Resultate</h2>
                    </motion.div>
                    <motion.div
                        /* Wanneer die resultate in sig kom, gaan hulle eers vaag wees, en soos wat hulle opbeweeg 
                        gaan hulle meer sigbaar wees. Hierdie gee 'n sagter effek op die animasie om dit minder "hard" te maak
                        */
                        initial={{
                            opacity: 0,
                            y: 30,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                    >
                        <Results
                            selectedTime={selectedTime}
                            selectedCampus={selectedCampus}
                            setEndVenue={setEndVenue}
                            onLoaded={smoothScrollToResults}
                            setCollapsed={setCollapsed}
                        />
                    </motion.div>
                </>
            )}
        </motion.section>
    );
}
