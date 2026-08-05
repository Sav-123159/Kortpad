import "../css/Admin.css";

export default function AdminLokaleInfo(){
    return(
        <div className="Info Lokale__Inligting" data-for-tab="Lokale">
            <div className="Lokaal__titel">
                <h2>Lokale</h2>
                <button>Voeg lokaal by.</button>
            </div>
            &ensp;Lokale gerigistreerd <br/>
            <div className="Lokale__kampus">
                <h3>Kampus: </h3>
                <select>
                    <option>Leriba Kampus</option>
                    <option>Gerhard Straat Kampus</option>
                    <option>Pearl Kampus</option>
                </select>
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Bitterbessie
                <button>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> L2   
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Bosvy
                <button>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> L2   
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Board Room 1
                <button>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> Sowel As   
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Board Room 2
                <button>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> Sowel As  
            </div>
            <div className="Lokale__lys">
                <h3>Lokaal Naam:</h3> Spys
                <button>&#x1F5D1;</button> <br/>
                <h3>Gebou Naam: </h3> Spys 
            </div>
        </div>     
    )
}