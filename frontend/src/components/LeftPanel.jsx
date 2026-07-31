import { useState } from "react";
import SoekForm from "./SoekForm";
import Resultate from "./Resultate";

export default function LeftPanel({ resultate, onSoek }) {
    const [selectedTime, setSelectedTime] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState("");

    const handleSubmit = (values) => {
        setHasSearched(true);
        onSoek(values);
    };

    return (
        <section className="LinkerPaneel">
            <SoekForm onSoek={handleSubmit}
            onTimeChange={setSelectedTime}
            onCampusChange={setSelectedCampus}/>

            <h2>Resultate</h2>
        {hasSearched && 
            <Resultate lokale={resultate} 
                getTime={!!selectedTime} 
                time={selectedTime}
                campus={selectedCampus}/>
        }
        </section>
    );
}
