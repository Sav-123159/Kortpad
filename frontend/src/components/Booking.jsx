import React, { useState, useEffect, useRef } from "react";
import PopupAnimation from "./PopupAnimation";

function Booking({ show, onConfirm, onCancel, onClose }) {

    //----------------------- CONTSTANTS -----------------------

    const [campuses, setCampuses] = useState([]);
    const [venues, setVenues] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [selectedVenue, setSelectedVenue] = useState("");
    const [date, setDate] = useState("");
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [defaultValues, setDefaultValues] = useState({
        campus: "",
        venue: "",
        date: "",
        slots: []
    });

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

    //Choose date first, pull d.o.w. out
    const activeDay =
        date !== ""
            ? days[new Date(date).getDay()]
            : "";


    //----------------------- API FETCHES -----------------------

    useEffect(() => {
        fetch("http://127.0.0.1:8000/campuses")
            .then((res) => res.json())
            .then((data) => {
                setCampuses(data);

                if (data.length > 0) {
                    setSelectedCampus(data[0].campus_id);
                    // Hou vorige waardes van defaultValues en oorskryf net die campus
                    setDefaultValues((prev) => ({ ...prev, campus: data[0].campus_id }));
                }
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

                if (data.length > 0) {
                    setSelectedVenue(data[0].venue_id);
                    // Hou vorige waardes van defaultValues en oorskryf net die venue
                    setDefaultValues((prev) => ({ ...prev, venue: data[0].venue_id }));
                }

            })
            .catch((error) => console.error(error));
    }, [selectedCampus]);

    useEffect(() => {
        if (!selectedVenue) {
            setTimetables([]);
            setBookings([]);
            return;
        }

        fetch(`http://127.0.0.1:8000/timetable/by-venue/${selectedVenue}`)
            .then((res) => res.json())
            .then((data) => setTimetables(data))
            .catch((error) => console.error(error));

        loadBookings(selectedVenue);

    }, [selectedVenue]);

    // Load bookings for the selected venue
    async function loadBookings(venueId) {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/booking/by-venue/${venueId}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Booking failed");
            }

            const data = await response.json();
            setBookings(data);

        } catch (error) {
            console.error("Failed to load bookings:", error);
        }
    }

    //----------------------- OPEN, CLOSE AND RESET MODAL -----------------------

    const modalRef = useRef(null);

    function resetForm() {
        setSelectedCampus(defaultValues.campus);
        setSelectedVenue(defaultValues.venue);
        setDate(defaultValues.date);
        setSelectedSlots(defaultValues.slots);
    }

    useEffect(() => {
        const closeModalonClickOut = (e) => {
            if (
                show &&
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                onClose
            ) {
                resetForm();
                onClose();
            }
        };

        const closeModalOnEscKeyDown = (e) => {
            if (show && e.code === "Escape" && onClose) {
                resetForm();
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

    function clearSelection() {
        setSelectedSlots([]);
    }

    function onCancelClicked() {
        resetForm();
        if (onClose) onClose();
        if (onCancel) onCancel();
    }

    //----------------------- TABLE CELL LOGIC -----------------------

    function handleCellClick(day, time, occupied) {
        if (occupied || !activeDay || day !== activeDay) return;

        const slot = `${day}-${time}`;

        // Deselect
        if (selectedSlots.includes(slot)) {
            // Time index of the slot being removed
            const timeIndex = times.indexOf(time);

            // Time indexes of all currently selected slots
            const selectedTimeIndexes = selectedSlots.map((s) =>
                times.indexOf(s.split("-")[1])
            );

            // Earliest and latest time in the current selection
            const lowest = Math.min(...selectedTimeIndexes);
            const highest = Math.max(...selectedTimeIndexes);

            // Only allow removing a boundary slot (earliest or latest time)
            // Removing a slot in the middle breaks the row, clear everything
            if (timeIndex !== lowest && timeIndex !== highest) {
                clearSelection();
            } else {
                setSelectedSlots(selectedSlots.filter((s) => s !== slot));
            }
            return;
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

    //----------------------- SUBMIT LOGIC -----------------------

    async function handleSubmit(e) {
        e.preventDefault();

        const selectedTimes = selectedSlots
            .map((slot) => slot.split("-")[1])
            // Sort the times to ensure they are in order
            // Because the user can select times in any order, we need to sort them to find the start and end times correctly
            .sort();

        const startTime = selectedTimes[0];

        const endTime =
            // Get the time after the last selected time
            times[times.indexOf(selectedTimes.at(-1)) + 1];

        const bookingData = {
            venue_id: Number(selectedVenue),
            user_id: 1,
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`,
            booking_date: date
        };

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/booking",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(bookingData)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Booking failed");
            }

            const result = await response.json();

            console.log("Booking created:", result);
            alert("Bespreking suksesvol!");

            // Refresh the bookings after a successful booking
            await loadBookings(selectedVenue);
            resetForm();

            if (onConfirm) {
                onConfirm({
                    campus: selectedCampus,
                    venue: selectedVenue,
                    date,
                    slots: selectedSlots,
                });
            }

        } catch (error) {
            console.error("Booking failed:", error);
            alert(error.message);
        }

    }

    //----------------------- VALIDATION -----------------------

    function checkSelectedDate(e) {
        if (e.target.value >= new Date().toISOString().split("T")[0]) {
            setDate(e.target.value);
            setSelectedSlots([]);
        }
        else {
            alert("Kies asseblief 'n geldige datum.");
            setDate("");
            setSelectedSlots([]);
        }
    }

    //----------------------- RENDER -----------------------

    if (!show) {
        return null;
    }

    return (
        <section className="booking-page">
            <PopupAnimation as="section" className="booking-modal" ref={modalRef}>

                <form className="booking-sidebar" onSubmit={handleSubmit} onReset={onCancelClicked}>

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
                        onChange={checkSelectedDate}
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
                            type="reset"
                            className="booking-cancel"
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

                                        const occupied = (timetables.some(
                                            (timetable) =>
                                                timetable.day_of_week === day &&
                                                timetable.start_time <= time &&
                                                timetable.end_time > time
                                        )) || (day == activeDay && date !== "" &&
                                            bookings.some(
                                                (booking) =>
                                                    booking.booking_date === date &&
                                                    booking.start_time <= time &&
                                                    booking.end_time > time
                                            ));

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
