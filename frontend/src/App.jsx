import { useState } from "react";
import Header from "./components/Header";
import StudentContainer from "./components/StudentContainer";
import AdminContainer from "./components/AdminContainer";

function App() {

    return (
        <div className="app">
            <StudentContainer />
            {/* <AdminContainer /> */}
        </div>
    );
}

export default App;