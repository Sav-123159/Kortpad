import "../css/Admin.css";

export default function AdminToerusting(){
    return(
        <div className="Info Toerusting__Inligting" data-for-tab="Toerusting">
            <div className="Toerusting__title">
                <h2>Lokale Toerusting</h2>
                <button>Voeg toerusting by.</button>
            </div>
            &ensp;Toerusting in elke lokaal  
            <div className="Lokale__kampus">
                <label htmlFor="kampus">Kampus: </label>
                <select name="kampus" id="kampus">
                    <option>Leriba Kampus</option>
                    <option>Gerhard Straat Kampus</option>
                    <option>Pearl Kampus</option>
                </select>
                &ensp;&ensp;
                <label htmlFor="lokale">Lokaal: </label>
                <select name="lokale" id="lokale">
                    <option>Bitterbessie</option>
                    <option>Bosvy</option>
                    <option>Koning Protea</option>
                </select>
            </div>
            <div> {/* Die values moet wees watookal in die databasis is gelink met die kampus en lokaal*/}
                <div className="Lokale__lys">
                    <input type="checkbox" id="toerusting1" name="toerusting1"/>
                    <label htmlFor="toerusting1">Witbord</label>
                </div>
                <div className="Lokale__lys">
                    <input type="checkbox" id="toerusting2" name="toerusting2"/>
                    <label htmlFor="toerusting2">Groenbord</label>
                </div>
                <div className="Lokale__lys">
                    <input type="checkbox" id="toerusting3" name="toerusting3"/>
                    <label htmlFor="toerusting3">Projektor</label>
                </div>
                <div className="Lokale__lys">
                    <label htmlFor="toerusting4">Stoele: </label>
                    <input type="number" id="toerusting4" name="toerusting4" min="0" step="1" defaultValue="0"/>    
                </div>
                <div className="Lokale__lys">
                    <label htmlFor="toerusting5">Tafels: </label>
                    <input type="number" id="toerusting5" name="toerusting5" min="0" step="1" defaultValue="0"/>    
                </div>
                <div className="Lokale__lys">
                    Item
                </div>
                <div className="Lokale__lys">
                    Item
                </div>
                <div className="Lokale__lys">
                    Item
                </div>
            </div>
        </div>
    )
}