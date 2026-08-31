// Invoere
import { useState, useEffect } from "react";
import GeneralPopupModal from "./GeneralPopupModal";

/*
    Hou tred van watter lokaal laas gekies is buite die Results komponent se toestand
    Sodat dit beskikbaar is in confirmResult() sonder om dit as 'n prop deur te gee
*/
let selectedVenue;

/*
    Wys 'n lys van die beskikbare lokale wat op die oomblik oop is vir die kampus wat gekies is.
    Haal die lokale, hulle verwante rossters en gebou van die API
    Bevestig die gekose lokaal deur 'n popup
*/
function Results({ selectedTime, selectedCampus, setEndVenue, onLoaded, setCollapsed }) {
    const [timetables, setTimetables] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [venues, setVenues] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [popupPrompt, setPopupPrompt] = useState();
    const [show, setShow] = useState(false);

    /*
        Bevestig die gekose lokaal as die eind punt van die roete, en vou die linker paneel  in
    */
    const confirmResult = () => {
        setEndVenue(selectedVenue);
        setShow(false);
        setCollapsed(true);
    };

    //Maak popup toe sonder om te bevestig
    const cancelResult = () => {
        setShow(false);
    };

    //Haal lokale van die gekose kampus
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/venue/by-campus/${selectedCampus}`)
            .then(res => res.json())
            .then(data => setVenues(data))
            .catch((error) => console.error("Failed to fetch venues:", error));
    }, [selectedCampus]);

    //Haal die roosters vir die lokale wat deur die kampus besit word
    useEffect(() => {
        //As daar nie 'n lokaal gekies is nie, sal geen roosters laai nie
        if (venues.length === 0) {
            setTimetables([]);
            setBookings([]);
            return;
        }

        //Haal die roosters vir elke lokaal in die geselekteerde kampus
        //Elke haal gee 'n belofte terug omdat die antwoord eers later deur kom
        Promise.all(
            venues.map((venue) =>
                fetch(`http://127.0.0.1:8000/timetable/by-venue/${venue.venue_id}`)
                    .then((res) => res.json())
            )
        )
            //Elke lokaal gee 'n skikking van roosters terug
            // flat() kombineer al die skikkings in een in
            .then((data) => setTimetables(data.flat()))
            .catch((error) => console.error("Failed to fetch timetables:", error));

        //  Haal die besprekings vir elke lokaal in die geselekteerde kampus, in dieselfde patroon
        Promise.all(
            venues.map((venue) =>
                fetch(`http://127.0.0.1:8000/booking/by-venue/${venue.venue_id}`)
                    .then((res) => res.json())
            )
        )
            .then((data) => setBookings(data.flat()))
            .catch((error) => console.error("Failed to fetch bookings:", error));
    }, [venues]);

    //Haal die lys geboue vir die gekose kampus, vir die uitvoer van die lokale
    useEffect(() => {
        fetch("http://127.0.0.1:8000/buildings")
            .then((res) => res.json())
            .then((data) => setBuildings(data))
            .catch((error) => console.error("Failed to fetch buildings:", error));
    }, [selectedCampus]);

    const now = new Date();

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDay = days[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:00`;
    const currentDate = now.toISOString().split("T")[0];

    //Gebruik die gekose tyd indien een gegee was, anders gebruik die huidige uur van die soektog
    const targetTime = (selectedTime != null) ? selectedTime : currentTime;

    //Soek die lokale wat vir die huidige dag en tyd beset is
    const occupiedByTimetable = timetables
        .filter(timetable =>
            timetable.day_of_week === currentDay &&
            timetable.start_time <= targetTime &&
            timetable.end_time > targetTime
        )
        .map((timetable) => timetable.venue_id);

    const occupiedByBooking = bookings
        .filter(booking =>
            booking.booking_date === currentDate &&
            booking.start_time <= targetTime &&
            booking.end_time > targetTime
        )
        .map((booking) => booking.venue_id);

    const occupiedVenueIds = [...occupiedByTimetable, ...occupiedByBooking];
    //Filtreer die lokale deur die wat beset is, om die beskikbare lokale te vertoon
    const availableVenues = venues.filter(
        venue => !occupiedVenueIds.includes(venue.venue_id)
    );

    /*
        Stel die gekose lokaal 
        Stel die prompt vir die bevestigings popup
    */
    const handleClick = (venue) => {
        selectedVenue = venue.venue_id;
        setPopupPrompt(`Is jy seker jy wil ${venue.venue_name} kies?`);
        setShow(true);
    }

    //Laat die ouer komponent weet as die resultate klaar gelaai is, sodat die blaai animasie
    onLoaded?.();

    return (
        <section className="Results">
            {availableVenues.map((venue) => {

                //Vind die ooreenstemmende gebou vir die lokaal
                const building = buildings.find(
                    building => building.building_id === venue.building_id
                );

                return (
                    <div
                        className="res-houer"
                        key={venue.venue_id}
                        onClick={() => handleClick(venue)}
                    >
                        <div className="lokaal">
                            <b>Lokaal Naam:</b>
                            <br />
                            {venue.venue_name}
                        </div>

                        <div className="gebou">
                            <b>Gebou Naam:</b>
                            <br />
                            {building ? building.building_name : "Onbekend"}
                        </div>

                        <div className="kapasiteit">
                            <b>Kapasiteit:</b>
                            <br />
                            {venue.capacity}
                        </div>
                        <div className="vloer">
                            <b>Vloer:</b>
                            <br />
                            {venue.floor == 0 ? 'G' : venue.floor}
                        </div>
                    </div>
                );
            })}
            <GeneralPopupModal
                show={show}
                onConfirm={confirmResult}
                onCancel={cancelResult}
                prompt={popupPrompt}
            />
        </section>
    );
}

//Uitvoer van die Results funksie
export default Results;
