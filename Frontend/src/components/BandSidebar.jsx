import { NavLink, useParams } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    Wallet,
    Users,
    FolderOpen,
    ArrowLeft
} from "lucide-react";
import "../styles/BandSidebar.css";

const BandSidebar = () => {
    const { bandId } = useParams();

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

            <NavLink to="/bands" className="band-sidebar-back">
                <ArrowLeft size={18} />
                <span>Le mie band</span>
            </NavLink>
        </aside>
    );
};

export default BandSidebar;