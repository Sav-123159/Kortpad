import "../css/Admin.css";
import { useState } from "react";

export default function AdminSorteer(){
    const [tipe, setTipe] = useState("gebruiker");
    const [volgorde, setVolgorde] = useState("Asc");
    const [volgens, setVolgens] = useState("Van");
    const [algoritmeLinks, setAlgoritmeLinks] = useState("");
    const [algoritmeRegs, setAlgoritmeRegs] = useState("");
    return(
        <div className="Info Sorteer_Gebruiker" data-for-tab = "AdminSorteer">
            <div>
                <h2>Sorteer gebruikers</h2>
            </div>
            <div className="Keuses">
                <div className="Gebruiker_Keuse">
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
                <div className="Gebruiker_Keuse">
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
                <div className="Gebruiker_Keuse">
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
                            <option value="bubblesort">Bubble Sort</option>
                            <option value="Insertion Sort">Insertion Sort</option>
                        </select>
                    </div>
                    <div className="Organiseering">
                        Bubbles 
                    </div>
                </div>
                <div className="Algoritme">
                    <div className="Lokale__kampus">
                        <select
                            value={algoritmeRegs}
                            onChange={(e) =>setAlgoritmeRegs(e.target.value)}
                        >
                            <option value="bubblesort">Bubble Sort</option>
                            <option value="Insertion Sort">Insertion Sort</option>
                        </select>
                    </div>
                    <div className="Organiseering">
                        Insertion
                    </div>
                </div>
            </div>
        </div>
    )
}