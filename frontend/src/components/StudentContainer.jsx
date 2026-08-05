import { useState } from "react";
import Header from "./Header";
import LeftPanel from "./LeftPanel";
import KortpadMap from "./KortpadMap";
import { lokale } from "../data/mockData";

function StudentContainer() {
    const [results, setResults] = useState(
        lokale.filter((l) => l.beskikbaar)
    );

    const handleSoek = (soekData) => {
        console.log(soekData);

        setResults(
            lokale.filter((l) => l.beskikbaar)
        );
    };

    return (
        <div className="app">
            <div className="Container">
                <LeftPanel
                    results={results}
                    onSearch={handleSoek}
                />
                <div className="MapPaneel">
                    <KortpadMap lokale={results}/>
                </div>
            </div>
            
        </div>
    );
}

export default StudentContainer;
