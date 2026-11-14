import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BandCover from "../components/BandCover.jsx";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import NextBandEvents from "../components/NextBandEvents.jsx";
import "../styles/BandDashboard.css";
import { Wallet, MessagesSquare } from "lucide-react";
import { CalendarClock } from "lucide-react";

const BandDashboard = () => {
    const { bandId } = useParams();
    const navigate = useNavigate();
    const [band, setBand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const fetchBand = async () => {
            setLoading(true);
            setError("");
            try {
                const token = sessionStorage.getItem("token");
                if (!token) {
                    navigate("/", { replace: true });
                    return;
                }
                const response = await fetch(`http://localhost:9097/bands/${bandId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                });
                if (!response.ok) throw new Error("Impossibile recuperare i dati della band");
                const data = await response.json();
                if (!controller.signal.aborted) setBand(data.band);
            } catch (err) {
                if (err.name !== "AbortError" && !controller.signal.aborted) setError(err.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        fetchBand();
        return () => controller.abort();
    }, [bandId, navigate]);

    if (loading) return <p>Caricamento band...</p>;
    if (error) return <p role="alert">{error}</p>;
    if (!band) return <p>Band non trovata.</p>;

    return (
        <div className="band-dashboard">
            <BandCover band={band} onCoverUpdated={setBand} />
            <div className="band-dashboard-widgets">
                <div className="band-dashboard-calendar">
                    <UpcomingEvents bandId={bandId} />
                </div>
                <div className="band-dashboard-right">
                    <section className="band-dashboard-events dashboard-glass">
                        <div className="band-widget-heading">
                            <CalendarClock size={21} />
                            <h2>Prossimi eventi</h2>
                        </div>

                        <NextBandEvents bandId={bandId} />
                    </section>
                    <section className="band-dashboard-cash dashboard-glass">
                        <div className="band-widget-heading">
                            <Wallet size={21} />
                            <h2>Fondo cassa</h2>
                        </div>

                        <p>Saldo e ultimi movimenti della band.</p>
                    </section>
                </div>
            </div>
            <section className="band-dashboard-board dashboard-glass">
                <div className="band-widget-heading">
                    <MessagesSquare size={21} />
                    <h2>Bacheca</h2>
                </div>

                <p>Comunicazioni e aggiornamenti della band.</p>
            </section>
        </div>
    );
};

export default BandDashboard;
