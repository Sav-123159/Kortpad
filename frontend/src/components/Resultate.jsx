// Vertoon 'n lys van beskikbare lokale wat van die soek-funksie gekry word

// Resultate-komponent vat 'n prop lokale wat 'n lys van beskikbare lokale bevat, en vertoon dit in 'n lys van resultate
function Resultate({ lokale }) {
    return (
        <section className="Resultate">
            {lokale.map((lokaal) => (
                <div className="res-houer" key={lokaal.id}>
                    <div className="lokaal">
                        <b>Lokaal Naam: </b>
                        <br />
                        {lokaal.naam}
                    </div>
                    <div className="gebou">
                        <b>Gebou Naam: </b>
                        <br />
                        {lokaal.gebou}
                    </div>
                    <div className="afstand">
                        <b>Afstand: </b>
                        <br />
                        {lokaal.afstand}m
                    </div>
                    <div className="kapasiteit">
                        <b>Kapasiteit: </b>
                        <br />
                        {lokaal.kapasiteit}
                    </div>
                </div>
            ))}
        </section>
    );
}

// Stuur die Resultate-komponent na die App-komponent
export default Resultate;