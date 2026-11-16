
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:9097";

export const useUnreadNotifications = (bandId) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!bandId) return;

        const token = sessionStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_URL}/notifications/bands/${bandId}/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Errore nel recupero notifiche");
            }

            const data = await response.json();
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error(error);
        }
    }, [bandId]);

    useEffect(() => {
        setUnreadCount(0);
        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 15000);

        const handleNotificationsUpdated = () => {
            fetchUnreadCount();
        };

        window.addEventListener(
            "notifications-updated",
            handleNotificationsUpdated
        );

        return () => {
            clearInterval(interval);
            window.removeEventListener(
                "notifications-updated",
                handleNotificationsUpdated
            );
        };
    }, [fetchUnreadCount]);

    return unreadCount;
};
