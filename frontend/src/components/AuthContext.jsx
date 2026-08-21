import {createContext, useContext, useState, useEffect } from "react";

//die context is leesbaar van enige bladsy, kyk of jy ingelog is
const AuthContext = createContext(null);

export function AuthProvider({ children }){

    //kyk localstorage vir vorige user
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null; 
    });

    //as user verander, verander localstorage
    useEffect(() => {
        
        if(user){
            localStorage.setItem("user", JSON.stringify(user));
        }
        else{
            localStorage.removeItem("user");
        }
    }, [user]);

    //suksevole login
    function login(userData){
        setUser(userData);
    }

    function logout(){
        setUser(null);
    }
    
    //kinders van AuthProvider kry useAuth en kry die 4 waardes / alles wat nested is in AuthContext (die hele program, omdat dit by main.jsx so gestell is)
    return(<AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>{children}</AuthContext.Provider>);
}

//const { user, isLoggedIn, logout } = useAuth()
export function useAuth(){
    return useContext(AuthContext);
}