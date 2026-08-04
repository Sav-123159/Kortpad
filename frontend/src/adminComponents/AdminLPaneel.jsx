import "../css/Admin.css";

export default function AdminLPaneel({activeTab, setActiveTab}){
    return(
        <section className="LinkerPaneel">
            <div>
                Administrasie <br/>
                paneel
            </div>
            <div className="Opsies">
                <button className={activeTab === "AdminLokaleInfo" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setActiveTab("AdminLokaleInfo")} >
                    | Lokale
                </button>
                <button className={activeTab === "AdminToerusting" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setActiveTab("AdminToerusting")}>
                    | Lokaal Toerusting
                </button>
                <button className={activeTab === "AdminRoosters" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setActiveTab("AdminRoosters")}>
                    | Klas Roosters
                </button>
                <button className={activeTab === "AdminBesprekings" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setActiveTab("AdminBesprekings")}>
                    | Besprekings
                </button>
            </div>
        </section>
    )
}