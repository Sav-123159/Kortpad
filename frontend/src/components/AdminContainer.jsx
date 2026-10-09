// Import al die komponente om te render as die admin hulle roep
import React, { useState } from "react";
import AdminLPaneel from "./AdminLPaneel";
import AdminLokaleInfo from "./AdminLokaleInfo.jsx";
import AdminToerusting from "./AdminToerusting.jsx";
import AdminRoosters from "./AdminRoosters.jsx";
import AdminBesprekings from "./AdminBesprekings.jsx";
import AdminGebruiker from "./AdminGebruiker.jsx";
import AdminSorteer from "./AdminSorteer.jsx";
import AdminMST from "./AdminMST.jsx";
import '../css/Admin.css';
import "../css/Style.css";

// Hoof komponent wat uit gevoer word
function AdminContainer() {
    // veranderlike
    const [aktieweTab, setAktieweTab] = useState("AdminLokaleInfo");
    // Roep die komponent afhangend van die onclick event wat aktieweTab se waarde deur stuur in AdminLPaneel

    //Mobile view sodat die linker paneel toemaak indien n tab gekies word
    const [MobieleLPaneel, setMobieleLPaneel] = useState(true);
    const [collapsed, setCollapsed] = useState(false);
    // Html uitvoer
    return(
        <div className="app">
            <div className="Houer">
                {/* Houer vir die admin paneel en sy kinders */}
                <AdminLPaneel
                    aktieweTab={aktieweTab}
                    setAktieweTab={setAktieweTab}
                    MobieleLPaneel={MobieleLPaneel}
                    setMobieleLPaneel={setMobieleLPaneel}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}

                />
                <div className={MobieleLPaneel ? "RegterPaneel RegterPaneel--hide" : "RegterPaneel"}>
                    {/* Wys net die komponent by die geselekteerde tab hoort */}
                    {aktieweTab === "AdminLokaleInfo" && (<AdminLokaleInfo setCollapsed={setCollapsed} collapsed={collapsed} setMobieleLPaneel={setMobieleLPaneel} />)}
                    {aktieweTab === "AdminToerusting" && (<AdminToerusting  setCollapsed={setCollapsed} collapsed={collapsed} setMobieleLPaneel={setMobieleLPaneel} />)}
                    {aktieweTab === "AdminGebruiker" && (<AdminGebruiker  setCollapsed={setCollapsed} collapsed={collapsed} setMobieleLPaneel={setMobieleLPaneel} />) }
                    {aktieweTab === "AdminSorteer" && (<AdminSorteer  setCollapsed={setCollapsed} collapsed={collapsed} setMobieleLPaneel={setMobieleLPaneel} />)}
                    {aktieweTab === "AdminRoosters" && (<AdminRoosters  setCollapsed={setCollapsed} collapsed={collapsed} setMobieleLPaneel={setMobieleLPaneel} />)}
                    {aktieweTab === "AdminBesprekings" && (<AdminBesprekings  setCollapsed={setCollapsed} collapsed={collapsed} setMobieleLPaneel={setMobieleLPaneel} />)}
                    {aktieweTab === "AdminMST" && (<AdminMST  setCollapsed={setCollapsed} collapsed={collapsed} setMobieleLPaneel={setMobieleLPaneel} />)}
                </div>
            </div>
        </div>
    )
}

// Uitvoer van die AdminContainer funksie
export default AdminContainer;
