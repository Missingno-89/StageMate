import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    Wallet,
    Users,
    FolderOpen,
    ArrowLeft,
    Bell,
    CircleUserRound,
    LogOut
} from "lucide-react";

import "../styles/BandSidebar.css";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";

const API_URL = import.meta.env.VITE_API_URL;

const BandSidebar = () => {
    const { bandId } = useParams();
    const navigate = useNavigate();
    const unreadCount = useUnreadNotifications(bandId);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const token = sessionStorage.getItem("token");

        if (!token) return () => controller.abort();

        const loadUser = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                });

                if (!response.ok) throw new Error("Impossibile caricare l'utente");

                const data = await response.json();
                setCurrentUser(data.user ?? data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Errore nel caricamento del profilo:", error);
                }
            }
        };

        loadUser();
        return () => controller.abort();
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        navigate("/", { replace: true });
    };

    const fullName = [currentUser?.name, currentUser?.surname]
        .filter(Boolean)
        .join(" ") || "Utente connesso";

    const menuItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: `/bands/${bandId}/dashboard` },
        { label: "Calendario", icon: CalendarDays, path: `/bands/${bandId}/calendar` },
        { label: "Cassa", icon: Wallet, path: `/bands/${bandId}/cash` },
        { label: "Membri", icon: Users, path: `/bands/${bandId}/members` },
        { label: "File", icon: FolderOpen, path: `/bands/${bandId}/files` }
    ];

    return (
        <aside className="band-sidebar">
            <h2 className="band-sidebar-logo">
                <img src="/images/logo-stage.png" alt="" className="band-sidebar-logo-icon" />
                <span>StageMate</span>
            </h2>

            <nav className="band-sidebar-nav">
                {menuItems.map(({ label, icon: Icon, path }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `band-sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="band-sidebar-bottom">
                <NavLink to="/bands" className="band-sidebar-back">
                    <ArrowLeft size={18} />
                    <span>Le mie band</span>
                </NavLink>

                <div className="band-sidebar-divider" />
                <span className="band-sidebar-section-label">ACCOUNT</span>

                <NavLink
                    to={`/bands/${bandId}/notifications`}
                    className={({ isActive }) =>
                        `band-sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <Bell size={20} />
                    <span>Notifiche</span>
                    {unreadCount > 0 && (
                        <span
                            className="notification-unread-dot"
                            aria-label={`${unreadCount} notifiche non lette`}
                        />
                    )}
                </NavLink>

                <div className="band-sidebar-user" aria-label={`Account: ${fullName}`}>
                    {currentUser?.avatar ? (
                        <img
                            className="band-sidebar-user-avatar"
                            src={currentUser.avatar}
                            alt=""
                        />
                    ) : (
                        <span className="band-sidebar-user-avatar band-sidebar-user-fallback">
                            <CircleUserRound size={24} />
                        </span>
                    )}
                    <span className="band-sidebar-user-info">
                        <span className="band-sidebar-user-name" title={fullName}>{fullName}</span>
                        <span className="band-sidebar-user-caption">Account connesso</span>
                    </span>
                </div>

                <button
                    type="button"
                    className="band-sidebar-link band-sidebar-action band-sidebar-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default BandSidebar;
