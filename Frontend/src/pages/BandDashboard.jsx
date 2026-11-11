
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BandCover from "../components/BandCover.jsx";

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

                const response = await fetch(
                    `http://localhost:9097/bands/${bandId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Impossibile recuperare i dati della band"
                    );
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setBand(data.band);
                }

            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchBand();

        return () => controller.abort();
    }, [bandId, navigate]);

    if (loading) {
        return <p>Caricamento band...</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    if (!band) {
        return <p>Band non trovata.</p>;
    }

  return (
    <div className="band-dashboard">
        <BandCover band={band}
           onCoverUpdated={setBand}
        />
    </div>
);
};

export default BandDashboard;
