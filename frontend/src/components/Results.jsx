import { useState, useEffect } from "react";

function Results({ selectedTime, selectedCampus, setEndVenue, onLoaded}) {
    const [timetables, setTimetables] = useState([]);
    const [venues, setVenues] = useState([]);
    const [buildings, setBuildings] = useState([]);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/venue/by-campus/${selectedCampus}`)
            .then(res => res.json())
            .then(data => setVenues(data))
            .catch((error) => console.error("Failed to fetch venues:", error));
    }, [selectedCampus]);

    useEffect(() => {
        if (venues.length === 0) {
            setTimetables([]);
            return;
        }

        // Fetch the timetable for every venue in the selected campus
        // Each fetch returns a Promise because the response arrives later
        Promise.all(
            venues.map((venue) =>
                fetch(`http://127.0.0.1:8000/timetable/by-venue/${venue.venue_id}`)
                    .then((res) => res.json())
            )
        )
            // Each venue returns an array of timetables
            // flat() combines all those arrays into one array
            .then((data) => setTimetables(data.flat()))
            .catch((error) => console.error("Failed to fetch timetables:", error));
    }, [venues]);

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

    const targetTime = (selectedTime != null) ? selectedTime : currentTime;

    const occupiedVenueIds = timetables
        .filter(timetable =>
                timetable.day_of_week === currentDay &&
                timetable.start_time <= targetTime &&
                timetable.end_time > targetTime
        )
        .map((timetable) => timetable.venue_id);


    const availableVenues = venues.filter(
        venue => !occupiedVenueIds.includes(venue.venue_id)
    );

    const handleClick = (venue) => { setEndVenue(venue.venue_id); }

    onLoaded?.();

    return (
        <section className="Results">
            {availableVenues.map((venue) => {

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
                    </div>
                );
            })}
        </section>
    );
}
export default Results;
