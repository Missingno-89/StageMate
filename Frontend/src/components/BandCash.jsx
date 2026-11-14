
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, ArrowUpRight as OpenPage } from "lucide-react";
import "../styles/BandCash.css"

const API_URL = "http://localhost:9097";

export default function BandCash({ bandId }) {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchBalance() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/bands/${bandId}/transactions/balance`,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Errore nel recupero del saldo");
                }

                const data = await response.json();
                setBalance(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        if (bandId) {
            fetchBalance();
        }
    }, [bandId]);

    const formatCurrency = (amount) => {
        return (amount / 100).toLocaleString("it-IT", {
            style: "currency",
            currency: "EUR"
        });
    };

    if (loading) return <p>Caricamento fondo cassa...</p>;
    if (error) return <p>{error}</p>;
    if (!balance) return null;


    return (
        <div className="band-cash">
            <button
                type="button"
                className="band-cash-open"
                onClick={() => navigate(`/bands/${bandId}/cash`)}
                aria-label="Apri fondo cassa"
                title="Apri fondo cassa"
            >
                <ArrowUpRight size={20} />
            </button>

            <div className="band-cash-balance">
                <span>Saldo disponibile</span>
                <h3>{formatCurrency(balance.balance)}</h3>
            </div>

            <div className="band-cash-summary">
                <div className="band-cash-income">
                    <ArrowDownLeft size={18} />
                    <span>Entrate</span>
                    <strong>{formatCurrency(balance.totalIncome)}</strong>
                </div>

                <div className="band-cash-expense">
                    <ArrowUpRight size={18} />
                    <span>Uscite</span>
                    <strong>{formatCurrency(balance.totalExpense)}</strong>
                </div>
            </div>
        </div>
    );

}
