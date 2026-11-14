
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Clock3,
    MapPin
} from "lucide-react";

import "../styles/UpcomingEvents.css";

const EVENT_TYPES = {
    rehearsal: { label: "Prove", color: "#38d9e6" },
    live: { label: "Live", color: "#f59e0b" },
    recording: { label: "Registrazioni", color: "#a78bfa" },
    deadline: { label: "Scadenze", color: "#ef4444" },
    other: { label: "Altro", color: "#94a3b8" }
};

const WEEKDAYS = ["L", "M", "M", "G", "V", "S", "D"];

const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const UpcomingEvents = ({ bandId }) => {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentMonth, setCurrentMonth] = useState(
        () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );

    useEffect(() => {
        const controller = new AbortController();

        const fetchEvents = async () => {
            setLoading(true);
            setError("");

            try {
                const token = sessionStorage.getItem("token");

                if (!token) {
                    throw new Error("Sessione non valida");
                }

                const response = await fetch(
                    `http://localhost:9097/bands/${bandId}/events`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));

                    console.error("Errore calendario:", {
                        status: response.status,
                        data: errorData
                    });

                    throw new Error(
                        errorData.message ||
                        `Errore nel recupero degli eventi (${response.status})`
                    );
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setEvents(Array.isArray(data.events) ? data.events : []);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        if (bandId) {
            fetchEvents();
        } else {
            setEvents([]);
            setLoading(false);
        }

        return () => controller.abort();
    }, [bandId]);

    const changeMonth = (direction) => {
        setCurrentMonth((previous) =>
            new Date(
                previous.getFullYear(),
                previous.getMonth() + direction,
                1
            )
        );
    };

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const totalDays = new Date(year, month + 1, 0).getDate();

        const offset = (firstDay.getDay() + 6) % 7;

        return [
            ...Array(offset).fill(null),
            ...Array.from({ length: totalDays }, (_, index) => index + 1)
        ];
    }, [currentMonth]);

    const eventsByDay = useMemo(() => {
        const grouped = {};

        events.forEach((event) => {
            const date = new Date(event.startDate);

            if (Number.isNaN(date.getTime())) return;

            const key = dateKey(date);

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(event);
        });

        return grouped;
    }, [events]);

    const nextEvent = useMemo(() => {
        const now = new Date();

        return [...events]
            .filter((event) => {
                const date = new Date(event.startDate);

                return !Number.isNaN(date.getTime()) && date >= now;
            })
            .sort(
                (a, b) =>
                    new Date(a.startDate) - new Date(b.startDate)
            )[0] || null;
    }, [events]);

    const monthLabel = new Intl.DateTimeFormat("it-IT", {
        month: "long",
        year: "numeric"
    }).format(currentMonth);

    const openCalendar = () => {
        navigate(`/bands/${bandId}/calendar`);
    };

    const todayKey = dateKey(new Date());

    
return (
    <section className="upcoming-events dashboard-glass">
        <div className="upcoming-events-header">
            <div className="upcoming-events-heading">
                <CalendarDays size={21} />
                <h2>Calendario</h2>
            </div>

            <button
                type="button"
                className="upcoming-events-open"
                onClick={openCalendar}
                aria-label="Apri calendario completo"
                title="Apri calendario completo"
            >
                <ArrowUpRight size={20} />
            </button>
        </div>

        {loading && (
            <p className="upcoming-events-message">
                Caricamento eventi...
            </p>
        )}

        {error && (
            <p className="upcoming-events-error" role="alert">
                {error}
            </p>
        )}

        {!loading && !error && (
            <div className="upcoming-events-body">
                {/* CALENDARIO A SINISTRA */}

                <div className="upcoming-events-calendar">
                    <div className="upcoming-events-month">
                        <h3>
                            {monthLabel.charAt(0).toUpperCase() +
                                monthLabel.slice(1)}
                        </h3>

                        <div className="upcoming-events-navigation">
                            <button
                                type="button"
                                onClick={() => changeMonth(-1)}
                                aria-label="Mese precedente"
                            >
                                <ChevronLeft size={19} />
                            </button>

                            <button
                                type="button"
                                onClick={() => changeMonth(1)}
                                aria-label="Mese successivo"
                            >
                                <ChevronRight size={19} />
                            </button>
                        </div>
                    </div>

                    <div className="upcoming-events-grid">
                        {WEEKDAYS.map((day, index) => (
                            <div
                                key={`weekday-${index}`}
                                className="upcoming-events-weekday"
                            >
                                {day}
                            </div>
                        ))}

                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className="upcoming-events-day empty"
                                    />
                                );
                            }

                            const date = new Date(
                                currentMonth.getFullYear(),
                                currentMonth.getMonth(),
                                day
                            );

                            const key = dateKey(date);
                            const dayEvents = eventsByDay[key] || [];

                            const uniqueTypes = [
                                ...new Set(
                                    dayEvents.map((event) => event.type)
                                )
                            ];

                            return (
                                <div
                                    key={key}
                                    className={`upcoming-events-day ${
                                        key === todayKey ? "today" : ""
                                    }`}
                                    title={
                                        dayEvents.length
                                            ? dayEvents
                                                .map((event) => event.title)
                                                .join(", ")
                                            : undefined
                                    }
                                >
                                    <span>{day}</span>

                                    <div className="upcoming-events-indicators">
                                        {uniqueTypes.map((type) => (
                                            <span
                                                key={type}
                                                className="upcoming-events-indicator"
                                                style={{
                                                    backgroundColor:
                                                        EVENT_TYPES[type]?.color ||
                                                        EVENT_TYPES.other.color
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="upcoming-events-legend">
                        {Object.entries(EVENT_TYPES).map(
                            ([type, config]) => (
                                <div
                                    key={type}
                                    className="upcoming-events-legend-item"
                                >
                                    <span
                                        className="upcoming-events-legend-dot"
                                        style={{
                                            backgroundColor: config.color
                                        }}
                                    />
                                    <span>{config.label}</span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                
            </div>
        )}
    </section>
);

};

export default UpcomingEvents;
