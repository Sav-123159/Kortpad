import { useState } from "react";
import "../css/Admin.css";
import AdminVoegByPopUp from "../components/AdminVoegByPopUp.jsx";
import AdminConfirmPopUp from "./AdminConfirmPopUp.jsx";

export default function AdminLokaleInfo(){
    const [isPopupOop, setIsPopupOop] = useState(false);
    const [isDeleteOop, setIsDeleteOop] = useState(false);
    return(
        <div className="Info Lokale__Inligting" data-for-tab="Lokale">
            <div className="Lokaal__titel">
                <h2>Lokale</h2>

                <button onClick={() => setIsPopupOop(true)}>Voeg lokaal by.</button>
                <AdminVoegByPopUp 
                    isPopupOop = {isPopupOop}
                    setIsPopupOop={setIsPopupOop}
                    tipe="VoegLokaalBy"
                />
            </div>
            &ensp;Lokale gerigistreerd <br/>
            <div className="Lokale__kampus">
                <h3>Kampus: </h3>
                <select>
                    <option>Leriba Kampus</option>
                    <option>Gerhard Straat Kampus</option>
                    <option>Pearl Kampus</option>
                </select>
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Bitterbessie
                <button onClick={() => setIsDeleteOop(true)}>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> L2   
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Bosvy
                <button onClick={() => setIsDeleteOop(true)}>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> L2   
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Board Room 1
                <button onClick={() => setIsDeleteOop(true)}>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> Sowel As   
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Board Room 2
                <button onClick={() => setIsDeleteOop(true)}>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> Sowel As  
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Spys
                <button onClick={() => setIsDeleteOop(true)}>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> Spys 
            </div>
            <AdminConfirmPopUp
                isConfirmOop={isDeleteOop}
                setIsConfirmOop={setIsDeleteOop}
                tipe="ConfirmDel"
            />
        </div>   
          
    )
}