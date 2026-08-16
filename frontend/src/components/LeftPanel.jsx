import { useState, useRef } from "react";

import { animate } from "motion";
import { motion } from "motion/react";

import SearchForm from "./SearchForm";
import Results from "./Results";
import Booking from "./Booking";

export default function LeftPanel({ results, onSearch }) {
    // Current Time in Form
    const [selectedTime, setSelectedTime] = useState("");
    // Stores the time that was used for the last search, prevents reload before search by not using selectedTime
    const [searchedTime, setSearchedTime] = useState("");

    const [hasSearched, setHasSearched] = useState(false);

    // Current Campus in Form
    const [selectedCampus, setSelectedCampus] = useState("");
    // Stores the campus that was used for the last search, prevents reload before search by not using selectedCampus
    const [searchedCampus, setSearchedCampus] = useState("");

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

    const handleSubmit = (values) => {
        shouldScrollToResults.current = true;

        setSearchedCampus(selectedCampus);
        setSearchedTime(selectedTime);

        // Force Results to remount so its data-loaded effect and scroll runs on every search
        setSearchId((id) => id + 1);
        setHasSearched(true);
        onSearch(values);
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
        <section className="LeftPanel" ref={panelRef}>
            <button onClick={showModal}>
                Bespreek Lokaal
            </button>

            <Booking
                show={show}
                onClose={hideModal}
            />

            <SearchForm
                onSearch={handleSubmit}
                onTimeChange={setSelectedTime}
                onCampusChange={setSelectedCampus}
            />

            <div id="results" ref={resultsRef}>
                <h2>Resultate</h2>
            </div>

            {hasSearched && (
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
                        key={searchId}
                        getTime={!!searchedTime}
                        time={searchedTime}
                        campus={searchedCampus}
                        onLoaded={smoothScrollToResults}
                    />
                </motion.div>
            )}
        </section>
    );
}
