import { act, useState } from "react";
import Header from "./components/Header";
import StudentContainer from "./components/StudentContainer";
import AdminContainer from "./components/AdminContainer";


function App() {

    const [activeTab, setActiveTab] = useState("AdminLokaleInfo");
    console.log(activeTab);

    return (
        <div className="app">
            <StudentContainer />
            {/* <AdminContainer /> */}
        </div>
    );
}

export default App;