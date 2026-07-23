// Hoofkomponent wat al die komponente saambind
// Hou vir nou die beskikbare lokale in state en gee dit deur na kind-komponente

// Laai die nodige modules in
// react vir die kern van react
import { useState } from "react"; 
// App-komponent wat al die ander komponente saambind
import SoekForm from "./components/SoekForm";
// Resultate-komponent wat beskikbare lokale wys
import Resultate from "./components/Resultate";
// Kaart-komponent wat beskikbare lokale en die kortste pad wys
import KortpadMap from "./components/KortpadMap";
// Laai die mockData in wat beskikbare lokale bevat
import { lokale } from "./data/mockData";

//App roep die soek-funksie, en filter beskikbare lokale, dan gee dit deur na Resultate en KortpadMap
function App() {
  // Hou die beskikbare lokale in state, filter slegs beskikbare lokale
  const [resultate, setResultate] = useState(lokale.filter((l) => l.beskikbaar));

  // Funksie wat die data van SoekForm hanteer, en filter beskikbare lokale
  const handleSoek = (soekData) => {
    // Log die soekdata
    console.log("Soek-data:", soekData);
    // Later sal dit filter volgens kampus/lokaal/tyd wanneer databasis gekoppel is
    setResultate(lokale.filter((l) => l.beskikbaar));
  };

  // Render die soekvorm, resultate en kaart
  return (
    // app hou die soekvorm, resultate en kaart saam
    <div className="app">
      <SoekForm onSoek={handleSoek} className={'.SoekForm'}/>
      <Resultate lokale={resultate} className={'.Resultate'}/>
      <section className={'.leaflet-container'}>
        <KortpadMap lokale={resultate} />
      </section>
    </div>
  );
}

// Stuur die App-komponent na die hoof-render
export default App;