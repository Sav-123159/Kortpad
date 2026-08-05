import "../css/Admin.css"

export default function AdminBesprekings(){
    return(
        <div className="Info Besprekings__Inligting" data-for-tab="Besprekings">
            <h2>Besprekings</h2>
            &ensp;Besprekings word hier gemaak en bevestig.
            <form>
                <fieldset>
                    <label htmlFor="name">Naam van bespreking</label>
                    <input type="text" id="name" name="name"/> <br/>

                    <label htmlFor="kapasiteit">Kapasiteit</label>
                    <input type="number" id="kapasiteit" name="kapasiteit"/> <br/>

                    <label htmlFor="tyd">Tyd</label>
                    <input type="time" id="time" name="time"/> <br/>

                    <label htmlFor="kampus">Kampus: </label>
                    <select name="kampus" id="kampus">
                        <option>Leriba Kampus</option>
                        <option>Gerhard Straat Kampus</option>
                        <option>Pearl Kampus</option>
                    </select> <br/>

                    <label htmlFor="lokaal">Lokaal: </label>
                    <select name="lokaal" id="lokaal">
                        <option>Bitterbessie</option>
                        <option>Bosvy</option>
                        <option>Koning Protea</option>
                    </select>
                </fieldset>
                
                <button type="submit">Bevestig</button>     
            </form>
        </div>
    )
}