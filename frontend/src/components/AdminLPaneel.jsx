import "../css/Admin.css";

export default function AdminLPaneel({aktieweTab, setAktieweTab}){
    return(
        <section className="LinkerPaneel">
            <div>
                Administrasie <br/>
                paneel
            </div>
            <div className="Opsies">
                <button className={aktieweTab === "AdminLokaleInfo" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setAktieweTab("AdminLokaleInfo")} >
                    | Lokale
                </button>
                <button className={aktieweTab === "AdminToerusting" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setAktieweTab("AdminToerusting")}>
                    | Lokaal Toerusting
                </button>
                <button className={aktieweTab === "AdminGebruiker" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setAktieweTab("AdminGebruiker")}>
                    | Gebruikers
                </button>
                <button className={aktieweTab === "AdminRoosters" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setAktieweTab("AdminRoosters")}>
                    | Klas Roosters
                </button>
                <button className={aktieweTab === "AdminBesprekings" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setAktieweTab("AdminBesprekings")}>
                    | Besprekings
                </button>
            </div>
        </section>
    )
}