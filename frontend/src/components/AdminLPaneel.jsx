import "../css/Admin.css";

export default function AdminLPaneel({aktieweTab, setAktieweTab}){
    return(
        // Die linkerpaneel wat die verskillende opsies vir die admin gee
        <section className="LinkerPaneel">
            <div>
                Administrasie <br/>
                paneel
            </div>
            {/* onClick -> wanneer die knoppies geklik word, dan kry setAktieweTab die waarde van die knoppie wat gedruk is */}
            {/* Die waarde word deur gestuur na AdminContainer wat die regte komponent roep en render */}
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
                {
                    (aktieweTab === "AdminGebruiker" || aktieweTab === "AdminSorteer")&& (
                        <button className = {aktieweTab === "AdminSorteer" ? "Opsie_Knoppie Sorteer_Knoppie Opsie_Knoppie--active" : "Opsie_Knoppie Sorteer_Knoppie"}
                            onClick={() => setAktieweTab("AdminSorteer")}
                        >
                            | Sorteer Algoritmes
                        </button>
                    )
                }

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