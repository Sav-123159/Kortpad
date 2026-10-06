// Invoere
import "../css/Admin.css";
import React, { useState, useEffect } from "react";
import GeneralPopupModal from "./GeneralPopupModal";

export default function AdminRoosters({setMobieleLPaneel}) {
    const [campuses, setCampuses] = useState([]);
    const [venues, setVenues] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [selectedVenue, setSelectedVenue] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("Semester1");
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [deselectedSlots, setDeselectedSlots] = useState([]);
    const [slotModules, setSlotModules] = useState({});
    const [popupPrompt, setPopupPrompt] = useState();
    const [show, setShow] = useState(false);
    const [modules, setModules] = useState([]);

    const [pendingEntryId, setPendingEntryId] = useState(null); // besete gleuf wag vir bevestiging

    // Wys die bevestigings modal
    const showModal = () => {
        setShow(true);
    };

    // Bevestig verwydering van 'n besette gleuf -> voeg by deselectedSlots 
    const confirmDeselect = () => {
        if (pendingEntryId !== null) {
            setDeselectedSlots([...deselectedSlots, pendingEntryId]);
        }
        setShow(false);
        setPendingEntryId(null);
    };

    // Maak prompt toe sonder om die gleuf te verwyder
    const cancelDeselect = () => {
        setShow(false);
        setPendingEntryId(null);
    };

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",];

    const semesters = [
        { id: "Semester1", start: "-01-01", end: "-06-30" },
        { id: "Semester2", start: "-07-01", end: "-12-30" },
    ];

    const year = new Date().getFullYear();

    //----------------------- API FETCHES -----------------------
    
    // Haal kampusse deur API, stel eerste kampus as die verstek waarde
    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then((res) => res.json())
            .then((data) => {
                setCampuses(data);
                if (data.length > 0) setSelectedCampus(data[0].campus_id);
            })
            .catch((error) => console.error(error));
    }, []);

    // Haal lokale wat aan die geselekteerde kampus behoort, en stel die eerste een as die verstek waarde
    useEffect(() => {
        if (!selectedCampus) {
            setVenues([]);
            return;
        }
        setSelectedVenue("");
        setTimetables([]);
        clearSelection();

        fetch(`http://127.0.0.1:8000/venue/by-campus/${selectedCampus}`)
            .then((res) => res.json())
            .then((data) => {
                setVenues(data);
                if (data.length > 0) setSelectedVenue(data[0].venue_id);
            })
            .catch((error) => console.error(error));
    }, [selectedCampus]);

    // Haal die rooster vir die geselekteerde lokaal
    useEffect(() => {
        if (!selectedVenue) {
            setTimetables([]);
            return;
        }
        clearSelection();
        fetch(`http://127.0.0.1:8000/timetable/by-venue/${selectedVenue}`)
            .then((res) => res.json())
            .then((data) => setTimetables(data.map(normalizeTimetableEntry)))
            .catch((error) => console.error(error));
    }, [selectedVenue]);

    // Haal die modules, wat gebruik word in die opstelling van 'n klas
    useEffect(() => {
        fetch("http://127.0.0.1:8000/modules")
            .then((res) => res.json())
            .then((data) => setModules(data))
            .catch((error) => console.error("Failed to fetch modules:", error));
    }, []);

    //18:00:00 > 18:00
    //Slice seconds
    // API gee HH:MM:SS terug, maar ons werk net met HH:MM
    function normalizeTimetableEntry(entry) {
        return {
            ...entry,
            start_time: entry.start_time?.slice(0, 5),
            end_time: entry.end_time?.slice(0, 5),
        };
    }

    //----------------------- TABLE CELL LOGIC -----------------------

    // Maak alle keuses skoon
    const clearSelection = () => {
        setSelectedSlots([]);
        setSlotModules({});
        setDeselectedSlots([]);
    };

    /*
        Hanteer klik op 'n rooster sel:
        Alklaar gekies: Deselekteer
        Beset (nog nie gemerk vir verwydering): wys bevestigning om die klas te verwyder
        Beset (gemerk vir verwydering): Selekteer as nuwe gleuf
        Oop: Kies as nuwe gleuf
    */
    function handleCellClick(day, time, occupied) {
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

        if (occupied) {
            const entryId = occupied.timetable_id;
            const isDeselected = deselectedSlots.includes(entryId);

            if (!isDeselected) {
                setPendingEntryId(entryId);

                const startTime = occupied.start_time;
                const endTime = occupied.end_time;

                setPopupPrompt(`Is jy seker jy wil die ${day} (${startTime} - ${endTime}) klas verwyder?`);
                showModal();
            } else {
                setSelectedSlots([...selectedSlots, slot]);
            }
            return;
        }

        setSelectedSlots([...selectedSlots, slot]);
    }

    // Stel die geselekteerde module vir 'n spesifieke gleuf
    const handleModuleChange = (slot, moduleCode) => {
        setSlotModules((prev) => ({
            ...prev, [slot]: moduleCode,
        }));
    };

    // Sorteer gleuwe volgens dag en tyd
    const sortedSelectedSlots = [...selectedSlots].sort((a, b) => {
        const [dayA, timeA] = a.split("-");
        const [dayB, timeB] = b.split("-");
        const dayDiff = days.indexOf(dayA) - days.indexOf(dayB);
        if (dayDiff !== 0) return dayDiff; // nie op dieselfde dag nie, hoef nie ure te vergelyk nie
        return times.indexOf(timeA) - times.indexOf(timeB); // Hulle is op dieselfde dag, vergelyk die ure
    });

    //----------------------- GROUPING LOGIC -----------------------
    
    /*
        Groepeer opeenvolgende tydgleuwe met dieselfde module in een blok, sodat die 
        submit dit as een klas stuur inplaas van aparte een uur gleuwe
    */
    const getGroupedEntries = () => {
        if (selectedSlots.length === 0) return [];

        //Groepe opeenvolgende tydgleuwe met dieselfde modulekode
        const groups = [];

        //Gebruik gesorteerde lys van geselekteerde gleuwe
        sortedSelectedSlots.forEach((slot) => {
            const [day, time] = slot.split("-");
            const timeIndex = times.indexOf(time);
            const moduleCode = slotModules[slot] || "";

            // Bereken eindtyd (tydindeks + 1)
            const nextTime =
                times[timeIndex + 1] || `${parseInt(time.split(":")[0], 10) + 1}:00`;
            // Terugval vir laaste tydgleuf (16:00), moet 'n eindtyd bereken (17:00)


            const lastGroup = groups[groups.length - 1];

            // Voeg saam indien aangrensend op dieselfde dag EN ooreenstemmende nie-leë modulekode
            if (
                lastGroup &&                                //nie leeg (-1)
                lastGroup.day === day &&                    //is die volgende opeenvolgende gleuf op dieselfde dag as die vorige groep
                lastGroup.moduleCode === moduleCode &&      //is die volgende opeenvolgende gleuf in dieselfde module as die vorige groep
                moduleCode !== "" &&                        //is die modulekode leeg (kan nie groepeer nie)
                lastGroup.endIndex === timeIndex            //is die volgende indeks van die laaste groep dieselfde as die huidige tydindeks
            ) {
                lastGroup.endTime = nextTime;
                lastGroup.endIndex = timeIndex + 1;
                lastGroup.slots.push(slot); //Voeg by die einde van die skikking in die gleuwe-objek
            } else {
                groups.push({
                    day,
                    startTime: time,
                    endTime: nextTime,
                    startIndex: timeIndex,
                    endIndex: timeIndex + 1,
                    moduleCode,
                    slots: [slot],  //enkele skikking
                });
            }
        });

        return groups;
    };

    const chosenSemester = semesters.find((s) => s.id === selectedSemester);

    //----------------------- SUBMIT HANDLER -----------------------
    
    /*
        Stuur al die gegroepeerde inskrywings (POST) en al die gemerkte verwyderings (DELETE)
        gelyktydig na die API, en herlaai die rooster vir die geselekteerde lokaal en vee keuses uit
    */
    async function handleSubmit(e) {
        e.preventDefault();

        const entries = groupedEntries.map((group) => ({
            venue_id: parseInt(selectedVenue, 10),
            semester_start: `${year}${chosenSemester.start}`,
            semester_end: `${year}${chosenSemester.end}`,
            day_of_week: group.day,
            start_time: group.startTime,
            end_time: group.endTime,
            module_code: group.moduleCode,
        }));

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
    };

    const groupedEntries = getGroupedEntries();

    const SemesterStart = `${year}${chosenSemester.start}`;
    const SemesterEnd = `${year}${chosenSemester.end}`;
    // Wys net inskrywings vir die geselekteerde semester
    const filteredTimetables = timetables.filter(
        (t) =>
            t.semester_start === SemesterStart &&
            t.semester_end === SemesterEnd
    );

    return (
        <div className="Roosters__Inligting" data-for-tab="Roosters">
            <div className="MobileHeader">
                <button className="Hamburger" onClick={() => setMobieleLPaneel(true)}>
                    ☰
                </button>

                <h3>Roosters</h3>
            </div>

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
                    onChange={(e) => { setSelectedSemester(e.target.value); clearSelection() }}
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
                                        // Beset gleuf wat gemerk is vir verwydering -> Wys as beskikbaar
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
                                                        <option key={module.module_id} value={module.module_name}>
                                                            {module.module_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </form>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {(groupedEntries.length > 0 || deselectedSlots.length > 0) && (
                            <div>
                                <h4>Opsomming:</h4>

                                {groupedEntries.length > 0 && (
                                    <>
                                        <h5>Bygevoeg:</h5>
                                        {groupedEntries.map((group, idx) => (
                                            <div key={idx} className="chosen-display">
                                                <strong>{group.day}</strong>: {group.startTime} - {group.endTime} [{" "}
                                                {group.moduleCode || "Geen module"} ]
                                            </div>
                                        ))}
                                    </>
                                )}

                                {deselectedSlots.length > 0 && (
                                    <>
                                        <h5>Verwyder:</h5>
                                        {deselectedSlots.map((timetableId) => {
                                            const entry = timetables.find(
                                                (t) => t.timetable_id === timetableId
                                            );
                                            return (
                                                <div key={timetableId} className="chosen-display">
                                                    <strong>{entry?.day_of_week}</strong>: {entry?.start_time} - {entry?.end_time} [{" "}
                                                    {entry?.module_code || "Geen module"} ]
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
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
            <GeneralPopupModal
                show={show}
                onConfirm={confirmDeselect}
                onCancel={cancelDeselect}
                prompt={popupPrompt}
            />
        </div>
    );
}
