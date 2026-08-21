import { useState, useRef } from "react";

import { animate } from "motion";
import { motion } from "motion/react";

import SearchForm from "./SearchForm";
import Results from "./Results";
import Booking from "./Booking";

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

    // Increment on every search so Results remounts, so Scroll activates
    const [searchId, setSearchId] = useState(0);

    const panelRef = useRef(null);
    const resultsRef = useRef(null);

    // Used to prevent scrolling when Results changes for another reason
    const shouldScrollToResults = useRef(false);

    const showModal = () => {
        setShow(true);
    };

    const hideModal = () => {
        setShow(false);
    };

    const onSearch = () => {
        shouldScrollToResults.current = true;
        setHasSearched(true);
    };


    function smoothScrollToResults() {
        // Only scroll when a new search was submitted
        if (!shouldScrollToResults.current) return;

        const container = panelRef.current;
        const target = resultsRef.current;

        if (!container || !target) return;

        // Reset this so Results changing later does not trigger another scroll
        shouldScrollToResults.current = false;

        const start = container.scrollTop;

        // Scroll to the Results heading
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
        <motion.section 
            className="LeftPanel" 
            ref={panelRef}
            animate={{
                width: collapsed ? 0 : 360,
                padding: collapsed ? 0 : 20,
            }}
            transition={{
                duration: 0.4,
                ease: "easeInOut",
            }}    
        >
            <button onClick={showModal}>
                Bespreek Lokaal
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
