import { useState, useEffect } from "react";
import { motion } from "motion/react";
import "../css/Admin.css";

function useIsMobile(query = "(max-width: 480px)") {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (e) => setIsMobile(e.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);

    return isMobile;
}

export default function AdminLPaneel({ aktieweTab, setAktieweTab, collapsed, setCollapsed, setMobieleLPaneel, MobieleLPaneel }) {
    const isMobile = useIsMobile();
    const expandedWidth = isMobile ? "100%" : 360;

    return (
        // Die linkerpaneel wat die verskillende opsies vir die admin gee
        <motion.section
            className="LinkerPaneel"
            animate={{
                width: collapsed ? 0 : expandedWidth,
                padding: collapsed ? 0 : 20,
            }}
            transition={{
                duration: 0.4,
                ease: "easeInOut"
            }}
        >
            <div>
                Administrasie <br />
                paneel
            </div>
            {/* onClick -> wanneer die knoppies geklik word, dan kry setAktieweTab die waarde van die knoppie wat gedruk is */}
            {/* Die waarde word deur gestuur na AdminContainer wat die regte komponent roep en render */}
            <div className="Opsies">
                <button className={!MobieleLPaneel && aktieweTab === "AdminLokaleInfo" ? "Opsie_Knoppie Opsie_Knoppie--active" : "Opsie_Knoppie"}
                    onClick={() => { setAktieweTab("AdminLokaleInfo"); setCollapsed(true); setMobieleLPaneel(false); }} >
                    | Lokale
                </button>
                <button className={!MobieleLPaneel && aktieweTab === "AdminToerusting" ? "Opsie_Knoppie Opsie_Knoppie--active" : "Opsie_Knoppie"}
                    onClick={() => { setAktieweTab("AdminToerusting"); setCollapsed(true); setMobieleLPaneel(false); }} >
                    | Lokaal Toerusting
                </button>
                <button className={!MobieleLPaneel && aktieweTab === "AdminGebruiker" ? "Opsie_Knoppie Opsie_Knoppie--active" : "Opsie_Knoppie"}
                    onClick={() => { setAktieweTab("AdminGebruiker"); 
                        if(isMobile){
                            setCollapsed(true); 
                            setMobieleLPaneel(false);
                        } 
                    }} >
                    | Gebruikers
                </button>

                {(!isMobile && (aktieweTab === "AdminGebruiker" || aktieweTab === "AdminSorteer")) && (
                    <button className={aktieweTab === "AdminSorteer" ? "Opsie_Knoppie Sorteer_Knoppie Opsie_Knoppie--active" : "Opsie_Knoppie Sorteer_Knoppie"}
                        onClick={() => { setAktieweTab("AdminSorteer");}}
                    >
                        | Sorteer Algoritmes
                    </button>)
                }

                <button className={aktieweTab === "AdminRoosters" ? "Opsie_Knoppie Opsie_Knoppie--active" : "Opsie_Knoppie"}
                    onClick={() => { setAktieweTab("AdminRoosters"); setCollapsed(true); setMobieleLPaneel(false); }}>
                    | Klas Roosters
                </button>
                <button className={!MobieleLPaneel && aktieweTab === "AdminBesprekings" ? "Opsie_Knoppie Opsie_Knoppie--active" : "Opsie_Knoppie"}
                    onClick={() => { setAktieweTab("AdminBesprekings"); setCollapsed(true); setMobieleLPaneel(false); }} >
                    | Besprekings
                </button>
                <button className={aktieweTab === "AdminMST" ? "Opsie_Knoppie Opsie_Knoppie--active": "Opsie_Knoppie"} 
                onClick={() => setAktieweTab("AdminMST")}>
                    | Minimum Spanboom
                </button>
            </div>
        </motion.section>
    )
}