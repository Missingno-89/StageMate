import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    Menu,
    X,
    Bell,
    CircleUserRound,
    LogOut,
    ArrowLeft
} from "lucide-react";

import { useUnreadNotifications } from "../hooks/useUnreadNotifications";

import "../styles/BandMobileHeader.css";

const API_URL = import.meta.env.VITE_API_URL;

const BandMobileHeader = () => {
    const { bandId } = useParams();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    const [menuOpen, setMenuOpen] = useState(false);

    const unreadCount = useUnreadNotifications(bandId);

    const closeMenu = () => setMenuOpen(false);

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

    const fullName = [currentUser?.name, currentUser?.surname]
        .filter(Boolean)
        .join(" ") || "Utente connesso";

    const handleLogout = () => {
        closeMenu();
        sessionStorage.removeItem("token");
        navigate("/", { replace: true });
    };

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

                        <div className="band-mobile-account" aria-label={`Account: ${fullName}`}>
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt="" className="band-mobile-account-avatar" />
                            ) : (
                                <span className="band-mobile-account-avatar band-mobile-account-fallback">
                                    <CircleUserRound size={23} />
                                </span>
                            )}
                            <span className="band-mobile-account-info">
                                <span className="band-mobile-account-name" title={fullName}>{fullName}</span>
                                <span className="band-mobile-account-caption">Account connesso</span>
                            </span>
                        </div>

                        <button
                            type="button"
                            className="band-mobile-dropdown-item band-mobile-logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={19} />
                            <span>Logout</span>
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
