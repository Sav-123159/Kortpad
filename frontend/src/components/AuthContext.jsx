import {createContext, useContext, useState, useEffect } from "react";

//Maak gebruiker (user) konteks beskikbaar op enige webbladsy

//Kyk in localstorage vir gebruiker (user)
//  if empty -> geen gebruiker (logged out)
//  if not empty -> gebruiker besonderhede, UserBase(fname, sname, email, is_admin) -> gebruik backend UserBase model

//As gebruiker verander -> wysig localstorage

//AuthContext.Provider gee onderlinge metodes -> user, login, logout, isLoggedIn: !!user
//import { useAuth } from "./AuthContext" -> voor in om AuthContext se onderlinge metodes te gebruik

const AuthContext = createContext(null);

export function AuthProvider({ children }){

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null; 
    });

    useEffect(() => {
        
        if(user){
            localStorage.setItem("user", JSON.stringify(user));
        }
        else{
            localStorage.removeItem("user");
        }
    }, [user]);

    function login(userData){
        setUser(userData);
    }

    function logout(){
        setUser(null);
    }

    return(<AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>{children}</AuthContext.Provider>);
}

export function useAuth(){
    return useContext(AuthContext);
}
