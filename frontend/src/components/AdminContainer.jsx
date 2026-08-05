import React, { useState } from "react";
import AdminLPaneel from "./AdminLPaneel";
import AdminLokaleInfo from "./AdminLokaleInfo.jsx";
import AdminToerusting from "./AdminToerusting.jsx";
import AdminRoosters from "./AdminRoosters.jsx";
import AdminBesprekings from "./AdminBesprekings.jsx";
// import AdminLPaneel from "./AdminLPaneel";

function AdminContainer() {
    
    const [aktieweTab, setAktieweTab] = useState("AdminLokaleInfo");

    return(
        <div className="app">
            <div className="Houer">
                <AdminLPaneel
                    aktieweTab={aktieweTab}
                    setAktieweTab={setAktieweTab}
                />
                <div className="RegterPaneel">
                    {aktieweTab === "AdminLokaleInfo" && <AdminLokaleInfo />}
                    {aktieweTab === "AdminToerusting" && <AdminToerusting />}
                    {aktieweTab === "AdminRoosters" && <AdminRoosters />}
                    {aktieweTab === "AdminBesprekings" && <AdminBesprekings />}
                </div>
            </div>
        </div>
    )
}

export default AdminContainer;
