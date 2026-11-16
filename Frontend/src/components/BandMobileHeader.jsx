import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    Menu,
    X,
    Bell,
    CircleUserRound,
    ArrowLeft
} from "lucide-react";

import { useUnreadNotifications } from "../hooks/useUnreadNotifications";

import "../styles/BandMobileHeader.css";

const BandMobileHeader = () => {
    const { bandId } = useParams();

    const [menuOpen, setMenuOpen] = useState(false);

    const unreadCount = useUnreadNotifications(bandId);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="band-mobile-header">

            <div className="band-mobile-brand">
                <img
                    src="/images/logo-stage.png"
                    alt=""
                />
                <span>StageMate</span>
            </div>

            <div className="band-mobile-menu-container">

                <button
                    type="button"
                    className="band-mobile-menu-button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={
                        menuOpen ? "Chiudi menu" : "Apri menu"
                    }
                    aria-expanded={menuOpen}
                    aria-controls="band-mobile-dropdown"
                >
                    {menuOpen ? (
                        <X size={24} />
                    ) : (
                        <Menu size={24} />
                    )}

                    {!menuOpen && unreadCount > 0 && (
                        <span
                            className="band-mobile-menu-dot"
                            aria-hidden="true"
                        />
                    )}
                </button>

                {menuOpen && (
                    <div
                        id="band-mobile-dropdown"
                        className="band-mobile-dropdown"
                    >

                        <Link
                            to={`/bands/${bandId}/notifications`}
                            className="band-mobile-dropdown-item"
                            onClick={closeMenu}
                        >
                            <Bell size={19} />
                            <span>Notifiche</span>

                            {unreadCount > 0 && (
                                <span
                                    className="band-mobile-notification-dot"
                                    aria-label={`${unreadCount} notifiche non lette`}
                                />
                            )}
                        </Link>

                        <button
                            type="button"
                            className="band-mobile-dropdown-item"
                            onClick={closeMenu}
                        >
                            <CircleUserRound size={20} />
                            <span>Profilo</span>
                        </button>

                        <div className="band-mobile-dropdown-divider" />

                        <Link
                            to="/bands"
                            className="band-mobile-dropdown-item band-mobile-back"
                            onClick={closeMenu}
                        >
                            <ArrowLeft size={19} />
                            <span>Le mie band</span>
                        </Link>

                    </div>
                )}

            </div>

        </header>
    );
};

export default BandMobileHeader;
