
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem("token");

        // Se non esiste un token, l'utente non è autenticato
        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        // Verifica il token attraverso il backend
        const checkAuth = async () => {
            try {
                const response = await fetch(
                    "http://localhost:9097/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);

                    // Eliminiamo il token se non è valido
                    if (response.status === 401) {
                        sessionStorage.removeItem("token");
                    }
                }

            } catch (error) {
                console.error(
                    "Errore verifica autenticazione:",
                    error.message
                );

                setIsAuthenticated(false);

            } finally {
                setLoading(false);
            }
        };

        checkAuth();

    }, []);

    // Durante la verifica mostriamo un caricamento
    if (loading) {
        return (
            <div className="auth-loading">
                <p>Verifica della sessione in corso...</p>
            </div>
        );
    }

    // Se il token non è valido, torniamo al login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Se il token è valido, mostriamo la pagina protetta
    return <Outlet />;
};

export default ProtectedRoute;
