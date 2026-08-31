//Invoere
import PopupAnimation from "./PopupAnimation";
import { useRef } from "react";

/*
    Herbruikbare bevestigings popup, wys slegs as show waar is.
    Die prompt is die vraag teks wat ingevoer word as 'n prop.
    Die bevestig en kanseleer knoppies gebruik die event handlers van hul ouer komponent
*/
export default function GeneralPopupModal({ show, onConfirm, onCancel, prompt }) {
    const modalRef = useRef(null);
    if (!show) return null;

    return (
        <div className="popup-page">
            <PopupAnimation as="div" className="popup-container" ref={modalRef}>
                <div className="form">
                    <h3>{prompt}</h3>
                    <div className="button-group">
                        <button className="form-button" onClick={onConfirm}>
                            Bevestig
                        </button>
                        <button className="form-button" onClick={onCancel}>
                            Kanseleer
                        </button>
                    </div>
                </div>
            </PopupAnimation>
        </div>
    );
}
