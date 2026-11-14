
import { Trash2, X } from "lucide-react";
import "../styles/DeleteEventModal.css";

const DeleteEventModal = ({
    event,
    onClose,
    onConfirm,
    deleting,
    error
}) => {

    if (!event) return null;

    return (
        <div
            className="delete-event-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !deleting) {
                    onClose();
                }
            }}
        >
            <div
                className="delete-event-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-event-title"
                aria-describedby="delete-event-description"
            >

                <div className="delete-event-header">

                    <div className="delete-event-icon">
                        <Trash2 size={24} />
                    </div>

                    <button
                        type="button"
                        className="delete-event-close"
                        onClick={onClose}
                        disabled={deleting}
                        aria-label="Chiudi"
                    >
                        <X size={22} />
                    </button>

                </div>

                <h2 id="delete-event-title">
                    Elimina evento
                </h2>

                <p id="delete-event-description">
                    Sei sicuro di voler eliminare l'evento{" "}
                    <strong>{event.title}</strong>?
                </p>

                <p className="delete-event-warning">
                    Questa operazione è definitiva e non può essere annullata.
                </p>

                {error && (
                    <p className="delete-event-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="delete-event-actions">

                    <button
                        type="button"
                        className="delete-event-cancel"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        Annulla
                    </button>

                    <button
                        type="button"
                        className="delete-event-confirm"
                        onClick={onConfirm}
                        disabled={deleting}
                    >
                        <Trash2 size={17} />

                        {deleting
                            ? "Eliminazione..."
                            : "Elimina definitivamente"
                        }
                    </button>

                </div>

            </div>
        </div>
    );
};

export default DeleteEventModal;
