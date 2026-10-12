import React, { useState, useEffect, useRef } from "react";
import PopupAnimation from "./PopupAnimation";
import LogIn from "./LogIn";
import { useAuth } from "./AuthContext";

function MyBookings({ userId }) {
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadMyBookings() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `http://127.0.0.1:8000/booking/by-user/${userId}`,
                    { signal: controller.signal }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Besprekings kon nie gelaai word nie."
                    );
                }

                setMyBookings(data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setError(error.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadMyBookings();

        return () => controller.abort();
    }, [userId]);

    async function deleteBooking(bookingId) {
        const confirmed = window.confirm(
            "Is jy seker jy wil hierdie bespreking kanselleer?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(bookingId);
            setError("");

            const response = await fetch(
                `http://127.0.0.1:8000/booking/${bookingId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Bespreking kon nie gekanselleer word nie."
                );
            }

            // Verwyder die bespreking onmiddellik uit die lys.
            setMyBookings((currentBookings) =>
                currentBookings.filter(
                    (booking) => booking.booking_id !== bookingId
                )
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    if (!userId) {
        return (
            <section className="my-bookings">
                <p>Teken asseblief in om jou besprekings te sien.</p>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="my-bookings">
                <p>Besprekings word gelaai...</p>
            </section>
        );
    }

    return (
        <section className="my-bookings">
            <div className="my-bookings-header">
                <h3>My Besprekings</h3>

                <span>
                    {myBookings.length} bespreking
                    {myBookings.length === 1 ? "" : "s"}
                </span>
            </div>

            {error && (
                <p className="my-bookings-error" role="alert">
                    {error}
                </p>
            )}

            {myBookings.length === 0 ? (
                <div className="my-bookings-empty">
                    <p>Jy het tans geen besprekings nie.</p>
                </div>
            ) : (
                <div className="my-bookings-list">
                    {myBookings.map((booking) => (
                        <article
                            className="my-booking-card"
                            key={booking.booking_id}
                        >
                            <div className="my-booking-info">
                                <h4>
                                    {booking.venue_name ||
                                        `Lokaal ${booking.venue_id}`}
                                </h4>

                                {booking.building_name && (
                                    <p>
                                        <strong>Gebou:</strong>{" "}
                                        {booking.building_name}
                                    </p>
                                )}

                                <p>
                                    <strong>Datum:</strong>{" "}
                                    {booking.booking_date}
                                </p>

                                <p>
                                    <strong>Tyd:</strong>{" "}
                                    {booking.start_time.slice(0, 5)}
                                    {" – "}
                                    {booking.end_time.slice(0, 5)}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="my-booking-delete"
                                disabled={deletingId === booking.booking_id}
                                onClick={() =>
                                    deleteBooking(booking.booking_id)
                                }
                            >
                                {deletingId === booking.booking_id
                                    ? "Kanselleer..."
                                    : "\u{1F5D1}"}
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

function Booking({ show, onConfirm, onCancel, onClose }) {

    //Kyk of 'n gebruiker in geteken is, anders gaan 'n bespreking nie gemaak kan word nie
    const { user, isLoggedIn } = useAuth();

    //----------------------- KONSTANTES -----------------------

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

    const [showLogIn, setShowLogin] = useState(false);
    const [activeTab, setActiveTab] = useState("create");

    // Wys die login modal
    const showLoginModal = () => {
        setShowLogin(true);
    };

    // Maak die login modal toe
    const hideLoginModal = () => {
        setShowLogin(false);
    };

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

    //Kies datum eerste, onttrek die dag van die week uit
    const activeDay =
        date !== ""
            ? days[new Date(date).getDay()]
            : "";


    //----------------------- API ROEP -----------------------

    //Haal kampusse deur API, stel die eerste kampus as die verstek waarde
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

    //Haal die lokale wat aan die geselekteerde kampus behoort, stel die eerste een as die verstek
    //Herlaai elke keer as kampus verander
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

    //Haal rooster en bestaande besprekings vir die lokaal
    //Herlaai elke keer as lokaal verander
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

        if (date !== "") {
            loadBookings(selectedVenue, date);
        } else {
            setBookings([]);
        }
    }, [selectedVenue, date]);

    // Laai besprekings vir die geselekteerde lokaal
    async function loadBookings(venueId, bookingDate) {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/booking/by-venue/${venueId}?booking_date=${bookingDate}`
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

    // Stel vorm terug na verstek waardes
    function resetForm() {
        setSelectedCampus(defaultValues.campus);
        setSelectedVenue(defaultValues.venue);
        setDate(defaultValues.date);
        setSelectedSlots(defaultValues.slots);
    }

    // Maak modal toe en herstel vorm as daar buite die modal of Esc geklik word
    //showLogIn check voorkom dat 'n klik buite die login modal ook die booking modal toe maak
    useEffect(() => {
        const closeModalonClickOut = (e) => {
            if (
                show &&
                !showLogIn &&
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
    }, [show, onClose, showLogIn]);

    useEffect(() => {
        if (show) {
            setActiveTab("create");
        }
    }, [show]);

    //Maak geselekteerde tydgleuwe skoon
    function clearSelection() {
        setSelectedSlots([]);
    }

    // Herstel vorm en maak modal toe
    function onCancelClicked() {
        resetForm();
        if (onClose) onClose();
        if (onCancel) onCancel();
    }

    //----------------------- TABLE CELL LOGIC -----------------------

    // Kies/ deselekteer tydgleuwe. Kan net aaneenlopende tye kies
    function handleCellClick(day, time, occupied) {
        if (occupied || !activeDay || day !== activeDay) return;

        const slot = `${day}-${time}`;

        // Deselekteer
        if (selectedSlots.includes(slot)) {
            // Tyd index van die gleuf wat verwyder word
            const timeIndex = times.indexOf(time);

            // Tyd indekse van all die huidige geselekteerde gleuwe
            const selectedTimeIndexes = selectedSlots.map((s) =>
                times.indexOf(s.split("-")[1])
            );

            // Vroegste en laatste tyd in die huidige reeks gleuwe
            const lowest = Math.min(...selectedTimeIndexes);
            const highest = Math.max(...selectedTimeIndexes);

            // Laat slegs toe dat 'n grens gleuf (vroegste of laatste tyd) verwyder word
            //'n Gleuf in die middel van die reeks deselekteer breek die ry, deselekteer alles
            if (timeIndex !== lowest && timeIndex !== highest) {
                clearSelection();
            } else {
                setSelectedSlots(selectedSlots.filter((s) => s !== slot));
            }
            return;
        }
        // Eerste gekies
        if (selectedSlots.length === 0) {
            setSelectedSlots([slot]);
            return;
        }

        // Tyd indekse van die geselekteerde geleuwe
        const selectedIndexes = selectedSlots.map((s) =>
            times.indexOf(s.split("-")[1])
        );
        // MON-10:00
        //["MON", "10:00"]
        //[2] = ["10:00"]

        // Tyd index van die nuwe gleuf
        const newIndex = times.indexOf(time);

        // Kry die laagste en hoogste indekse van die huidige reeks
        const lowest = Math.min(...selectedIndexes);
        const highest = Math.max(...selectedIndexes);

        // Kan slegs 'n waarde 1 hoër of laer van die stel gleuwe kies
        if (newIndex === lowest - 1 || (newIndex === highest + 1)) {
            setSelectedSlots([...selectedSlots, slot]);
        }
    }

    //----------------------- SUBMIT LOGIC -----------------------

    // Stuur bespreking na API vir die geselekteerde lokal, datum en tye
    // begin en eind  tye kom van die eerste en laaste gekose gleuf
    async function handleSubmit(e) {
        e.preventDefault();

        const selectedTimes = selectedSlots
            .map((slot) => slot.split("-")[1])
            // Sorteer tye om seker te maak hulle is in volgorde
            // Omdat die gebruiker tye in enige volgorde kan kies, moet ons hulle sorteer sodat ons die regte begin en eind tye kan kry
            .sort();

        const startTime = selectedTimes[0];

        const lastSelectedTime = selectedTimes.at(-1);
        const nextIndex = times.indexOf(lastSelectedTime) + 1;

        const endTime =
            times[nextIndex] ||
            `${parseInt(lastSelectedTime.split(":")[0], 10) + 1}:00`;

        const bookingData = {
            venue_id: Number(selectedVenue),
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`,
            booking_date: date,
            user_id: user.user_id
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
                throw new Error(typeof errorData.detail === "string"
                    ? errorData.detail
                    : JSON.stringify(errorData.detail));
            }

            const result = await response.json();

            alert("Bespreking suksesvol!");

            // Herlaai besprekings na 'n suksesvolle bespreking
            await loadBookings(selectedVenue, date);
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

    //----------------------- RENDER -----------------------

    if (!show) {
        return null;
    }

    return (
        <section className="booking-page">
            <PopupAnimation as="section" className="booking-modal" ref={modalRef}>
                <div className="booking-tabs">
                    <button
                        type="button"
                        className={activeTab === "create" ? "booking-tab active" : "booking-tab"}
                        onClick={() => setActiveTab("create")}
                    >
                        Bespreek lokaal
                    </button>

                    <button
                        type="button"
                        className={activeTab === "list" ? "booking-tab active" : "booking-tab"}
                        onClick={() => setActiveTab("list")}
                        disabled={!isLoggedIn}
                    >
                        My besprekings
                    </button>
                </div>
                {activeTab == "create" && (
                    <>
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
                                // Voorkom datums wat in die verlede is
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    // Maak keuse leeg, want die tyd gleuwe tel nie vir die nuwe datum nie
                                    setSelectedSlots([]);
                                }}
                            />

                            {/* Wys net as daar tye al gekies is */}
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
                                {/* Wys login prompt as die gebruiker nie ingeteken is nie, kan daarop klik om die login modal oop te maak */}
                                {isLoggedIn === false && (
                                    <div className="Sign-In-Prompt">
                                        <a onClick={showLoginModal}><strong><i>Teken In om 'n bespreking te maak.</i></strong></a>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="booking-confirm"
                                    // Kan nie indien as daar geen tye gekies is nie, of as die gebruiker nie ingeteken is nie
                                    disabled={selectedSlots.length === 0 || isLoggedIn === false}
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
                                                // Disable dae wat nie die gekose datum se dag is nie
                                                className={
                                                    activeDay && day !== activeDay
                                                        ? "disabled-header"
                                                        : "active-header"
                                                }
                                            >
                                                <span className="day-full">{day}</span>
                                                <span className="day-short">{day.charAt(0)}</span>
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

                                                // Die tydgleuf is deur die rooster beset of 'n bestaande bespreking is op daai tyd
                                                // *Die tyd in die tabel en die API moet dieselfde formaat hê*

                                                // Kyk of die tydgleuf beset is deur die rooster
                                                const timetableOccupied = timetables.some(
                                                    (timetable) => {
                                                        const startTime = timetable.start_time.slice(0, 5);
                                                        const endTime = timetable.end_time.slice(0, 5);

                                                        return (
                                                            timetable.day_of_week === day &&
                                                            startTime <= time &&
                                                            endTime > time
                                                        );
                                                    }
                                                );
                                                // Kyk of die tydgleuf beset is deur 'n bestaande bespreking
                                                const bookingOccupied =
                                                    day === activeDay &&
                                                    date !== "" &&
                                                    bookings.some(
                                                        (booking) => {
                                                            const startTime = booking.start_time.slice(0, 5);
                                                            const endTime = booking.end_time.slice(0, 5);

                                                            return (
                                                                booking.booking_date === date &&
                                                                startTime <= time &&
                                                                endTime > time
                                                            );
                                                        }
                                                    );

                                                // Die tydgleuf is beset as dit deur die rooster of 'n bestaande bespreking beset is
                                                const occupied = timetableOccupied || bookingOccupied;

                                                const selected = selectedSlots.includes(slot);

                                                // Net die aktiewe dag is aktief
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
                    </>
                )}
                {activeTab === "list" && (
                    <MyBookings userId={user?.user_id} />
                )}
            </PopupAnimation>

            <LogIn show={showLogIn} onClose={hideLoginModal} />
        </section>
    );
}

// Uitvoer van die booking funksie
export default Booking;
