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
        if (algoritmeLinks === "Merge Sort" && algoritmeRegs !== "") {
            let stap = 1;

            const volgendeStap = () => {
                mergeStapLinks(stap).then((sorted) => {
                    if (!sorted) {
                        stap++;
                        setTimeout(volgendeStap, 2500);
                    }
                });
            };

            volgendeStap();
        }
    }, [algoritmeLinks, algoritmeRegs]);

    const mergeStapLinks = (stap) => {
        const veld = volgens === "Naam" ? "fname" : "sname";
        const sortOrder = volgorde === "Asc";
        const endpoint = tipe === "admin" ? "users/mergesort/admin" : "users/mergesort";

        return fetch(`http://localhost:8000/${endpoint}/${veld}/${sortOrder}/${stap}`)
            .then((Response) => Response.json())
            .then((Data) => {
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
            });
    };

    // ------------------------------------- Merge Regter algoritme ------------------------------------
    useEffect(() => {
        if (algoritmeRegs === "Merge Sort" && algoritmeLinks !== "") {
            let stap = 1;

            const volgendeStap = () => {
                mergeStapRegs(stap).then((sorted) => {
                    if (!sorted) {
                        stap++;
                        setTimeout(volgendeStap, 2500);
                    }
                });
            };

            volgendeStap();
        }
    }, [algoritmeRegs]);

    const mergeStapRegs = (stap) => {
        const veld = volgens === "Naam" ? "fname" : "sname";
        const sortOrder = volgorde === "Asc";

        const endpoint = tipe === "admin" ? "users/mergesort/admin" : "users/mergesort";

        return fetch(
            `http://localhost:8000/${endpoint}/${veld}/${sortOrder}/${stap}`
        )
            .then((Response) => Response.json())
            .then((Data) => {
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
            });
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
                    <label>
                        <input
                            type="radio"
                            name="gebruikerTipe"
                            value= "almal"
                            checked={tipe === "almal"}
                            onChange={() => setTipe("almal")}
                        />
                        Almal
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
                            <option value="Merge Sort">Merge Sort</option>
                        </select>
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
                            <option value="Merge Sort">Merge Sort</option>
                        </select>
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