import PopupAnimation from "./PopupAnimation";
import { useEffect, useRef } from "react";

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

