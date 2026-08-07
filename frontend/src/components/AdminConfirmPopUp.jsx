import "../css/Admin.css";
import AdminVoegByPopUp from "./AdminVoegByPopUp";

function ConfirmAdd({setIsConfirmOop, setIsPopupOop}){
    return(
        <>
            <div className="ConfirmAdd">
                <div>Is jy seker jy wil *** lokaal byvoeg?</div>
                <div className="JaNee">
                    <button onClick={() => {setIsConfirmOop(false); setIsPopupOop(false)}}>Ja</button>
                    <button onClick={() => setIsConfirmOop(false)}>Nee</button>
                </div>
            </div>
        </>
    )
}

function ConfirmDel({setIsConfirmOop}){
    return(
        <>
            <div className="ConfirmDel">
                <div>Is jy seker jy wil *** verwyder?</div>
                <div className="JaNee">
                    <button onClick={() => {setIsConfirmOop(false); setIsPopupOop(false)}}>Ja</button>
                    <button onClick={() => setIsConfirmOop(false)}>Nee</button>
                </div>
            </div>
        </>
    )
}

export default function AdminConfirmPopUp({setIsPopupOop, isConfirmOop, setIsConfirmOop, tipe}){
    if (!isConfirmOop) {
        return null;
    }

    return(
        <>
            <div className="Confirm_Houer" onClick={() => setIsConfirmOop(false)}>
                <div className="Confirm" onClick={(e)=> e.stopPropagation()}>
                    {tipe === "ConfirmAdd" && <ConfirmAdd setIsConfirmOop={setIsConfirmOop} setIsPopupOop={setIsPopupOop} />}
                    {tipe === "ConfirmDel" && <ConfirmDel setIsConfirmOop={setIsConfirmOop} setIsPopupOop={setIsPopupOop}/>}
                </div>
            </div>
        </>
    )
}