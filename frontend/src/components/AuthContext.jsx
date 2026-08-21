import {createContext, useContext, useState, useEffect } from "react";

//Context is accessible from any page, checks if user is logged in
const AuthContext = createContext(null);

export function AuthProvider({ children }){

    //Look in local storage for possible previous user
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null; 
    });

    //if user has changed, update local storage
    useEffect(() => {
        
        if(user){
            localStorage.setItem("user", JSON.stringify(user));
        }
        else{
            localStorage.removeItem("user");
        }
    }, [user]);

    //Successful login
    function login(userData){
        setUser(userData);
    }

    function logout(){
        setUser(null);
    }

    //Children of AuthProvider get useAuth and the 4 values
    return(<AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>{children}</AuthContext.Provider>);
}

//const { user, isLoggedIn, logout } = useAuth()
export function useAuth(){
    return useContext(AuthContext);
}