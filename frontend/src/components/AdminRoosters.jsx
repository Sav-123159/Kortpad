import "../css/Admin.css";
import { useState, useEffect } from "react";

export default function AdminRoosters() {
    const [campuses, setCampuses] = useState([]);
    const [venues, setVenues] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [selectedVenue, setSelectedVenue] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("Semester1");
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [slotModules, setSlotModules] = useState({});

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const times = [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    const semesters = [
        { id: "Semester1", start: "01-01", end: "06-01" },
        { id: "Semester2", start: "07-01", end: "12-01" },
    ];

    const modules = [
        { code: "COS110", name: "Programming 1" },
        { code: "COS122", name: "Imperative Programming" },
        { code: "WTW114", name: "Calculus" },
        { code: "INF154", name: "Informatika" }
    ];

    //----------------------- API FETCHES -----------------------
    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then((res) => res.json())
            .then((data) => {
                setCampuses(data);
                if (data.length > 0) setSelectedCampus(data[0].campus_id);
            })
            .catch((error) => console.error(error));
    }, []);

    useEffect(() => {
        if (!selectedCampus) {
            setVenues([]);
            return;
        }
        setSelectedVenue("");
        setTimetables([]);

        fetch(`http://127.0.0.1:8000/venue/by-campus/${selectedCampus}`)
            .then((res) => res.json())
            .then((data) => {
                setVenues(data);
                if (data.length > 0) setSelectedVenue(data[0].venue_id);
            })
            .catch((error) => console.error(error));
    }, [selectedCampus]);

    useEffect(() => {
        if (!selectedVenue) {
            setTimetables([]);
            return;
        }

        fetch(`http://127.0.0.1:8000/timetable/by-venue/${selectedVenue}`)
            .then((res) => res.json())
            .then((data) => setTimetables(data))
            .catch((error) => console.error(error));
    }, [selectedVenue]);

    //----------------------- TABLE CELL LOGIC -----------------------
    const clearSelection = () => {
        setSelectedSlots([]);
        setSlotModules({});
    };

    function handleCellClick(day, time, occupied) {
        if (occupied) return;

        const slot = `${day}-${time}`;

        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter((s) => s !== slot));
            setSlotModules((prev) => {
                const updated = { ...prev };
                delete updated[slot];
                return updated;
            });
            return;
        }

        setSelectedSlots([...selectedSlots, slot]);
    }

    const handleModuleChange = (slot, moduleCode) => {
        setSlotModules((prev) => ({
            ...prev, [slot]: moduleCode,
        }));
    };

    //----------------------- SUBMIT HANDLER -----------------------
    const handleSubmit = () => {
        const entries = selectedSlots.map((slot) => {
            const [day, time] = slot.split("-");
            const timeIdx = times.indexOf(time);
            const nextTime =
                times[timeIdx + 1] || `${parseInt(time.split(":")[0], 10) + 1}:00`;

            return {
                venue_id: selectedVenue,
                semester_id: selectedSemester,
                day_of_week: day,
                start_time: time,
                end_time: nextTime,
                module_code: slotModules[slot] || "",
            };
        });

        clearSelection();
    };

    return (
        <div className="Roosters__Inligting" data-for-tab="Roosters">
            <h2>Roosters</h2>
            &ensp;Semester roosters vir Lokale
            <div className="Lokale__kampus">
                <label htmlFor="campus">Kampus:</label>
                <select
                    id="campus"
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                >
                    {campuses.map((campus) => (
                        <option key={campus.campus_id} value={campus.campus_id}>
                            {campus.campus_name}
                        </option>
                    ))}
                </select>
                &ensp;&ensp;
                <label htmlFor="venue">Lokaal:</label>
                <select
                    id="venue"
                    value={selectedVenue}
                    onChange={(e) => setSelectedVenue(e.target.value)}
                >
                    {venues.map((venue) => (
                        <option key={venue.venue_id} value={venue.venue_id}>
                            {venue.venue_name}
                        </option>
                    ))}
                </select>
                &ensp;&ensp;
                <label htmlFor="semester">Semester:</label>
                <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                >
                    {semesters.map((sem) => (
                        <option key={sem.id} value={sem.id}>
                            {sem.id}
                        </option>
                    ))}
                </select>
            </div>

            <div className="timetable-grid">
                <div className="rooster" style={{ flex: "1" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Tyd</th>
                                {days.map((day) => (
                                    <th key={day}>{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {times.map((time) => (
                                <tr key={time}>
                                    <td className="time-label">{time}</td>
                                    {days.map((day) => {
                                        const slot = `${day}-${time}`;
                                        const occupied = timetables.some(
                                            (t) =>
                                                t.day_of_week === day &&
                                                t.start_time <= time &&
                                                t.end_time > time
                                        );
                                        const selected = selectedSlots.includes(slot);

                                        return (
                                            <td
                                                key={slot}
                                                className={
                                                    occupied
                                                        ? "occupied"
                                                        : selected
                                                            ? "selected"
                                                            : "available"
                                                }
                                                onClick={() => handleCellClick(day, time, occupied)}
                                            >
                                                {occupied
                                                    ? "Beset"
                                                    : selected
                                                        ? "Gekies"
                                                        : "Beskikbaar"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="side-panel">
                    <div>
                        <h3>Gekose Slots</h3>
                        {selectedSlots.length === 0 ? (
                            <p>Geen slots gekies nie.</p>
                        ) : (
                            <div>
                                {selectedSlots.map((slot) => {
                                    const [day, time] = slot.split("-");
                                    return (
                                        <div
                                            key={slot}
                                            className="module-selection"
                                        >

                                            <form>
                                                <label htmlFor={`module-${slot}`}><strong>{day}</strong> ({time}):</label>
                                                <select
                                                    value={slotModules[slot] || ""}
                                                    onChange={(e) => handleModuleChange(slot, e.target.value)}
                                                    className="select-Module"
                                                    id={`module-${slot}`}
                                                >
                                                    <option value="">Kies Module</option>
                                                    {modules.map((module) => (
                                                        <option key={module.code} value={module.code}>
                                                            {module.code} - {module.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </form>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {selectedSlots.length > 0 && (
                            <div>
                                <h4>Opsomming:</h4>
                                {selectedSlots.map((slot) => {
                                    const [day, time] = slot.split("-");
                                    return (
                                        <div key={slot} className="chosen-display">
                                            <strong>{day}</strong>: {time} [{" "}
                                            {slotModules[slot] || "Geen module"} ]
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="sidePanelButtons">
                        <button
                            onClick={handleSubmit}
                            disabled={selectedSlots.length === 0}
                            className="confirm-Timetable"
                        >
                            Bevestig
                        </button>
                        <button
                            onClick={clearSelection}
                            disabled={selectedSlots.length === 0}
                            className="cancel-timetable"
                        >
                            Kanselleer
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
