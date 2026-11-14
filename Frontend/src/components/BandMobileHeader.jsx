
import { useState } from "react";
import { Link } from "react-router-dom";

import {
    Menu,
    X,
    Bell,
    CircleUserRound,
    ArrowLeft
} from "lucide-react";

import "../styles/BandMobileHeader.css";

const BandMobileHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);

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
                </button>

                {menuOpen && (
                    <div
                        id="band-mobile-dropdown"
                        className="band-mobile-dropdown"
                    >

                        <button
                            type="button"
                            className="band-mobile-dropdown-item"
                            onClick={closeMenu}
                        >
                            <Bell size={19} />
                            <span>Notifiche</span>
                        </button>

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
