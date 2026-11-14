
import {
    X,
    CalendarDays,
    Clock3,
    MapPin,
    FileText,
    Pencil,
    Trash2
} from "lucide-react";

import "../styles/EventDetailsModal.css";

const EVENT_TYPES = {
    rehearsal: "Prove",
    live: "Live",
    recording: "Registrazione",
    deadline: "Scadenza",
    other: "Altro"
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit"
    });
};

const EventDetailsModal = ({
    event,
    onClose,
    onEdit,
    onDelete
}) => {

    if (!event) return null;

    return (
        <div
            className="event-details-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="event-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="event-details-title"
            >

                {/* HEADER */}

                <div className="event-details-header">

                    <div className="event-details-heading">
                        <CalendarDays size={24} />

                        <h2 id="event-details-title">
                            Dettagli evento
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="event-details-close"
                        onClick={onClose}
                        aria-label="Chiudi"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* TIPOLOGIA */}

                <span
                    className={`event-details-type event-details-type--${event.type}`}
                >
                    {EVENT_TYPES[event.type] || "Altro"}
                </span>

                {/* TITOLO */}

                <h3 className="event-details-name">
                    {event.title}
                </h3>

                {/* DATA */}

                <div className="event-details-info">

                    <CalendarDays size={19} />

                    <div>
                        <strong>Data inizio</strong>
                        <span>{formatDate(event.startDate)}</span>
                    </div>

                </div>

                {/* ORARIO */}

                <div className="event-details-info">

                    <Clock3 size={19} />

                    <div>
                        <strong>Orario</strong>

                        <span>
                            {formatTime(event.startDate)}

                            {event.endDate &&
                                ` – ${formatTime(event.endDate)}`
                            }
                        </span>
                    </div>

                </div>

                {/* DATA FINE, SE DIVERSA */}

                {event.endDate &&
                    formatDate(event.startDate) !==
                    formatDate(event.endDate) && (

                        <div className="event-details-info">

                            <CalendarDays size={19} />

                            <div>
                                <strong>Data fine</strong>
                                <span>
                                    {formatDate(event.endDate)}
                                </span>
                            </div>

                        </div>
                    )
                }

                {/* LUOGO */}

                {event.location && (

                    <div className="event-details-info">

                        <MapPin size={19} />

                        <div>
                            <strong>Luogo</strong>
                            <span>{event.location}</span>
                        </div>

                    </div>
                )}

                {/* DESCRIZIONE */}

                {event.description && (

                    <div className="event-details-info">

                        <FileText size={19} />

                        <div>
                            <strong>Descrizione</strong>
                            <span>{event.description}</span>
                        </div>

                    </div>
                )}

                {/* AZIONI */}

                <div className="event-details-actions">

                    <button
                        type="button"
                        className="event-details-delete"
                        onClick={() => onDelete(event)}
                    >
                        <Trash2 size={17} />
                        Elimina
                    </button>

                    <button
                        type="button"
                        className="event-details-edit"
                        onClick={() => onEdit(event)}
                    >
                        <Pencil size={17} />
                        Modifica
                    </button>

                </div>

            </div>
        </div>
    );
};

export default EventDetailsModal;
