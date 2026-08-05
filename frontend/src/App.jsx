import { act, useState } from "react";
import Header from "./components/Header";
import StudentContainer from "./components/StudentContainer";
import AdminContainer from "./components/AdminContainer";


function App() {
    const [aktieweContainer, setAktieweContainer] = useState("StudentContainer");

    return (
        <div className="app">
            <Header 
            aktieweContainer={aktieweContainer}
            setAktieweContainer={setAktieweContainer}/>
            
            {aktieweContainer === "StudentContainer" && <StudentContainer />}
            {aktieweContainer === "AdminContainer" && <AdminContainer />}
        </div>
    );
}

export default App;