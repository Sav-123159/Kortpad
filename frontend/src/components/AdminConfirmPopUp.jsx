// import die popupAnimation sodat die bevestiging boodskappe eegalig opkom
import "../css/Admin.css";
import PopupAnimation from "./PopupAnimation";
import { useRef } from "react";

// Bevestig 'n byvoeging
function ConfirmAdd({setIsConfirmOop, setIsPopupOop, lokaalNaam, equipNaam, onConfirm}){
    // Bou die popup
    // gebruik 'n if konep om te besluit of ek watter bevestiging ek deurstuur afhangende van of dit vir 'n lokaal is of toerusting
    // Ja of nee knoppie wat die popup toemaak en die vorm toemaak afhangend van wat gedruk word
    return(
        <div className="ConfirmAdd">
            <div>
                {equipNaam
                    ? `Is jy seker jy wil ${equipNaam} by ${lokaalNaam} byvoeg?`
                    : `Is jy seker jy wil ${lokaalNaam} lokaal byvoeg?`
                }
            </div>
            <div className="JaNee">
                <button type="button" onClick={() => {onConfirm(); setIsConfirmOop(false); setIsPopupOop(false);}}>Ja</button>
                <button type="button" onClick={() => setIsConfirmOop(false)}>Nee</button>
            </div>
        </div>  
    )
}

// Bevestig of die gebruiker die item wil verwyder
// Werk met dieselfde konsep as die byvoeg bevestiging
function ConfirmDel({setIsConfirmOop, onConfirm, itemName}){
    return(
        <div className="ConfirmDel">
            <div>Is jy seker jy wil {itemName} verwyder?</div>
            <div className="JaNee">
                <button onClick={async() => {await onConfirm(); setIsConfirmOop(false);}}>Ja</button>
                <button onClick={() => setIsConfirmOop(false)}>Nee</button>
            </div>
        </div>
    )
}

// bevestig of gebruiker bygevoeg gaan word
// Gebruik 'n if konsep om te bepaal of die gebruiker as n admin of as n gebruiker bygevoeg word
function ConfirmGebruiker({ setIsConfirmOop, setIsPopupOop, gebruikerNaam, isAdmin, onConfirm }) {
    return (
        <div className="ConfirmAdd">
            <div>
                {isAdmin
                    ? `Is jy seker jy wil ${gebruikerNaam} as 'n admin byvoeg?`
                    : `Is jy seker jy wil ${gebruikerNaam} as gebruiker byvoeg?`
                }
            </div>
            <div className="JaNee">
                <button onClick={() => { onConfirm(); setIsConfirmOop(false); setIsPopupOop(false); }}>Ja</button>
                <button onClick={() => setIsConfirmOop(false)}>Nee</button>
            </div>
        </div>
    );
}

