import React from "react";
import { act, useState } from "react";
import Header from "./Header";
import AdminLPaneel from "../adminComponents/AdminLPaneel";
import AdminLokaleInfo from "../adminComponents/AdminLokaleInfo";
import AdminToerusting from "../adminComponents/AdminToerusting";
import AdminRoosters from "../adminComponents/AdminRoosters";
import AdminBesprekings from "../adminComponents/AdminBesprekings";


function AdminContainer() {
    const [activeTab, setActiveTab] = useState("AdminLokaleInfo");
    console.log(activeTab);

    return(
        <div className="app">
            <Header />
            <div className="Houer">
                <AdminLPaneel 
                    activeTab= {activeTab}
                    setActiveTab = {setActiveTab}
                />
                
                <div className="RegterPaneel">
                    {activeTab === "AdminLokaleInfo" && <AdminLokaleInfo />}
                    {activeTab === "AdminToerusting" && <AdminToerusting />}
                    {activeTab === "AdminRoosters" && <AdminRoosters />}
                    {activeTab === "AdminBesprekings" && <AdminBesprekings />}                    
                </div>
            </div>
        </div>
    )
}

export default AdminContainer;
