
import { NavLink, useParams } from "react-router-dom";

import {
    LayoutDashboard,
    CalendarDays,
    Wallet,
    Users,
    FolderOpen
} from "lucide-react";

import "../styles/BandMobileNav.css";

const BandMobileNav = () => {
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
        <nav
            className="band-mobile-nav"
            aria-label="Navigazione della band"
        >
            {menuItems.map(({ label, icon: Icon, path }) => (
                <NavLink
                    key={path}
                    to={path}
                    end
                    aria-label={label}
                    title={label}
                    className={({ isActive }) =>
                        `band-mobile-nav-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <Icon
                        size={23}
                        strokeWidth={1.9}
                        aria-hidden="true"
                    />
                    <span className="band-mobile-nav-label">
                        {label}
                    </span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BandMobileNav;
