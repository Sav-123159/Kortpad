import { useState, useEffect } from "react";

function Resultate({ getTime, time, campus}) {
    const [timetables, setTimetables] = useState([]);
    const [venues, setVenues] = useState([]);
    const [buildings, setBuildings] = useState([]);

    useEffect(() => {

        fetch(`http://127.0.0.1:8000/venue/by-campus/${campus}`)
            .then(res => res.json())
            .then(data => setVenues(data))
            .catch((error) => console.error("Failed to fetch venues:", error));

        venues.map((venue) =>
            (fetch(`http://127.0.0.1:8000/timetable/by-venue/${venue.venue_id}`)
                .then(res => res.json())
                .then(data => setTimetables(data))
                .catch((error) => console.error("Failed to fetch timetables:", error)))
            );

        fetch("http://127.0.0.1:8000/buildings")
            .then(res => res.json())
            .then(data => setBuildings(data))
            .catch((error) => console.error("Failed to fetch buildings:", error));

    }, [campus]);

    const now = new Date();

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 8);

    const targetTime = (getTime && time) ? time : currentTime;

    const occupiedVenueIds = timetables
        .filter(timetable =>
            timetable.day_of_week === currentDay &&
            timetable.start_time <= targetTime &&
            timetable.end_time > targetTime
        )
        .map(timetable => timetable.venue_id);


    const availableVenues = venues.filter(
        venue => !occupiedVenueIds.includes(venue.venue_id)
    );

    return (
        <section className="Resultate">
            {availableVenues.map((venue) => {

                const building = buildings.find(
                    building => building.building_id === venue.building_id
                );

                return (
                    <div className="res-houer" key={venue.venue_id}>
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

                        <div className="afstand">
                            <b>Afstand:</b>
                            <br />
                            Onbekend
                        </div>

                        <div className="kapasiteit">
                            <b>Kapasiteit:</b>
                            <br />
                            {venue.capacity}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
export default Resultate;