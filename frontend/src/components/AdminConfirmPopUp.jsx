import "../css/Admin.css";

function ConfirmAdd({setIsConfirmOop, setIsPopupOop, lokaalNaam, equipNaam, onConfirm}){
    return(
        <div className="ConfirmAdd">
            <div>
                {equipNaam
                    ? `Is jy seker jy wil ${equipNaam} by ${lokaalNaam} byvoeg?`
                    : `Is jy seker jy wil ${lokaalNaam} lokaal byvoeg?`
                }
            </div>
            <div className="JaNee">
                <button onClick={() => {onConfirm(); setIsConfirmOop(false); setIsPopupOop(false);}}>Ja</button>
                <button onClick={() => setIsConfirmOop(false)}>Nee</button>
            </div>
        </div>  
    )
}

function ConfirmDel({setIsConfirmOop, onConfirm, itemName}){
    return(
        <>
            <div className="ConfirmDel">
                <div>Is jy seker jy wil {itemName} verwyder?</div>
                <div className="JaNee">
                    <button onClick={() => {onConfirm(); setIsConfirmOop(false);}}>Ja</button>
                    <button onClick={() => setIsConfirmOop(false)}>Nee</button>
                </div>
            </div>
        </>
    )
}

function CapacityError({setIsConfirmOop, venueCapacity, requestedCapacity}) {
    return(
        <div className="CapacityError">
            <div> Daar is nie genoeg spasie in hierdie lokaal nie.</div>

            <div>
                Die lokaal se maksimum kapasiteit is {venueCapacity},
                maar jou versoekte kapasiteit is {requestedCapacity} .
            </div>

            <div className="JaNee">
                <button onClick={() => setIsConfirmOop(false)}>
                    Kansalleer
                </button>
            </div>

        </div>
    )
}


export default function AdminConfirmPopUp({setIsPopupOop, isConfirmOop, setIsConfirmOop, tipe, onConfirm, itemName, venueCapacity, requestedCapacity, lokaalNaam, equipNaam}){
    if (!isConfirmOop) {
        return null;
    }

    return(
        <>
            <div className="Confirm_Houer" onClick={() => setIsConfirmOop(false)}>
                <div className="Confirm" onClick={(e)=> e.stopPropagation()}>
                    {tipe === "ConfirmAdd" && <ConfirmAdd setIsConfirmOop={setIsConfirmOop} setIsPopupOop={setIsPopupOop} lokaalNaam={lokaalNaam} equipNaam={equipNaam} onConfirm={onConfirm}/>}
                    {tipe === "ConfirmDel" && <ConfirmDel setIsConfirmOop={setIsConfirmOop} onConfirm={onConfirm} itemName={itemName} />}
                    {tipe === "CapacityError" && <CapacityError setIsConfirmOop={setIsConfirmOop} venueCapacity={venueCapacity} requestedCapacity={requestedCapacity}/>}
                </div>
            </div>
        </>
    )
}