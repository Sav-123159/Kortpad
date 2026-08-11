import React, { useState, useEffect, useRef } from "react";
import PopupAnimation from "./PopupAnimation";

function Booking({ show, onConfirm, onCancel, onClose }) {
    const [campuses, setCampuses] = useState([]);
    const [venues, setVenues] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [selectedVenue, setSelectedVenue] = useState("");
    const [date, setDate] = useState("");
    const [selectedSlots, setSelectedSlots] = useState([]);

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

    //Choose date first, pull d.o.w. out
    const activeDay =
        date !== ""
            ? days[new Date(date).getDay()]
            : "";

    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then((res) => res.json())
            .then((data) => {
                setCampuses(data);

                if (data.length > 0) {
                    setSelectedCampus(data[0].campus_id);
                }
            })
            .catch((error) => console.error(error));
    }, []);

    useEffect(() => {
        if (!selectedCampus) {
            setVenues([]);
            return;
        }

        fetch(`http://127.0.0.1:8000/venue/by-campus/${selectedCampus}`)
            .then((res) => res.json())
            .then((data) => setVenues(data))
            .catch((error) => console.error(error));
    }, [selectedCampus]);

    useEffect(() => {
        setTimetables([
            {
                day_of_week: "MON",
                start_time: "09:00",
                end_time: "11:00"
            },
            {
                day_of_week: "TUE",
                start_time: "14:00",
                end_time: "16:00"
            },
            {
                day_of_week: "WED",
                start_time: "10:00",
                end_time: "12:00"
            },
            {
                day_of_week: "THU",
                start_time: "08:00",
                end_time: "09:00"
            },
            {
                day_of_week: "FRI",
                start_time: "13:00",
                end_time: "15:00"
            }
        ]);
    }, [selectedVenue]);

    const modalRef = useRef(null);

    useEffect(() => {
        const closeModalonClickOut = (e) => {
            if (
                show &&
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                onClose
            ) {
                onClose();
            }
        };

        const closeModalOnEscKeyDown = (e) => {
            if (show && e.code === "Escape" && onClose) {
                onClose();
            }
        };

        document.body.addEventListener("mousedown", closeModalonClickOut);
        document.addEventListener("keydown", closeModalOnEscKeyDown);

        return () => {
            document.body.removeEventListener("mousedown", closeModalonClickOut);
            document.removeEventListener("keydown", closeModalOnEscKeyDown);
        };
    }, [show, onClose]);

    function handleCellClick(day, time, occupied) {
        if (occupied || !activeDay || day !== activeDay) return;

        const slot = `${day}-${time}`;

        // Deselect
        if (selectedSlots.includes(slot)) {
            const index = selectedSlots.indexOf(slot);
            //Prevent middleslot from being deselected
            if (index !== 0 && index !== selectedSlots.length - 1) {
                clearSelection();
            } else {
                setSelectedSlots(selectedSlots.filter((s) => s !== slot));
            }
        }

        // First select
        if (selectedSlots.length === 0) {
            setSelectedSlots([slot]);
            return;
        }

        // Time indexes of the selected slots
        const selectedIndexes = selectedSlots.map((s) =>
            times.indexOf(s.split("-")[1])
        );
        // MON-10:00
        //["MON", "10:00"]
        //[2] = ["10:00"]

        // Time index of the new slot
        const newIndex = times.indexOf(time);

        // Get the lowest and highest indexes of the current selection
        const lowest = Math.min(...selectedIndexes);
        const highest = Math.max(...selectedIndexes);

        // Only select a value 1 higher or lower than set of slots
        if (newIndex === lowest - 1 || newIndex === highest + 1) {
            setSelectedSlots([...selectedSlots, slot]);
        }
    }

    function clearSelection() {
        setSelectedSlots([]);
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (onConfirm) {
            onConfirm({
                campus: selectedCampus,
                venue: selectedVenue,
                date,
                slots: selectedSlots
            });
        }

        if (onClose) {
            onClose();
        }
    }

    function onCancelClicked() {
        if (onClose) onClose();
        if (onCancel) onCancel();
    }

    if (!show) {
        return null;
    }

    return (
        <section className="booking-page">
                <PopupAnimation as="section" className="booking-modal" ref={modalRef}>

                    <form className="booking-sidebar" onSubmit={handleSubmit}>

                        <h3>Maak 'n Bespreking</h3>

                        <label htmlFor="campus">Kampus:</label>
                        <select
                            id="campus"
                            value={selectedCampus}
                            onChange={(e) => setSelectedCampus(e.target.value)}
                        >
                            {campuses.map((campus) => (
                                <option
                                    key={campus.campus_id}
                                    value={campus.campus_id}
                                >
                                    {campus.campus_name}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="venue">Lokaal:</label>
                        <select
                            id="venue"
                            value={selectedVenue}
                            onChange={(e) => setSelectedVenue(e.target.value)}
                        >
                            {venues.map((venue) => (
                                <option
                                    key={venue.venue_id}
                                    value={venue.venue_id}
                                >
                                    {venue.venue_name}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="date">Datum:</label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setSelectedSlots([]);
                            }}
                        />

                        {selectedSlots.length > 0 && (
                            <div className="booking-selection">
                                <strong>Gekose Tye ({activeDay}):</strong>
                                <div className="booking-selection-times">
                                    {selectedSlots
                                        .map((slot) => slot.split("-")[1])
                                        .sort()
                                        .join(", ")}
                                </div>

                                <button
                                    type="button"
                                    className="booking-clear"
                                    onClick={clearSelection}
                                >
                                    Vee keuse skoon
                                </button>
                            </div>
                        )}

                        <div className="booking-actions">
                            <button
                                type="submit"
                                className="booking-confirm"
                                disabled={selectedSlots.length === 0}
                            >
                                Bevestig Bespreking
                            </button>

                            <button
                                type="button"
                                className="booking-cancel"
                                onClick={onCancelClicked}
                            >
                                Kanselleer
                            </button>
                        </div>

                    </form>

                    <section className="booking-grid">

                        <div className="booking-grid-header">
                            <h4>Skedule Rooster</h4>

                            <p>
                                {activeDay
                                    ? `Klik op selle om tye op ${activeDay} te kies.`
                                    : "Kies eers 'n datum om tydgleuwe te aktiveer."}
                            </p>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Tyd</th>

                                    {days.map((day) => (
                                        <th
                                            key={day}
                                            className={
                                                activeDay && day !== activeDay
                                                    ? "disabled-header"
                                                    : ""
                                            }
                                        >
                                            {day}
                                        </th>
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
                                                (timetable) =>
                                                    timetable.day_of_week === day &&
                                                    timetable.start_time <= time &&
                                                    timetable.end_time > time
                                            );

                                            const selected = selectedSlots.includes(slot);

                                            const disabled =
                                                !activeDay || day !== activeDay;

                                            return (
                                                <td
                                                    key={slot}
                                                    className={
                                                        occupied
                                                            ? "occupied"
                                                            : selected
                                                                ? "selected"
                                                                : disabled
                                                                    ? "disabled"
                                                                    : "available"
                                                    }
                                                    onClick={() =>
                                                        handleCellClick(
                                                            day,
                                                            time,
                                                            occupied
                                                        )
                                                    }
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

                    </section>
            </PopupAnimation>
        </section>
    );
}

export default Booking;
