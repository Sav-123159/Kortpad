import { useState } from "react";
import Header from "./components/Header";
import LeftPanel from "./components/LeftPanel";
import KortpadMap from "./components/KortpadMap";
import { lokale } from "./data/mockData";

function App() {
    const [resultate, setResultate] = useState(
        lokale.filter((l) => l.beskikbaar)
    );

    const handleSoek = (soekData) => {
        console.log(soekData);

        setResultate(
            lokale.filter((l) => l.beskikbaar)
        );
    };

    return (
        <div className="app">
            <Header />
            <div className="Container">
                <LeftPanel
                    resultate={resultate}
                    onSoek={handleSoek}
                />
                <div className="MapPaneel">
                    <KortpadMap lokale={resultate}/>
                </div>
            </div>
        </div>
    );
}

export default App;