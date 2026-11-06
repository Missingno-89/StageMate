import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const exchangeStarted = useRef(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");

        if (!code) {
            console.error("Codice Google mancante");
            navigate("/", { replace: true });
            return;
        }

        if (exchangeStarted.current) return;
        exchangeStarted.current = true;

        const exchangeCode = async () => {
            try {
                const response = await fetch(
                    "http://localhost:9097/auth/google/exchange",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ code })
                    }
                );

                if (!response.ok) {
                    throw new Error("Autenticazione Google non riuscita");
                }

                const data = await response.json();

                if (!data.token) {
                    throw new Error("Token JWT mancante");
                }

                sessionStorage.setItem("token", data.token);

                navigate("/bands", { replace: true });

            } catch (error) {
                console.error("Errore login Google:", error.message);
                navigate("/", { replace: true });
            }
        };

        exchangeCode();

    }, [searchParams, navigate]);
};

export default GoogleCallback;