import { useState } from "react";
import SoekForm from "./SoekForm";
import Resultate from "./Resultate";

export default function LeftPanel({ resultate, onSoek }) {
    const [selectedTime, setSelectedTime] = useState("");

    return (
        <section className="LinkerPaneel">
            <SoekForm onSoek={onSoek}/>

            <h2>Resultate</h2>

            <Resultate lokale={resultate} 
                getTime={!!selectedTime} 
                time={selectedTime}  />
        </section>
    );
}