// Hierdie funksie hanteer die admin se besprekings wat gemaak word of oorgeskryf word
function HanteerBespreking({setIsConfirmOop, venueCapacity, requestedCapacity, selectedCampus, selectedBuilding, selectedVenue, duur, datumTyd, onConfirm}) {

    // Error handling om te bepaal of alle waardes ingevul is, as nie gooi dit n popup error
    if(!selectedCampus || !selectedBuilding || !selectedVenue || !Number(requestedCapacity) || !datumTyd){
        return (
            <div className="BevestigErr">
                <div>Al die velde moet ingevul wees.</div>
                <div className="JaNee">
                    <button onClick={() => setIsConfirmOop(false)}>Ok</button>
                </div>
            </div>
        );
    }

    // Bepaal of die hoeveelheid kapasiteit wat die gekose lokaal het genoeg is vir wat die admin nodig het
    // As nie gooi hy n popup error
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
    // Kry vandag se datum
    // Kry die hoeveelheid dae tot die einde van die skool week (Ma - Sat)
    const vandag = new Date();
    const daeTotSat = 6 - vandag.getDay();
    
    // Kry die datum van die einde van die huidige week
    // bepaal en set die datum van die einde van die week
    // bepaal en set die presiese uur tot die einde van die skool week
    const eindeVanWeek = new Date(vandag);
    eindeVanWeek.setDate(vandag.getDate() + daeTotSat);
    eindeVanWeek.setHours(23, 59, 59, 999);
    
    // verander die datum na JS objek toe sodat ons kan errors toets daarmee
    // Kry minuut gedeelte van die gekose tyd
    //kry die uur gedeelte van die gekose tyd
    const selectedDatumTyd = new Date(datumTyd);
    const min = selectedDatumTyd.getMinutes();
    const uur = selectedDatumTyd.getHours();

    // Toets dat die gekose datum binne die toelaatbare skool dae is
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

    // Toets dat die gekose tyd net in uur grepe is
    if(min !== 0){
        return (
            <div className="BevestigErr">
                <div>Tyd moet in uur grepe wees.</div>
                <div className="JaNee">
                    <button onClick={() => setIsConfirmOop(false)}>Ok</button>
                </div>
            </div>
        );
    }

    //Toets dat die gekose tyd binne werks ure is
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

    // Bepaal die begin en eind tyd van die sessie
    const start = new Date(datumTyd); 
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + Number(duur));

    // Stuur bevestigings boodskap deur
    return(
        <div className="Bevestig">
            <p>Wil U die bespreking bevestig/oorskryf?</p>
            <div className="JaNee">
                <button onClick={async () => {await onConfirm(); setIsConfirmOop(false);}}>Ja</button>
                <button onClick={() => setIsConfirmOop(false)}>Nee</button>
            </div>
        </div>
    )
}

// Kan hierdie komponent vanuit ander lêers invoer bv. vir die Delete en Add
export default function AdminConfirmPopUp({setIsPopupOop, isConfirmOop, setIsConfirmOop, tipe, onConfirm, itemName, venueCapacity, requestedCapacity, lokaalNaam, equipNaam, gebruikerNaam, isAdmin, selectedCampus, selectedBuilding, selectedVenue, duur, datumTyd,}){

    const modalRef = useRef(null);

    // As hy nie oop is nie moet die komponent niks render nie
    if (!isConfirmOop) {
        return null;
    }
    // Gebruik tipe veranderlike om te bepaal watter funksie geroep en gelaai gaan word
    // stopPropagation maak net dat as die gebruiker op die popup klik dan maak hy nie toe nie
    // As die gebruiker erens anders klik maak die popup toe
    return(
        <>
            <div className="Confirm_Houer" onClick={() => setIsConfirmOop(false)}>
                <PopupAnimation as="div" className="Confirm" onClick={(e)=> e.stopPropagation()}>
                    {tipe === "ConfirmAdd" && <ConfirmAdd setIsConfirmOop={setIsConfirmOop} setIsPopupOop={setIsPopupOop} lokaalNaam={lokaalNaam} equipNaam={equipNaam} onConfirm={onConfirm}/>}
                    {tipe === "ConfirmGebruiker" && (
                        <ConfirmGebruiker
                            setIsConfirmOop={setIsConfirmOop}
                            setIsPopupOop={setIsPopupOop}
                            gebruikerNaam={gebruikerNaam}
                            isAdmin={isAdmin}
                            onConfirm={onConfirm}
                        />
                    )}
                    {tipe === "ConfirmDel" && <ConfirmDel setIsConfirmOop={setIsConfirmOop} onConfirm={onConfirm} itemName={itemName} />}
                    {tipe === "HanteerBespreking" && <HanteerBespreking setIsConfirmOop={setIsConfirmOop} venueCapacity={venueCapacity} requestedCapacity={requestedCapacity} 
                        selectedCampus={selectedCampus} selectedBuilding={selectedBuilding} selectedVenue={selectedVenue} duur={duur} datumTyd={datumTyd} onConfirm={onConfirm}/>}
                </PopupAnimation>
            </div>
        </>
    )
}