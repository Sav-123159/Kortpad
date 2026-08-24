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
        <div className="ConfirmDel">
            <div>Is jy seker jy wil {itemName} verwyder?</div>
            <div className="JaNee">
                <button onClick={() => {onConfirm(); setIsConfirmOop(false);}}>Ja</button>
                <button onClick={() => setIsConfirmOop(false)}>Nee</button>
            </div>
        </div>
    )
}

function HanteerBespreking({setIsConfirmOop, venueCapacity, requestedCapacity, selectedCampus, selectedBuilding, selectedVenue, naam, datumTyd}) {

    if(!selectedCampus || !selectedBuilding || !selectedVenue || !naam.trim() || !Number(requestedCapacity) || !datumTyd){
        return (
            <div className="BevestigErr">
                <div>Al die velde moet ingevul wees.</div>
                <div className="JaNee">
                    <button onClick={() => setIsConfirmOop(false)}>Ok</button>
                </div>
            </div>
        );
    }

    if(Number(requestedCapacity) > venueCapacity){
        return (
            <div className="BevestigErr">
                <div>Die lokaal se kapasiteit is te min.</div>
                <div className="JaNee">
                    <button onClick={() => setIsConfirmOop(false)}>Ok</button>
                </div>
            </div>
        );
    }

    // Datum en Tyd validasie
    const vandag = new Date();
    const daeTotSat = 6 - vandag.getDay();
    
    const eindeVanWeek = new Date(vandag);
    eindeVanWeek.setDate(vandag.getDate() + daeTotSat);
    eindeVanWeek.setHours(23, 59, 59, 999);
    
    const selectedDatumTyd = new Date(datumTyd);
    const min = selectedDatumTyd.getMinutes();
    const uur = selectedDatumTyd.getHours();

    if (selectedDatumTyd < vandag || selectedDatumTyd > eindeVanWeek){
        return (
            <div className="BevestigErr">
                <div>Die datum is buite die korrekte grense.</div>
                <div className="JaNee">
                    <button onClick={() => setIsConfirmOop(false)}>Ok</button>
                </div>
            </div>
        );
    }

    if(min !== 0 && min !== 30){
        return (
            <div className="BevestigErr">
                <div>Tyd moet in hald uur grepe wees.</div>
                <div className="JaNee">
                    <button onClick={() => setIsConfirmOop(false)}>Ok</button>
                </div>
            </div>
        );
    }

    if(uur < 8 || uur > 17){
        return (
            <div className="BevestigErr">
                <div>Die tyd moet binne die universiteit se oop ure wees.</div>
                <div className="JaNee">
                    <button onClick={() => setIsConfirmOop(false)}>Ok</button>
                </div>
            </div>
        );
    }

    return(
        <div className="Bevestig">
            <p>Wil U die bespreking bevestig/oorskryf?</p>
            <div className="JaNee">
                <button onClick={() => setIsConfirmOop(false)}>Ja</button>
                <button onClick={() => setIsConfirmOop(false)}>Nee</button>
            </div>
        </div>
    )
}


export default function AdminConfirmPopUp({setIsPopupOop, isConfirmOop, setIsConfirmOop, tipe, onConfirm, itemName, venueCapacity, requestedCapacity, lokaalNaam, equipNaam, selectedCampus, selectedBuilding, selectedVenue, naam, datumTyd}){
    if (!isConfirmOop) {
        return null;
    }

    return(
        <>
            <div className="Confirm_Houer" onClick={() => setIsConfirmOop(false)}>
                <div className="Confirm" onClick={(e)=> e.stopPropagation()}>
                    {tipe === "ConfirmAdd" && <ConfirmAdd setIsConfirmOop={setIsConfirmOop} setIsPopupOop={setIsPopupOop} lokaalNaam={lokaalNaam} equipNaam={equipNaam} onConfirm={onConfirm}/>}
                    {tipe === "ConfirmDel" && <ConfirmDel setIsConfirmOop={setIsConfirmOop} onConfirm={onConfirm} itemName={itemName} />}
                    {tipe === "HanteerBespreking" && <HanteerBespreking setIsConfirmOop={setIsConfirmOop} venueCapacity={venueCapacity} requestedCapacity={requestedCapacity} 
                        selectedCampus={selectedCampus} selectedBuilding={selectedBuilding} selectedVenue={selectedVenue} naam={naam} datumTyd={datumTyd}/>}
                </div>
            </div>
        </>
    )
}