import "../css/Admin.css";
import React, { useState, useEffect } from "react";

export default function AdminRoosters() {
    const [campuses, setCampuses] = useState([]);
    const [venues, setVenues] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [selectedVenue, setSelectedVenue] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("Semester1");
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [deselectedSlots, setDeselectedSlots] = useState([]);
    const [slotModules, setSlotModules] = useState({});

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",];

    const semesters = [
        { id: "Semester1", start: "-01-01", end: "-06-01" },
        { id: "Semester2", start: "-07-01", end: "-12-01" },
    ];

    //Hard Code for now
    const modules = [
        { code: "COS110", name: "Programming 1" },
        { code: "COS122", name: "Imperative Programming" },
        { code: "WTW114", name: "Calculus" },
        { code: "INF154", name: "Informatika" }
    ];

    const year = new Date().getFullYear();

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
            .then((data) => setTimetables(data.map(normalizeTimetableEntry)))
            .catch((error) => console.error(error));
    }, [selectedVenue]);


    //18:00:00 > 18:00
    //Slice seconds
    function normalizeTimetableEntry(entry) {
        return {
            ...entry,
            start_time: entry.start_time?.slice(0, 5),
            end_time: entry.end_time?.slice(0, 5),
        };
    }

    function semesterTimeTables(timeTables) {
        filter
    }

    //----------------------- TABLE CELL LOGIC -----------------------
    const clearSelection = () => {
        setSelectedSlots([]);
        setSlotModules({});
        setDeselectedSlots([]);
    };

    function handleCellClick(day, time, occupied) {
        const slot = `${day}-${time}`;

        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter((s) => s !== slot));
            //Removes associated module
            setSlotModules((prev) => {
                const updated = { ...prev };
                delete updated[slot];
                return updated;
            });
            return;
        }

        if (occupied) {
            const entryId = occupied.timetable_id;
            const isDeselected = deselectedSlots.includes(entryId);


            if (!isDeselected) {
                setDeselectedSlots([...deselectedSlots, entryId]);
            } else {
                setSelectedSlots([...selectedSlots, slot]);
            }
            return;
        }

        setSelectedSlots([...selectedSlots, slot]);
    }

    const handleModuleChange = (slot, moduleCode) => {
        setSlotModules((prev) => ({
            ...prev, [slot]: moduleCode,
        }));
    };

    // Sort slots by day order and time order
    const sortedSelectedSlots = [...selectedSlots].sort((a, b) => {
        const [dayA, timeA] = a.split("-");
        const [dayB, timeB] = b.split("-");
        const dayDiff = days.indexOf(dayA) - days.indexOf(dayB);
        if (dayDiff !== 0) return dayDiff; //Not on the same day, don't need to compare hours
        return times.indexOf(timeA) - times.indexOf(timeB); //They are on the same day, compare hours
    });

    //----------------------- GROUPING LOGIC -----------------------
    const getGroupedEntries = () => {
        if (selectedSlots.length === 0) return [];

        //Groups of consecutive time slots with the same module code
        const groups = [];

        //Use sorted list of slots
        sortedSelectedSlots.forEach((slot) => {
            const [day, time] = slot.split("-");
            const timeIndex = times.indexOf(time);
            const moduleCode = slotModules[slot] || "";

            // Calculate end time (time index + 1)
            const nextTime =
                times[timeIndex + 1] || `${parseInt(time.split(":")[0], 10) + 1}:00`;
            //Fallback for last time slot (16:00), need to compute a end-time (17:00)


            const lastGroup = groups[groups.length - 1];

            // Merge if contiguous on same day AND matching non-empty module code
            if (
                lastGroup &&                                //not empty (-1)
                lastGroup.day === day &&                    //is the next consecutive slot on the same day as the previous group
                lastGroup.moduleCode === moduleCode &&      //is the next consecutive slot in the same module as the previous group
                moduleCode !== "" &&                        //is the module code empty (can't group)
                lastGroup.endIndex === timeIndex            //is the next index of the last group the same as the current time index
            ) {
                lastGroup.endTime = nextTime;
                lastGroup.endIndex = timeIndex + 1;
                lastGroup.slots.push(slot); //Add to end of array in the slots object
            } else {
                groups.push({
                    day,
                    startTime: time,
                    endTime: nextTime,
                    startIndex: timeIndex,
                    endIndex: timeIndex + 1,
                    moduleCode,
                    slots: [slot],  //single array
                });
            }
        });

        return groups;
    };

    const chosenSemester = semesters.find((s) => s.id === selectedSemester);

    //----------------------- SUBMIT HANDLER -----------------------
    async function handleSubmit(e) {
        e.preventDefault();

        const entries = selectedSlots.map((slot) => {
            const [day, time] = slot.split("-");
            const timeIndex = times.indexOf(time);
            const nextTime =
                times[timeIndex + 1] || `${parseInt(time.split(":")[0], 10) + 1}:00`;

            return {
                //"15" -> 15
                //base 10, prevents base 8 or 16 reading in older javascript engines
                venue_id: parseInt(selectedVenue, 10),
                semester_start: `${year}${chosenSemester.start}`,
                semester_end: `${year}${chosenSemester.end}`,
                day_of_week: day,
                start_time: `${time}`,
                end_time: `${nextTime}`,
                module_code: slotModules[slot] || "",
            };
        });

        try {
            await Promise.all(
                entries.map(async (entry) => {
                    const response = await fetch("http://127.0.0.1:8000/timetable", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(entry),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || "Failed to create entry");
                    }

                    return response.json();
                })
            );

            await Promise.all(
                deselectedSlots.map(async (timetableId) => {
                    const response = await fetch(`http://127.0.0.1:8000/timetable/${timetableId}`, {
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || "Failed to delete entry");
                    }
                })
            );



            alert("Rooster suksesvol opgedateer!");

            const timetableResponse = await fetch(
                `http://127.0.0.1:8000/timetable/by-venue/${selectedVenue}`
            );
            const data = await timetableResponse.json();
            setTimetables(data.map(normalizeTimetableEntry));

            clearSelection();
        } catch (error) {
            console.error("Failed to submit timetable:", error);
            alert("Kon nie rooster opdateer nie. Probeer weer.");
        }



        clearSelection();
    };

    const groupedEntries = getGroupedEntries();

    const SemesterStart = `${year}${chosenSemester.start}`;
    const SemesterEnd = `${year}${chosenSemester.end}`;
    const filteredTimetables = timetables.filter(
        (t) =>
            t.semester_start === SemesterStart &&
            t.semester_end === SemesterEnd
    );

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
                                        const occupied = filteredTimetables.find(
                                            (t) =>
                                                t.day_of_week === day &&
                                                t.start_time <= time &&
                                                t.end_time > time
                                        );
                                        const selected = selectedSlots.includes(slot);
                                        const deselected = occupied && deselectedSlots.includes(occupied.timetable_id)

                                        let Class = "available";
                                        let Text = "Beskikbaar";

                                        if (selected) {
                                            Class = "selected";
                                            Text = "Gekies";
                                        } else if (occupied) {
                                            if (deselected) {
                                                Class = "available";
                                                Text = "Beskikbaar";
                                            } else {
                                                Class = "occupied";
                                                Text = "Beset";
                                            }
                                        }

                                        return (
                                            <td
                                                key={slot}
                                                className={Class}
                                                onClick={() => handleCellClick(day, time, occupied)}
                                            >
                                                {Text}
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
                                {sortedSelectedSlots.map((slot) => {
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

                        {groupedEntries.length > 0 && (
                            <div>
                                <h4>Opsomming:</h4>
                                {groupedEntries.map((group, idx) => (
                                    <div key={idx} className="chosen-display">
                                        <strong>{group.day}</strong>: {group.startTime} - {group.endTime} [{" "}
                                        {group.moduleCode || "Geen module"} ]
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="sidePanelButtons">
                        <button
                            onClick={handleSubmit}
                            disabled={selectedSlots.length === 0 && deselectedSlots.length === 0}
                            className="confirm-Timetable"
                        >
                            Bevestig
                        </button>
                        <button
                            onClick={clearSelection}
                            disabled={selectedSlots.length === 0 && deselectedSlots.length === 0}
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
