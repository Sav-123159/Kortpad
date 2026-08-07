import { useState } from "react";
import "../css/Admin.css"
import AdminConfirmPopUp from "./AdminConfirmPopUp";

function AddLokaal({setIsPopupOop}){
    const [isConfirmOop, setIsConfirmOop] = useState(false);
    return(
        <>
            <fieldset className="VoegBy">
                <h3>Voeg 'n lokaal by: </h3> <br />

                <label htmlFor="building">Gebou: </label>
                <input type="text" id="building" name="building"/> <br />

                <label htmlFor="venue_name">Lokaal Naam:</label>
                <input type="text" id="venue_name" name="venue_name"/> <br />

                <label htmlFor="capacity">Kapasiteit: </label>
                <input type="number" id="capacity" name="capacity" min={0} /> <br />
                
                <button type="button" onClick={() => setIsConfirmOop(true)}>Voeg By.</button> 
                <AdminConfirmPopUp 
                    setIsPopupOop={setIsPopupOop}
                    isConfirmOop = {isConfirmOop}
                    setIsConfirmOop = {setIsConfirmOop}
                    tipe = "ConfirmAdd"
                />

            </fieldset>
        </>
    )
}

function AddToerusting({setIsPopupOop}){
    const [isConfirmOop, setIsConfirmOop] = useState(false);
    return(
        <fieldset className="VoegBy">
            <h3>Voeg toerusting vir die lokaal by: </h3>  <br />

            <label htmlFor="venue_name">Lokaal Naam:</label>
            <input type="text" id="venue_name" name="venue_name"/> <br />

            <label htmlFor="equip_name">Toerusting Naam: </label>
            <input type="text" id="equip_name" name="equip_name"/> <br />

            <label htmlFor="equip_qty">Hoeveelheid: </label>
            <input type="number" id="equip_qty" name="equip_qty" min={1} /> <br />
            
            <button type="button" onClick={() => setIsConfirmOop(true)}>Voeg By.</button> 
            <AdminConfirmPopUp 
                setIsPopupOop={setIsPopupOop}
                isConfirmOop = {isConfirmOop}
                setIsConfirmOop = {setIsConfirmOop}
                tipe = "ConfirmAdd"
            /> 

        </fieldset>
    )
}

export default function AdminVoegByPopUp({isPopupOop, setIsPopupOop, tipe}) {
    console.log(isPopupOop);
    if (!isPopupOop){
        return null;
    }

    return(
        // As jy buite die vorm klik maak hy toe
        <div className="Popup_Houer" onClick={() => setIsPopupOop(false)}>
            {/* As iemand binne die vorm klik moet hy nie toe maak nie */}
            <form className="voegby_vorm" onClick={(e)=> e.stopPropagation()}>
                {tipe === "VoegLokaalBy" && <AddLokaal setIsPopupOop={setIsPopupOop}/>}
                {tipe === "VoegToerustingBy" && <AddToerusting setIsPopupOop={setIsPopupOop}/>}
            </form>
        </div>
    )
}