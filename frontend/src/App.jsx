import { useState } from "react";
import Header from "./components/Header";
import LeftPanel from "./components/LeftPanel";
import KortpadMap from "./components/KortpadMap";
import { lokale } from "./data/mockData";

function App() {
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
            <Header />
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

export default App;