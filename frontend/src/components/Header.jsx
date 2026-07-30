export default function Header(){
    return (
        <header className="HeadNav">
            <div className="Logo">
                <img src="/Kortpad_LOGO.jpeg" alt="Kortpad logo"/>
            </div>
            <div className="Nav">
                <button>
                    Student
                </button>
                <button>
                    Admin
                </button>
            </div>
        </header>
    );
}