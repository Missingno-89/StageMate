import { useEffect, useState } from "react";
import { CalendarClock, Clock3, MapPin, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/NextBandEvents.css";


const EVENT_TYPES = {
    rehearsal: { label: "Prove", color: "#38d9e6" },
    live: { label: "Live", color: "#f59e0b" },
    recording: { label: "Registrazione", color: "#a78bfa" },
    deadline: { label: "Scadenza", color: "#ef4444" },
    other: { label: "Altro", color: "#94a3b8" }
};

const NextBandEvents = ({ bandId }) => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const token = sessionStorage.getItem("token");
                if (!token) throw new Error("Sessione non valida");
                const response = await fetch(`http://localhost:9097/bands/${bandId}/events`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                });
                if (!response.ok) throw new Error(`Impossibile caricare gli eventi (${response.status})`);
                const data = await response.json();
                if (!controller.signal.aborted) setEvents(Array.isArray(data.events) ? data.events : []);
            } catch (err) {
                if (!controller.signal.aborted && err.name !== "AbortError") setError(err.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        if (bandId) load();
        else { setEvents([]); setLoading(false); }
        return () => controller.abort();
    }, [bandId]);

    const now = Date.now();
    const nextEvent = events
        .filter(event => {
            const start = new Date(event.startDate).getTime();
            const end = event.endDate ? new Date(event.endDate).getTime() : start;
            return Number.isFinite(start) && Math.max(start, Number.isFinite(end) ? end : start) >= now;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

    if (loading) return <p className="next-band-events-message">Caricamento eventi...</p>;
    if (error) return <p className="next-band-events-error" role="alert">{error}</p>;
    if (!nextEvent) return <p className="next-band-events-message">Non ci sono eventi in programma.</p>;

    const type = EVENT_TYPES[nextEvent.type] || EVENT_TYPES.other;
    const startDate = new Date(nextEvent.startDate);
    return (
        <div className="next-band-events">
        
            <div className="next-band-events-top">
                <span className="next-band-events-type" style={{ color: type.color, borderColor: type.color }}>
                    <CalendarClock size={15} /> {type.label}
                </span>
                <button type="button" className="next-band-events-open"
                    onClick={() => navigate(`/bands/${bandId}/calendar`)}
                    aria-label="Apri calendario completo" title="Apri calendario completo">
                    <ArrowUpRight size={20} />
                </button>
            </div>
            <h3>{nextEvent.title}</h3>
            <p className="next-band-events-detail">
                <Clock3 size={16} />
                {startDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                {" · "}{startDate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
            </p>
            {nextEvent.location && <p className="next-band-events-detail"><MapPin size={16} />{nextEvent.location}</p>}
        </div>
    );
};

export default NextBandEvents;
