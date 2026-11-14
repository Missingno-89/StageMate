import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    CalendarDays,
    Plus,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import "../styles/BandCalendar.css";

import EventModal from "./EventModal.jsx";
import EventDetailsModal from "./EventDetailsModal.jsx";
import DeleteEventModal from "./DeleteEventModal.jsx";

const WEEKDAYS = [
    "Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"
];

const BandCalendar = () => {

    const { bandId } = useParams();

    // ========================================
    // STATI
    // ========================================

    const [currentMonth, setCurrentMonth] = useState(
        () => new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        )
    );

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    
    const [showEventModal, setShowEventModal] = useState(false);

   
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // ========================================
    // RECUPERO EVENTI DAL BACKEND
    // ========================================

    useEffect(() => {
        const controller = new AbortController();
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError("");
                const token = sessionStorage.getItem("token");
                const response = await fetch(
                    `http://localhost:9097/bands/${bandId}/events`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Errore nel caricamento degli eventi (${response.status})`
                    );
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setEvents(data.events ?? []);
                }

            } catch (err) {

                if (err.name !== "AbortError") {
                    setError(err.message);
                }

            } finally {

                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();

        return () => controller.abort();

    }, [bandId]);

    // ========================================
    // CALCOLO DEL MESE
    // ========================================

    const today = new Date();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    // JavaScript: domenica = 0
    // Calendario: lunedì = 0

    const firstWeekday = (
        new Date(year, month, 1).getDay() + 6
    ) % 7;

    const calendarDays = [
        ...Array(firstWeekday).fill(null),
        ...Array.from(
            { length: daysInMonth },
            (_, index) => index + 1
        )
    ];

    const monthLabel = currentMonth.toLocaleDateString(
        "it-IT",
        {
            month: "long",
            year: "numeric"
        }
    );

    // ========================================
    // NAVIGAZIONE TRA I MESI
    // ========================================

    const changeMonth = (offset) => {

        setCurrentMonth(
            new Date(year, month + offset, 1)
        );

    };

    // ========================================
    // GIORNO CORRENTE
    // ========================================

    const isToday = (day) => {

        return (
            day !== null &&
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );

    };

    // ========================================
    // EVENTI DEL SINGOLO GIORNO
    // ========================================

    const getEventsForDay = (day) => {

        if (day === null) return [];

        return events.filter((event) => {

            const eventDate = new Date(event.startDate);

            if (Number.isNaN(eventDate.getTime())) {
                return false;
            }

            return (
                eventDate.getFullYear() === year &&
                eventDate.getMonth() === month &&
                eventDate.getDate() === day
            );

        });

    };

    // ========================================
    // FORMATTAZIONE ORARIO
    // ========================================

    const formatEventTime = (dateString) => {

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
        });

    };

    // ========================================
    // CREAZIONE EVENTO
    // ========================================

    const handleEventCreated = (newEvent) => {

        setEvents((prevEvents) => (
            [...prevEvents, newEvent].sort(
                (a, b) =>
                    new Date(a.startDate) -
                    new Date(b.startDate)
            )
        ));

        setShowEventModal(false);
    };

    // ========================================
    // APERTURA DETTAGLI EVENTO
    // ========================================

    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    // ========================================
    // CHIUSURA DETTAGLI EVENTO
    // ========================================

    const handleCloseDetails = () => {
        setSelectedEvent(null);
    };

    // ========================================
    // MODIFICA EVENTO
    // ========================================

   const handleEditEvent = (event) => {
    setSelectedEvent(null);
    setEventToEdit(event);
};
const handleEventUpdated = (updatedEvent) => {
    setEvents((prevEvents) =>
        prevEvents
            .map((event) =>
                event._id === updatedEvent._id
                    ? updatedEvent
                    : event
            )
            .sort(
                (a, b) =>
                    new Date(a.startDate) -
                    new Date(b.startDate)
            )
    );
    setEventToEdit(null);
};

    // ========================================
    // ELIMINAZIONE EVENTO
    // ========================================

    const handleDeleteEvent = (event) => {
        setSelectedEvent(null);
        setDeleteError("");
        setEventToDelete(event);
    };

    const handleCloseDelete = () => {
        if (deleting) return;
        setEventToDelete(null);
        setDeleteError("");
    };

    const handleConfirmDelete = async () => {
        if (!eventToDelete || deleting) return;

        const eventId = eventToDelete._id;
        setDeleting(true);
        setDeleteError("");

        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch(
                `http://localhost:9097/bands/${bandId}/events/${eventId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || `Errore nell'eliminazione (${response.status})`);
            }

            setEvents((prevEvents) =>
                prevEvents.filter((event) => event._id !== eventId)
            );
            setEventToDelete(null);
        } catch (err) {
            setDeleteError(err.message || "Impossibile eliminare l'evento.");
        } finally {
            setDeleting(false);
        }
    };

    // ========================================
    // RENDER
    // ========================================

    return (

        <div className="band-calendar">

            {/* HEADER */}

            <div className="band-calendar-header">

                <div className="band-calendar-heading">

                    <CalendarDays size={28} />

                    <div>
                        <h1>Calendario</h1>
                        <p>Gestisci gli eventi della tua band</p>
                    </div>

                </div>

                <button
                    type="button"
                    className="band-calendar-create"
                    onClick={() => setShowEventModal(true)}
                >
                    <Plus size={20} />
                    <span>Nuovo evento</span>
                </button>

            </div>

            {/* CONTENUTO CALENDARIO */}

            <section className="band-calendar-content dashboard-glass">

                {/* MESE E NAVIGAZIONE */}

                <div className="band-calendar-month-header">

                    <h2>{monthLabel}</h2>

                    <div className="band-calendar-navigation">

                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            aria-label="Mese precedente"
                        >
                            <ChevronLeft size={22} />
                        </button>

                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            aria-label="Mese successivo"
                        >
                            <ChevronRight size={22} />
                        </button>

                    </div>

                </div>

                {/* STATO CARICAMENTO */}

                {loading && (
                    <p className="band-calendar-message">
                        Caricamento eventi...
                    </p>
                )}

                {/* EVENTUALE ERRORE */}

                {error && (
                    <p
                        className="band-calendar-error"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {/* GRIGLIA CALENDARIO */}

                <div className="band-calendar-grid">

                    {/* GIORNI DELLA SETTIMANA */}

                    {WEEKDAYS.map((weekday) => (

                        <div
                            key={weekday}
                            className="band-calendar-weekday"
                        >
                            {weekday}
                        </div>

                    ))}

                    {/* GIORNI DEL MESE */}

                    {calendarDays.map((day, index) => (

                        <div
                            key={index}
                            className={
                                `band-calendar-day ${
                                    day === null ? "empty" : ""
                                } ${
                                    isToday(day) ? "today" : ""
                                }`
                            }
                        >

                            {day !== null && (

                                <>

                                    {/* NUMERO DEL GIORNO */}

                                    <span className="band-calendar-day-number">
                                        {day}
                                    </span>

                                    {/* EVENTI DEL GIORNO */}

                                    <div className="band-calendar-day-events">

                                        {getEventsForDay(day).map((event) => (

                                            <button
                                                type="button"
                                                key={event._id}
                                                className={
                                                    `band-calendar-event ${event.type}`
                                                }
                                                onClick={() =>
                                                    handleEventClick(event)
                                                }
                                                title={
                                                    `${event.title} - ${formatEventTime(event.startDate)}`
                                                }
                                                aria-label={
                                                    `Visualizza dettagli: ${event.title}`
                                                }
                                            >

                                                <span className="band-calendar-event-time">
                                                    {formatEventTime(event.startDate)}
                                                </span>

                                                <span className="band-calendar-event-title">
                                                    {event.title}
                                                </span>

                                            </button>

                                        ))}

                                    </div>

                                </>

                            )}

                        </div>

                    ))}

                </div>

            </section>

            {/* MODALE CREAZIONE EVENTO */}

            {showEventModal && (
                <EventModal
                    bandId={bandId}
                    onClose={() => setShowEventModal(false)}
                    onEventCreated={handleEventCreated}
                />
            )}

            {/* MODALE MODIFICA EVENTO */}

            {eventToEdit && (
                <EventModal
                    key={eventToEdit._id}
                    bandId={bandId}
                    eventToEdit={eventToEdit}
                    onClose={() => setEventToEdit(null)}
                    onEventUpdated={handleEventUpdated}
                />
            )}

            {/* MODALE CONFERMA ELIMINAZIONE */}

            {eventToDelete && (
                <DeleteEventModal
                    event={eventToDelete}
                    onClose={handleCloseDelete}
                    onConfirm={handleConfirmDelete}
                    deleting={deleting}
                    error={deleteError}
                />
            )}

            {/* MODALE DETTAGLI EVENTO */}

            {selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    onClose={handleCloseDetails}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                />
            )}

        </div>

    );
};

export default BandCalendar;
