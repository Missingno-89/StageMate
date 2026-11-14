
import { useState } from "react";
import { X, CalendarPlus, Pencil } from "lucide-react";

import "../styles/EventModal.css";

// ========================================
// ORARI OGNI 30 MINUTI
// ========================================

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
    const hours = String(Math.floor(index / 2)).padStart(2, "0");
    const minutes = index % 2 === 0 ? "00" : "30";

    return `${hours}:${minutes}`;
});

// ========================================
// FORM INIZIALE
// ========================================

const initialForm = {
    title: "",
    type: "rehearsal",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    description: ""
};

// ========================================
// FORMATTAZIONE DATE PER IL FORM
// ========================================

const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatTimeForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
};

const getInitialForm = (eventToEdit) => {
    if (!eventToEdit) {
        return { ...initialForm };
    }

    return {
        title: eventToEdit.title ?? "",
        type: eventToEdit.type ?? "rehearsal",
        startDate: formatDateForInput(eventToEdit.startDate),
        startTime: formatTimeForInput(eventToEdit.startDate),
        endDate: formatDateForInput(eventToEdit.endDate),
        endTime: formatTimeForInput(eventToEdit.endDate),
        location: eventToEdit.location ?? "",
        description: eventToEdit.description ?? ""
    };
};

// ========================================
// COMPONENTE
// ========================================

const EventModal = ({
    bandId,
    onClose,
    onEventCreated,
    onEventUpdated,
    eventToEdit = null
}) => {

    const isEditing = Boolean(eventToEdit);

    const [formData, setFormData] = useState(
        () => getInitialForm(eventToEdit)
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // ========================================
    // AGGIORNAMENTO CAMPI
    // ========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ========================================
    // SALVATAGGIO
    // ========================================

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (
            !formData.title.trim() ||
            !formData.startDate ||
            !formData.startTime
        ) {
            setError("Inserisci titolo, data e ora di inizio.");
            return;
        }

        if (
            (formData.endDate && !formData.endTime) ||
            (!formData.endDate && formData.endTime)
        ) {
            setError(
                "Per la fine dell'evento seleziona sia data che ora."
            );
            return;
        }

        const start = new Date(
            `${formData.startDate}T${formData.startTime}:00`
        );

        const end = formData.endDate
            ? new Date(
                `${formData.endDate}T${formData.endTime}:00`
            )
            : null;

        if (
            Number.isNaN(start.getTime()) ||
            (end && Number.isNaN(end.getTime()))
        ) {
            setError("La data o l'orario selezionato non è valido.");
            return;
        }

        if (end && end < start) {
            setError(
                "La data e l'ora di fine non possono precedere l'inizio."
            );
            return;
        }

        const payload = {
            title: formData.title.trim(),
            type: formData.type,
            startDate: start.toISOString(),
            endDate: end ? end.toISOString() : null,
            location: formData.location.trim(),
            description: formData.description.trim()
        };

        try {
            setSaving(true);

            const token = sessionStorage.getItem("token");

            const url = isEditing
                ? `http://localhost:9097/bands/${bandId}/events/${eventToEdit._id}`
                : `http://localhost:9097/bands/${bandId}/events`;

            const response = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    (isEditing
                        ? "Errore nella modifica dell'evento."
                        : "Errore nella creazione dell'evento.")
                );
            }

            if (!data.event) {
                throw new Error(
                    "Il server non ha restituito l'evento salvato."
                );
            }

            if (isEditing) {
                onEventUpdated(data.event);
            } else {
                onEventCreated(data.event);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // RENDER
    // ========================================

    return (
        <div
            className="event-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="event-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="event-modal-title"
            >

                {/* HEADER */}

                <div className="event-modal-header">

                    <div className="event-modal-heading">

                        {isEditing
                            ? <Pencil size={24} />
                            : <CalendarPlus size={24} />
                        }

                        <h2 id="event-modal-title">
                            {isEditing
                                ? "Modifica evento"
                                : "Nuovo evento"
                            }
                        </h2>

                    </div>

                    <button
                        type="button"
                        className="event-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Chiudi"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* FORM */}

                <form
                    className="event-modal-form"
                    onSubmit={handleSubmit}
                >

                    {/* TITOLO */}

                    <div className="event-modal-field">

                        <label htmlFor="event-title">
                            Titolo *
                        </label>

                        <input
                            id="event-title"
                            name="title"
                            type="text"
                            placeholder="Es. Prove in sala"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={255}
                            required
                        />

                    </div>

                    {/* TIPOLOGIA */}

                    <div className="event-modal-field">

                        <label htmlFor="event-type">
                            Tipologia *
                        </label>

                        <select
                            id="event-type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="rehearsal">Prove</option>
                            <option value="live">Live</option>
                            <option value="recording">Registrazione</option>
                            <option value="deadline">Scadenza</option>
                            <option value="other">Altro</option>
                        </select>

                    </div>

                    {/* DATA E ORA INIZIO */}

                    <div className="event-modal-date-row">

                        <div className="event-modal-field">

                            <label htmlFor="event-start-date">
                                Data inizio *
                            </label>

                            <input
                                id="event-start-date"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="event-modal-field">

                            <label htmlFor="event-start-time">
                                Ora inizio *
                            </label>

                            <select
                                id="event-start-time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Seleziona ora
                                </option>

                                {TIME_OPTIONS.map((time) => (
                                    <option key={time} value={time}>
                                        {time}
                                    </option>
                                ))}

                            </select>

                        </div>

                    </div>

                    {/* DATA E ORA FINE */}

                    <div className="event-modal-date-row">

                        <div className="event-modal-field">

                            <label htmlFor="event-end-date">
                                Data fine
                            </label>

                            <input
                                id="event-end-date"
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="event-modal-field">

                            <label htmlFor="event-end-time">
                                Ora fine
                            </label>

                            <select
                                id="event-end-time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Seleziona ora
                                </option>

                                {TIME_OPTIONS.map((time) => (
                                    <option key={time} value={time}>
                                        {time}
                                    </option>
                                ))}

                            </select>

                        </div>

                    </div>

                    {/* LUOGO */}

                    <div className="event-modal-field">

                        <label htmlFor="event-location">
                            Luogo
                        </label>

                        <input
                            id="event-location"
                            name="location"
                            type="text"
                            placeholder="Es. Sala prove Napoli"
                            value={formData.location}
                            onChange={handleChange}
                            maxLength={255}
                        />

                    </div>

                    {/* DESCRIZIONE */}

                    <div className="event-modal-field">

                        <label htmlFor="event-description">
                            Descrizione
                        </label>

                        <textarea
                            id="event-description"
                            name="description"
                            placeholder="Aggiungi dettagli..."
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={255}
                            rows={4}
                        />

                    </div>

                    {/* ERRORE */}

                    {error && (
                        <p
                            className="event-modal-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {/* PULSANTI */}

                    <div className="event-modal-actions">

                        <button
                            type="button"
                            className="event-modal-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Annulla
                        </button>

                        <button
                            type="submit"
                            className="event-modal-save"
                            disabled={saving}
                        >
                            {saving
                                ? "Salvataggio..."
                                : isEditing
                                    ? "Salva modifiche"
                                    : "Crea evento"
                            }
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
};

export default EventModal;
