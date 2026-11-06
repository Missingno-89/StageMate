
import "../styles/Login.css";
import "../styles/MyBands.css";
import StageBackground from "../components/StageBackground.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const MyBands = () => {
    const navigate = useNavigate();

    const [bands, setBands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchBands = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch(
                    "http://localhost:9097/bands/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );
                if (!response.ok) {
                    throw new Error("Impossibile recuperare le band");
                }
                const data = await response.json();
                setBands(data.bands);

            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Errore:", error.message);
                    setError(error.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }
        fetchBands();

        return () => controller.abort();
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        navigate("/", { replace: true });
    };

    return (
    <>
        <p className="bands-subtitle">Seleziona la tua band</p>

        {loading && <p>Caricamento delle tue band...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && (
            <>
                {bands.length === 0 && (
                    <p>Non fai ancora parte di nessuna band.</p>
                )}

                <div className="bands-grid">
                    {bands.map((band) => (
                        <button
                            key={band._id}
                            type="button"
                            className="band-card"
                            onClick={() => {
                                console.log("Band selezionata:", band._id);
                            }}
                        >
                            <div className="band-avatar">
                                {band.avatar ? (
                                    <img src={band.avatar} alt={band.name} />
                                ) : (
                                    <span>♪</span>
                                )}
                            </div>

                            <h2>{band.name}</h2>
                        </button>
                    ))}
                </div>
            </>
        )}

        <div className="bands-create-section">
            <p>
                Vuoi creare un nuovo progetto?{" "}
                <button
                    type="button"
                    className="bands-create-link"
                    onClick={() => navigate("/bands/new")}
                >
                    Crea una nuova band
                </button>
            </p>
        </div>

        <button
            type="button"
            className="bands-logout"
            onClick={handleLogout}
        >
            <span className="logout-icon">↪</span>
            Esci
        </button>
    </>
);
};


export default MyBands;
