import "../css/Admin.css";

export default function AdminRoosters(){
    return(
        <div className="Info Roosters__Inligting" data-for-tab="Roosters">
            <h2>Roosters</h2>
            &ensp;Semester roosters vir Lokale
            <div className="Lokale__kampus">
                <label htmlFor="kampus">Kampus: </label>
                <select name="kampus" id="kampus">
                    <option>Leriba Kampus</option>
                    <option>Gerhard Straat Kampus</option>
                    <option>Pearl Kampus</option>
                </select>
                &ensp;&ensp;
                <label htmlFor="Lokaal">Lokaal: </label>
                <select name="lokaal" id="lokaal">
                    <option>Bitterbessie</option>
                    <option>Bosvy</option>
                    <option>Koning Protea</option>
                </select>
            </div>
            {/* Als gehardcode maar ons gaan dit dinamies maak */}
            <div className="rooster">
                <div className="dag">Tyd</div>
                <div className="dag">Maandag</div>
                <div className="dag">Dinsdag</div>
                <div className="dag">Woensdag</div>
                <div className="dag">Donderdag</div>
                <div className="dag">Vrydag</div>

                <div className="tye">08:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">09:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">10:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">11:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">12:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">13:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">14:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">15:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">16:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>

                <div className="tye">17:00</div>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
                <div className="bespreek"/>
            </div>
        </div>
    )
}