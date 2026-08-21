import PopupAnimation from "./PopupAnimation";
import { useEffect, useRef } from "react";

export default function LogoutConfirmModal({ show, onConfirm, onCancel, onClose }) {
    

//----------------------- OPEN, CLOSE AND RESET MODAL -----------------------

    const modalRef = useRef(null);

    useEffect(() => {
        const closeModalonClickOut = (e) => {
            if (
                show &&
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                onClose
            ) {
                onClose();
            }
        };

        const closeModalOnEscKeyDown = (e) => {
            if (show && e.code === "Escape" && onClose) {
                onClose();
            }
        };

        document.body.addEventListener("mousedown", closeModalonClickOut);
        document.addEventListener("keydown", closeModalOnEscKeyDown);

        return () => {
            document.body.removeEventListener("mousedown", closeModalonClickOut);
            document.removeEventListener("keydown", closeModalOnEscKeyDown);
        };
    }, [show, onClose]);


    function onCancelClicked() {
        if (onClose) onClose();
        if (onCancel) onCancel();
    }

    if (!show) return null;

    return (
            <div className="logout-page">
                <PopupAnimation as="div" className="logout-container" ref={modalRef}>
                        <div className="form">
                            <h3>Is jy seker jy wil uit teken?</h3>
                            <div className="button-group">
                                <button className="form-button" onClick={() => {
                                                                    onCancel();
                                                                    onCancelClicked();
                                                                }}>
                                    Kanseleer
                                </button>
                                <button className="form-button" onClick={onConfirm}>
                                    Teken Uit
                                </button>
                            </div>
                        </div>
                </PopupAnimation>
            </div>
    );
}

