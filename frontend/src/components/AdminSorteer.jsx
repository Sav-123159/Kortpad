import "../css/Admin.css";
import { useState, useEffect, useRef } from "react";

export default function AdminSorteer(){
    const [tipe, setTipe] = useState("gebruiker");
    const [volgorde, setVolgorde] = useState("Asc");
    const [volgens, setVolgens] = useState("Van");
    const [algoritmeLinks, setAlgoritmeLinks] = useState("");
    const [algoritmeRegs, setAlgoritmeRegs] = useState("");

    const linksRef = useRef(null);
    const regsRef = useRef(null);

    // Vir die herstel funksionaliteit
    const linksTimerRef = useRef(null);
    const regsTimerRef = useRef(null);

    const linksRunRef = useRef(0);
    const regsRunRef = useRef(0);

    // Begin van die animasie useEffects 
    useEffect(() => { haalGebruikers();}, [tipe]);

    const haalGebruikers = async () => {
        try {
            const response = await fetch("http://localhost:8000/users");

            if (!response.ok) {
                throw new Error("Kon nie gebruikers laai nie.");
            }

            const data = await response.json();

            const gefiltreer = data.filter((gebruiker) => {
                if (tipe === "admin") {
                    return gebruiker.is_admin === true;
                }

                if (tipe === "gebruiker") {
                    return gebruiker.is_admin === false;
                }

                return true;
            });

            setGebruikersLinks(gefiltreer);
            setGebruikersRegs(gefiltreer);

        } catch (error) {
            console.error("Fout met laai van gebruikers:", error);
        }
    };

    const [gebruikersLinks, setGebruikersLinks] = useState([]);
    const [gebruikersRegs, setGebruikersRegs] = useState([]);
    const [vergelykLinks, setVergelykLinks] = useState([]);
    const [vergelykRegs, setVergelykRegs] = useState([]);

    // --------------------------- Merge Linker algoritme ----------------------------
    useEffect(() => {
        const runId = ++linksRunRef.current;
        if ((algoritmeLinks === "Merge Sort" || algoritmeLinks === "Insertion Sort" || algoritmeLinks === "Heap Sort" || algoritmeLinks === "Quick Sort") && algoritmeRegs !== "") {
            let stap = 1;

            const volgendeStap = () => {
                sorteerStapLinks(stap, runId).then((sorted) => {
                    if(runId !== linksRunRef.current) return;
                    
                    if (!sorted) {
                        stap++;
                        linksTimerRef.current = setTimeout(volgendeStap, 2500);
                    }
                });
            };

            volgendeStap();
        }

        return () => { clearTimeout(linksTimerRef.current);};

    }, [algoritmeLinks, algoritmeRegs]);

    const sorteerStapLinks = async (stap, runId) => {
        const veld = volgens === "Naam" ? "fname" : "sname";
        const sortOrder = volgorde === "Asc";
        const endpoint = algoritmeLinks === "Insertion Sort"
            ? (tipe === "admin" ? "users/insertionsort/admin" : "users/insertionsort")
            : algoritmeLinks === "Heap Sort" 
                ? (tipe === "admin" ? "users/heapsort/admin" : "users/heapsort")
                : algoritmeLinks === "Quick Sort"
                    ? (tipe === "admin" ? "users/quicksort/admin" : "users/quicksort")
                    :(tipe === "admin" ? "users/mergesort/admin" : "users/mergesort");

        const Response = await fetch(`http://localhost:8000/${endpoint}/${veld}/${sortOrder}/${stap}`);

        const Data = await Response.json();

        if (runId !== linksRunRef.current) return true;
                
            // Kry die huidige posisies van die elemente wat nou vergelyk word
            const eerste = linksRef.current.querySelector(`[data-user-id="${Data.compare[0]}"]`);
            const tweede = linksRef.current.querySelector(`[data-user-id="${Data.compare[1]}"]`);

            // getBoudingClientReact gee vir my waar die blokkies op die skerm is vir die animasie
            const eerstePosisie = eerste.getBoundingClientRect();
            const tweedePosisie = tweede.getBoundingClientRect();

            setVergelykLinks(Data.compare);

            // Lry die posisies van die elemente na die verandering
            setTimeout(() => {
                setGebruikersLinks(Data.users);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const nuweEerste = linksRef.current.querySelector(`[data-user-id="${Data.compare[0]}"]`);

                        const nuweTweede = linksRef.current.querySelector(`[data-user-id="${Data.compare[1]}"]`);

                        const nuweEerstePosisie = nuweEerste.getBoundingClientRect();
                        const nuweTweedePosisie = nuweTweede.getBoundingClientRect();
                        
                        // Bereken gebaseer op waar hy was, waantoe moet hy skuif in px
                        const eersteBeweging = eerstePosisie.left - nuweEerstePosisie.left;
                        const tweedeBeweging = tweedePosisie.left - nuweTweedePosisie.left;
                    
                        // Sit hulle onmiddellik op hulle ou posisie
                        nuweEerste.style.transition = "none";
                        nuweTweede.style.transition = "none";

                        nuweEerste.style.transform = `translateX(${eersteBeweging}px)`;
                        nuweTweede.style.transform = `translateX(${tweedeBeweging}px)`;

                        // Laat hulle daarna na hulle nuwe posisie beweeg
                        requestAnimationFrame(() => {
                            nuweEerste.style.transition = "transform 1.5s ease";
                            nuweTweede.style.transition = "transform 1.5s ease";

                            nuweEerste.style.transform = "translateX(0)";
                            nuweTweede.style.transform = "translateX(0)";
                        });
                    });
                });
            }, 800);
        return Data.sorted;       
    };

    // ------------------------------------- Merge Regter algoritme ------------------------------------
    useEffect(() => {
        const runId = ++ regsRunRef.current;

        if ((algoritmeRegs === "Merge Sort" || algoritmeRegs === "Insertion Sort" || algoritmeRegs === "Heap Sort" || algoritmeRegs === "Quick Sort") && algoritmeLinks !== "") {
            let stap = 1;

            const volgendeStap = () => {
                sorteerStapRegs(stap, runId).then((sorted) => {
                    if(runId !== regsRunRef.current) return;
                    
                    if (!sorted) {
                        stap++;
                        regsTimerRef.current = setTimeout(volgendeStap, 2500);
                    }
                });
            };

            volgendeStap();
        }

        return () => {clearTimeout(regsTimerRef.current);};

    }, [algoritmeRegs, algoritmeLinks]);

    const sorteerStapRegs = async (stap, runId) => {
        const veld = volgens === "Naam" ? "fname" : "sname";
        const sortOrder = volgorde === "Asc";

        const endpoint = algoritmeRegs === "Insertion Sort"
        ? (tipe === "admin" ? "users/insertionsort/admin" : "users/insertionsort")
        : algoritmeRegs === "Heap Sort"
            ? (tipe === "admin" ? "users/heapsort/admin" : "users/heapsort") 
            : algoritmeRegs === "Quick Sort"
                ? (tipe === "admin" ? "users/quicksort/admin" : "users/quicksort")
                :(tipe === "admin" ? "users/mergesort/admin" : "users/mergesort");

        const Response = await fetch(`http://localhost:8000/${endpoint}/${veld}/${sortOrder}/${stap}`);

        const Data = await Response.json();

        if (runId !== regsRunRef.current) return true;
            const eerste = regsRef.current.querySelector(`[data-user-id="${Data.compare[0]}"]`);
            const tweede = regsRef.current.querySelector(`[data-user-id="${Data.compare[1]}"]`);

            const eerstePosisie = eerste.getBoundingClientRect();
            const tweedePosisie = tweede.getBoundingClientRect();

            setVergelykRegs(Data.compare);

            setTimeout(() => {
                setGebruikersRegs(Data.users);

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const nuweEerste = regsRef.current.querySelector(
                            `[data-user-id="${Data.compare[0]}"]`
                        );

                        const nuweTweede = regsRef.current.querySelector(
                            `[data-user-id="${Data.compare[1]}"]`
                        );

                        const nuweEerstePosisie = nuweEerste.getBoundingClientRect();
                        const nuweTweedePosisie = nuweTweede.getBoundingClientRect();

                        const eersteBeweging =
                            eerstePosisie.left - nuweEerstePosisie.left;

                        const tweedeBeweging =
                            tweedePosisie.left - nuweTweedePosisie.left;

                        nuweEerste.style.transition = "none";
                        nuweTweede.style.transition = "none";

                        nuweEerste.style.transform =`translateX(${eersteBeweging}px)`;

                        nuweTweede.style.transform =`translateX(${tweedeBeweging}px)`;

                        requestAnimationFrame(() => {
                            nuweEerste.style.transition = "transform 1.5s ease";
                            nuweTweede.style.transition = "transform 1.5s ease";

                            nuweEerste.style.transform = "translateX(0)";
                            nuweTweede.style.transform = "translateX(0)";
                        });
                    });
                });
            }, 800);

        return Data.sorted;
    };

    // Herstel funksie sodat jy meer as 1 algoritme kan toets
    const herstel = () => {
        clearTimeout(linksTimerRef.current);
        clearTimeout(regsTimerRef.current);

        linksRunRef.current++
        regsRunRef.current++

        setAlgoritmeLinks("");
        setAlgoritmeRegs("");

        setVergelykLinks([]);
        setVergelykRegs([]);

        haalGebruikers();
    }

    const kryGrootO = (algoritme) => {
        if (algoritme === "Bubble Sort") 
            {return "O(n²)";} 

        else if (algoritme === "Insertion Sort") 
            {return "O(n²)";} 

        else if (algoritme === "Heap Sort") 
            {return "O(n log n)";} 

        else if (algoritme === "Quick Sort") 
            {return "O(n log n) gemiddeld";} 

        else if (algoritme === "Merge Sort") 
            {return "O(n log n)";} 

        else {return "";}
    };

    return(
        <div className="Info Sorteer_Gebruiker" data-for-tab = "AdminSorteer">
            <div>
                <h2>Sorteer gebruikers</h2>
            </div>
            <div className="Keuses">
                <div className="Sorteer_Keuse">
                    <label>
                        <input
                            type="radio"
                            name="gebruikerTipe"
                            value="gebruiker"
                            checked={tipe === "gebruiker"}
                            onChange={() => setTipe("gebruiker")}
                        />
                        Gewone gebruikers
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="gebruikerTipe"
                            value="admin"
                            checked={tipe === "admin"}
                            onChange={() => setTipe("admin")}
                        />
                        Admins
                    </label>
                </div>
                <div className="Sorteer_Keuse">
                    <label>
                        <input
                            type="radio"
                            name="sorteerVolgorde"
                            value= "Desc"
                            checked={volgorde === "Desc"}
                            onChange={() => setVolgorde("Desc")}
                        />
                        Z - A
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="sorteerVolgorde"
                            value= "Asc"
                            checked={volgorde === "Asc"}
                            onChange={() => setVolgorde("Asc")}
                        />
                        A - Z
                    </label>
                </div>
                <div className="Sorteer_Keuse">
                    <label>
                        <input
                            type="radio"
                            name="sorteerVolgens"
                            value= "Naam"
                            checked={volgens === "Naam"}
                            onChange={() => setVolgens("Naam")}
                        />
                        Volgens Naam
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="sorteerVolgens"
                            value= "Van"
                            checked={volgens === "Van"}
                            onChange={() => setVolgens("Van")}
                        />
                        Volgens Van
                    </label>
                </div>
                <button onClick={herstel}>Herstel</button>
            </div>
            <div className="Sorteer_Blokke">
                <div className="Algoritme">
                    <div className="Lokale__kampus">
                        <select
                            value={algoritmeLinks}
                            onChange={(e) => setAlgoritmeLinks(e.target.value)}
                        >
                            <option value="">Kies algoritme</option>
                            <option value="bubblesort">Bubble Sort</option>
                            <option value="Insertion Sort">Insertion Sort</option>
                            <option value="Heap Sort">Heap Sort</option>
                            <option value="Quick Sort">Quick Sort</option>
                            <option value="Merge Sort">Merge Sort</option>
                        </select>

                        <h3 className="GrootO"> {kryGrootO(algoritmeLinks)}</h3>
                        
                    </div>
                    <div className="Organiseering" ref={linksRef}>
                        {gebruikersLinks.map((gebruiker) => (
                            <div key={gebruiker.user_id} data-user-id={gebruiker.user_id} className={vergelykLinks.includes(gebruiker.user_id) ? "Vergelyk" : ""}>
                                {gebruiker.fname} {gebruiker.sname}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="Algoritme">
                    <div className="Lokale__kampus">
                        <select
                            value={algoritmeRegs}
                            onChange={(e) =>setAlgoritmeRegs(e.target.value)}
                        >
                            <option value="">Kies algoritme</option>
                            <option value="bubblesort">Bubble Sort</option>
                            <option value="Insertion Sort">Insertion Sort</option>
                            <option value="Heap Sort">Heap Sort</option>
                            <option value="Quick Sort">Quick Sort</option>
                            <option value="Merge Sort">Merge Sort</option>
                        </select>

                        <h3 className="GrootO"> {kryGrootO(algoritmeRegs)}</h3>
                    </div>
                    <div className="Organiseering" ref={regsRef}>
                        {gebruikersRegs.map((gebruiker) => (
                            <div key={gebruiker.user_id} data-user-id={gebruiker.user_id} className={vergelykRegs.includes(gebruiker.user_id) ? "Vergelyk" : ""}>
                                {gebruiker.fname} {gebruiker.sname}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}