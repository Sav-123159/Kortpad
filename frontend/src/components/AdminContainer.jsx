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

    // Html uitvoer
    return(
        <div className="app">
            <div className="Houer">
                {/* Houer vir die admin paneel en sy kinders */}
                <AdminLPaneel
                    aktieweTab={aktieweTab}
                    setAktieweTab={setAktieweTab}
                />
                <div className="RegterPaneel">
                    {/* Wys net die komponent by die geselekteerde tab hoort */}
                    {aktieweTab === "AdminLokaleInfo" && <AdminLokaleInfo />}
                    {aktieweTab === "AdminToerusting" && <AdminToerusting />}
                    {aktieweTab === "AdminGebruiker" && <AdminGebruiker/>}
                    {aktieweTab === "AdminRoosters" && <AdminRoosters />}
                    {aktieweTab === "AdminBesprekings" && <AdminBesprekings />}
                    {aktieweTab === "AdminSorteer" && <AdminSorteer/>}
                    {aktieweTab === "AdminMST" && <AdminMST/>}
                </div>
            </div>
        </div>
    )
}

// Uitvoer van die AdminContainer funksie
export default AdminContainer;
