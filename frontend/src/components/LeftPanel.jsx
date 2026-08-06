import { useState } from "react";
import SearchForm from "./SearchForm";
import Results from "./Results";
import Booking from "./Booking";

export default function LeftPanel({ results, onSearch }) {
    const [selectedTime, setSelectedTime] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [show, setShow] = useState(false);

    const showModal = () => {
        setShow(true)
    }

    const hideModal = () => {
        setShow(false)
    }

    const handleSubmit = (values) => {
        setHasSearched(true);
        onSearch(values);
    };

    return (
        <section className="LeftPanel">
            <button onClick={showModal}>
                Bespreek Lokaal
            </button>
            <Booking show={show} onClose={hideModal}/>
            <SearchForm onSearch={handleSubmit}
            onTimeChange={setSelectedTime}
            onCampusChange={setSelectedCampus}/>

            <h2>Resultate</h2>
        {hasSearched && 
            <Results lokale={results} 
                getTime={!!selectedTime} 
                time={selectedTime}
                campus={selectedCampus}/>
        }
        </section>
    );
}
