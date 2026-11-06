import "../styles/Login.css";
import { Form } from "react-bootstrap";
import StageButton from "../components/StageButton.jsx";
import StageBackground from "../components/StageBackground.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";



const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:9097/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();
            if (!response.ok) {
                console.error("Login non riuscito:", response.status);
                return;
            }

            sessionStorage.setItem("token", data.token);
            const userResponse = await fetch("http://localhost:9097/auth/me", {
                headers: {
                    Authorization: `Bearer ${data.token}`
                }
            });

            if (!userResponse.ok) {
                console.error("Impossibile recuperare l'utente");
                return;
            }

            const userData = await userResponse.json();

            console.log("Nome utente:", userData.user.name);
            navigate("/bands", { replace: true });

            console.log("Status:", response.status);
            console.log("Login riuscito:", response.ok);

        } catch (error) {
            console.error("Errore di connessione al server");
        }
    };
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:9097/auth/google";
    };



    return (
        <div className="login-page">
            <StageBackground />
            <div className="login-content">

                <div className="login-header">
                    <h1 className="login-title">
                        Benvenuti su
                        <span>StageMate</span>
                    </h1>
                    <p>La piattaforma per la tua band</p>
                </div>

                <div className="login-container">
                    <Form className="login-form" onSubmit={handleLogin}>
                        <div className="login-field">
                            <label htmlFor="email" className="login-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                className="login-input"
                                placeholder="Inserisci la tua email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password" className="login-label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                className="login-input"
                                placeholder="Inserisci la tua password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <StageButton type="submit">
                            Accedi
                        </StageButton>
                    </Form>
                    <div className="login-alternative">
                        <div className="login-divider">
                            <span>oppure</span>
                        </div>

                        <button
                            type="button"
                            className="google-button"
                            onClick={handleGoogleLogin}
                        >
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt=""
                            />
                            Continua con Google
                        </button>

                        <p className="register-text">
                            Non hai un account? <a href="/register">Registrati</a>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;