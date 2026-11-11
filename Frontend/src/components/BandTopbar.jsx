import { Bell, CircleUserRound } from "lucide-react";
import "../styles/BandTopbar.css";

const BandTopbar = () => {
    return (
        <header className="band-topbar">
            <div className="band-topbar-title">
                <span className="band-topbar-label">StageMate</span>
                <h1>Dashboard</h1>
            </div>

            <div className="band-topbar-actions">
                <span className="band-topbar-icon" title="Notifiche">
                    <Bell size={21} />
                </span>

                <span className="band-topbar-icon" title="Profilo">
                    <CircleUserRound size={23} />
                </span>
            </div>
        </header>
    );
};

export default BandTopbar;