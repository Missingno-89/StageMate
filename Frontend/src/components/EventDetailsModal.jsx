import { useEffect, useState } from "react";
import {
    X, CalendarDays, Clock3, MapPin, FileText, Pencil, Trash2,
    Eye, CheckCircle2, Users
} from "lucide-react";
import "../styles/EventDetailsModal.css";


const EVENT_TYPES = {
    rehearsal: "Prove", live: "Live", recording: "Registrazione",
    deadline: "Scadenza", other: "Altro"
};

const formatDate = (date) => new Date(date).toLocaleDateString("it-IT", {
    day: "numeric", month: "long", year: "numeric"
});
const formatTime = (date) => new Date(date).toLocaleTimeString("it-IT", {
    hour: "2-digit", minute: "2-digit"
});

const EventDetailsModal = ({ event, bandId, onClose, onEdit, onDelete }) => {
    const [attendance, setAttendance] = useState(null);
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [saving, setSaving] = useState(false);
    const [attendanceError, setAttendanceError] = useState("");

    useEffect(() => {
        if (!event?._id || !bandId) return;
        const controller = new AbortController();
        const loadAttendance = async () => {
            setLoadingAttendance(true);
            setAttendanceError("");
            setAttendance(null);
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/bands/${bandId}/events/${event._id}/attendance`,
                    { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.message || "Impossibile caricare le conferme");
                if (!controller.signal.aborted) setAttendance(data);
            } catch (error) {
                if (error.name !== "AbortError" && !controller.signal.aborted) {
                    setAttendanceError(error.message);
                }
            } finally {
                if (!controller.signal.aborted) setLoadingAttendance(false);
            }
        };
        loadAttendance();
        return () => controller.abort();
    }, [bandId, event?._id]);

    const updateAttendance = async (payload) => {
        if (saving) return;
        setSaving(true);
        setAttendanceError("");
        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bands/${bandId}/events/${event._id}/attendance`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || "Impossibile salvare la risposta");

            const refreshed = await fetch(
                `${import.meta.env.VITE_API_URL}/bands/${bandId}/events/${event._id}/attendance`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const refreshedData = await refreshed.json().catch(() => ({}));
            if (!refreshed.ok) throw new Error(refreshedData.message || "Impossibile aggiornare i contatori");
            setAttendance(refreshedData);
        } catch (error) {
            setAttendanceError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!event) return null;

    const summary = attendance?.summary ?? {};
    const totalMembers = summary.totalMembers ?? 0;
    const readCount = summary.read ?? 0;
    const confirmedCount = summary.confirmed ?? 0;
    const myAttendance = attendance?.myAttendance;
    const hasRead = Boolean(myAttendance?.hasRead);
    const confirmed = Boolean(myAttendance?.confirmed);
    const attendances = attendance?.attendances ?? [];

    return (
        <div className="event-details-overlay" onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="event-details-modal" role="dialog" aria-modal="true" aria-labelledby="event-details-title">
                <div className="event-details-header">
                    <div className="event-details-heading">
                        <CalendarDays size={24} />
                        <h2 id="event-details-title">Dettagli evento</h2>
                    </div>
                    <button type="button" className="event-details-close" onClick={onClose} aria-label="Chiudi">
                        <X size={22} />
                    </button>
                </div>

                <span className={`event-details-type event-details-type--${event.type}`}>
                    {EVENT_TYPES[event.type] || "Altro"}
                </span>
                <h3 className="event-details-name">{event.title}</h3>

                <div className="event-details-info">
                    <CalendarDays size={19} />
                    <div><strong>Data inizio</strong><span>{formatDate(event.startDate)}</span></div>
                </div>
                <div className="event-details-info">
                    <Clock3 size={19} />
                    <div>
                        <strong>Orario</strong>
                        <span>{formatTime(event.startDate)}{event.endDate && ` – ${formatTime(event.endDate)}`}</span>
                    </div>
                </div>
                {event.endDate && formatDate(event.startDate) !== formatDate(event.endDate) && (
                    <div className="event-details-info">
                        <CalendarDays size={19} />
                        <div><strong>Data fine</strong><span>{formatDate(event.endDate)}</span></div>
                    </div>
                )}
                {event.location && (
                    <div className="event-details-info">
                        <MapPin size={19} />
                        <div><strong>Luogo</strong><span>{event.location}</span></div>
                    </div>
                )}
                {event.description && (
                    <div className="event-details-info">
                        <FileText size={19} />
                        <div><strong>Descrizione</strong><span>{event.description}</span></div>
                    </div>
                )}

                <section className="event-attendance" aria-label="Lettura e conferma presenza">
                    <h4 className="event-attendance-title"><Users size={18} /> Risposte dei membri</h4>
                    {loadingAttendance ? (
                        <p className="event-attendance-message">Caricamento conferme...</p>
                    ) : (
                        <>
                            <div className="event-attendance-summary">
                                <div className="event-attendance-stat">
                                    <span><Eye size={17} /> Hanno letto</span>
                                    <strong>{readCount}/{totalMembers}</strong>
                                </div>
                                <div className="event-attendance-stat">
                                    <span><CheckCircle2 size={17} /> Confermati</span>
                                    <strong>{confirmedCount}/{totalMembers}</strong>
                                </div>
                            </div>
                            <div className="event-attendance-buttons">
                                <button type="button" disabled={saving || !attendance || hasRead}
                                    className={`event-attendance-button ${hasRead ? "is-active" : ""}`}
                                    onClick={() => updateAttendance({ action: "read" })}>
                                    <Eye size={17} /> {hasRead ? "Letto" : "Ho letto"}
                                </button>
                                <button type="button" disabled={saving || !attendance || (!hasRead && !confirmed)}
                                    className={`event-attendance-button ${confirmed ? "is-confirmed" : ""}`}
                                    onClick={() => updateAttendance({ action: "confirm", confirmed: !confirmed })}>
                                    <CheckCircle2 size={17} /> {confirmed ? "Annulla conferma" : "Conferma presenza"}
                                </button>
                            </div>
                            {attendances.length > 0 && (
                                <div className="event-attendance-members">
                                    <h5 className="event-attendance-members-title">Risposte registrate</h5>
                                    {attendances.map((item) => {
                                        const member = item.userId;
                                        const name = typeof member === "object" && member
                                            ? [member.name, member.surname].filter(Boolean).join(" ")
                                            : "Membro";
                                        return (
                                            <div className="event-attendance-member" key={item._id}>
                                                <span>{name}</span>
                                                <div className="event-attendance-member-status">
                                                    {item.hasRead && (
                                                        <Eye
                                                            size={20}
                                                            className="has-read"
                                                            aria-label="Evento letto"
                                                        />
                                                    )}
                                                    {item.confirmed && (
                                                        <CheckCircle2
                                                            size={20}
                                                            className="has-confirmed"
                                                            aria-label="Presenza confermata"
                                                        />
                                                    )}
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                    {attendanceError && <p className="event-attendance-error" role="alert">{attendanceError}</p>}
                </section>

                <div className="event-details-actions">
                    <button type="button" className="event-details-delete" onClick={() => onDelete(event)}>
                        <Trash2 size={17} /> Elimina
                    </button>
                    <button type="button" className="event-details-edit" onClick={() => onEdit(event)}>
                        <Pencil size={17} /> Modifica
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
