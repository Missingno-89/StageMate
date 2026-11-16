
import { NavLink, useParams } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    Wallet,
    Users,
    FolderOpen,
    ArrowLeft,
    Bell,
    CircleUserRound,
    Settings
} from "lucide-react";

import "../styles/BandSidebar.css";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";

const BandSidebar = () => {
    const { bandId } = useParams();
    const unreadCount = useUnreadNotifications(bandId);

    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: `/bands/${bandId}/dashboard`
        },
        {
            label: "Calendario",
            icon: CalendarDays,
            path: `/bands/${bandId}/calendar`
        },
        {
            label: "Cassa",
            icon: Wallet,
            path: `/bands/${bandId}/cash`
        },
        {
            label: "Membri",
            icon: Users,
            path: `/bands/${bandId}/members`
        },
        {
            label: "File",
            icon: FolderOpen,
            path: `/bands/${bandId}/files`
        }
    ];

    return (
        <aside className="band-sidebar">
            <h2 className="band-sidebar-logo">
                <img
                    src="/images/logo-stage.png"
                    alt=""
                    className="band-sidebar-logo-icon"
                />
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

                <span className="band-sidebar-section-label">
                    ACCOUNT
                </span>


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


                <button
                    type="button"
                    className="band-sidebar-link band-sidebar-action"
                    onClick={() => {
                        // Collegheremo qui le impostazioni
                    }}
                >
                    <Settings size={20} />
                    <span>Impostazioni</span>
                </button>

                <button
                    type="button"
                    className="band-sidebar-link band-sidebar-action band-sidebar-profile"
                    onClick={() => {
                        // Collegheremo qui il profilo
                    }}
                >
                    <CircleUserRound size={23} />
                    <span>Profilo</span>
                </button>
            </div>
        </aside>
    );
};

export default BandSidebar;
