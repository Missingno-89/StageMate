
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Bell,
    CalendarDays,
    Wallet,
    MessageSquare,
    FolderOpen,
    CheckCheck,
    Trash2
} from "lucide-react";

import "../styles/BandNotifications.css";

const API_URL = "http://localhost:9097";

const notificationIcons = {
    event_created: CalendarDays,
    event_updated: CalendarDays,
    event_deleted: CalendarDays,
    cash_updated: Wallet,
    post_created: MessageSquare,
    file_uploaded: FolderOpen
};

const BandNotifications = () => {
    const { bandId } = useParams();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const unreadCount = notifications.filter(
        notification => !notification.isRead
    ).length;

    const fetchNotifications = useCallback(async () => {
        const token = sessionStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_URL}/notifications/bands/${bandId}/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Impossibile recuperare le notifiche");
            }

            const data = await response.json();
            setNotifications(data.notifications);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [bandId]);

    useEffect(() => {
        setLoading(true);
        setNotifications([]);

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (notificationId) => {
        const token = sessionStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_URL}/notifications/bands/${bandId}/${notificationId}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Impossibile aggiornare la notifica");
            }

            await fetchNotifications();
            window.dispatchEvent(new Event("notifications-updated"));

        } catch (err) {
            setError(err.message);
        }
    };

    const markAllAsRead = async () => {
        const token = sessionStorage.getItem("token");

        try {
            setUpdating(true);

            const response = await fetch(
                `${API_URL}/notifications/bands/${bandId}/read-all`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Impossibile aggiornare le notifiche");
            }

            await fetchNotifications();
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const deleteNotifications = async () => {


        const token = sessionStorage.getItem("token");

        try {
            setUpdating(true);

            const response = await fetch(
                `${API_URL}/notifications/bands/${bandId}/my`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Impossibile eliminare le notifiche");
            }
            setShowDeleteConfirm(false);

            await fetchNotifications();

            window.dispatchEvent(new Event("notifications-updated"));

            await fetchNotifications();

            window.dispatchEvent(
                new Event("notifications-updated")
            );

        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };


    return (
        <main className="band-notifications-page">
            <header className="band-notifications-header">
                <div className="band-notifications-heading">
                    <Bell size={26} aria-hidden="true" />
                    <div>
                        <h1>Notifiche</h1>
                        <p>Rimani aggiornato sulle attività della tua band</p>
                    </div>
                </div>

                {!loading && (
                    <span className="band-notifications-count">
                        {unreadCount} {unreadCount === 1 ? "non letta" : "non lette"}
                    </span>
                )}
            </header>

            <section className="band-notifications-panel">
                <div className="band-notifications-panel-header">
                    <h2>
                        <Bell size={20} aria-hidden="true" />
                        Attività della band
                    </h2>

                    <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={updating || unreadCount === 0}
                        className="band-notifications-read-all"
                    >
                        <CheckCheck size={17} />
                        {updating ? "Aggiornamento..." : "Segna tutte come lette"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}

                        disabled={updating || notifications.length === 0}
                        className="band-notifications-delete"
                    >
                        <Trash2 size={17} />
                        Svuota storico
                    </button>
                </div>

                {showDeleteConfirm && (
                    <div
                        className="band-notifications-confirm"
                        role="alertdialog"
                        aria-modal="false"
                        aria-labelledby="delete-notifications-message"
                    >
                        <p id="delete-notifications-message">
                            Vuoi davvero eliminare tutto lo storico delle notifiche?
                            L'operazione non potrà essere annullata.
                        </p>

                        <div className="band-notifications-confirm-actions">
                            <button
                                type="button"
                                className="band-notifications-confirm-cancel"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={updating}
                            >
                                Annulla
                            </button>

                            <button
                                type="button"
                                className="band-notifications-confirm-delete"
                                onClick={deleteNotifications}
                                disabled={updating}
                            >
                                <Trash2 size={17} />
                                {updating
                                    ? "Eliminazione..."
                                    : "Elimina definitivamente"}
                            </button>
                        </div>
                    </div>
                )}



                {error && (
                    <p className="band-notifications-page-error" role="alert">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="band-notifications-page-empty">
                        Caricamento notifiche...
                    </p>
                ) : notifications.length === 0 ? (
                    <div className="band-notifications-page-empty">
                        <Bell size={32} />
                        <p>Nessuna notifica per questa band.</p>
                    </div>
                ) : (
                    <div className="band-notifications-page-list">
                        {notifications.map((notification) => {
                            const Icon = notificationIcons[notification.type] || Bell;

                            return (
                                <button
                                    key={notification._id}
                                    type="button"
                                    className={`band-notifications-page-item ${!notification.isRead ? "unread" : ""
                                        }`}
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            markAsRead(notification._id);
                                        }
                                    }}
                                >
                                    <span className="band-notifications-page-icon">
                                        <Icon size={21} />
                                    </span>

                                    <span className="band-notifications-page-content">
                                        <span className="band-notifications-page-message">
                                            {notification.message}
                                        </span>

                                        <span className="band-notifications-page-date">
                                            {new Date(notification.created_at).toLocaleString(
                                                "it-IT",
                                                {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                }
                                            )}
                                        </span>
                                    </span>

                                    {!notification.isRead && (
                                        <span className="band-notifications-page-dot" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

            </section>
        </main>
    );
};

export default BandNotifications;
