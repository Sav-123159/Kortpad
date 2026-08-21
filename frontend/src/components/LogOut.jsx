//die logout confirmation modal, ek haat html
export default function LogoutConfirmModal({ show, onConfirm, onCancel }) {
    if (!show) return null; //niks word gerender as show = false is nie

    return (
        <div className="login-page"> {/*gebruik vir nou login se styles. Savannah asb help want ek gaan nie vir 'n feit aan die css RAAK nie */}
            <div className="login-container">
                <div className="form">
                    <h3>Is jy dooooooood seker jy wil uitteken?</h3>
                    <div className="button-group">
                        <button className="form-button" onClick={onCancel}>
                            Kanseleer
                        </button>
                        <button className="form-button" onClick={onConfirm}>
                            Teken Uit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}