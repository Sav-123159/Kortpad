import { useState, useRef } from "react";
import { animate } from "motion";
import { motion } from "motion/react";
import SearchForm from "./SearchForm";
import Results from "./Results";
import Booking from "./Booking";

export default function LeftPanel({ results, onSearch }) {
    const [selectedTime, setSelectedTime] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [show, setShow] = useState(false);

    const panelRef = useRef(null);
    const resultsRef = useRef(null);
    const shouldScrollToResults = useRef(false);

    const showModal = () => {
        setShow(true);
    };

    const hideModal = () => {
        setShow(false);
    };

    const handleSubmit = (values) => {
        shouldScrollToResults.current = true;

        setHasSearched(true);
        onSearch(values);
    };

    function smoothScrollToResults() {
        if (!shouldScrollToResults.current) return;

        const container = panelRef.current;
        const target = resultsRef.current;

        if (!container || !target) return;

        shouldScrollToResults.current = false;

        const start = container.scrollTop;
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
                        lokale={results}
                        getTime={!!selectedTime}
                        time={selectedTime}
                        campus={selectedCampus}
                        onLoaded={smoothScrollToResults}
                    />
                </motion.div>
            )}
        </section>
    );
}