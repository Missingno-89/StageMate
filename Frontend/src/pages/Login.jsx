
import "../styles/Login.css";
import { Form } from "react-bootstrap";
import StageButton from "../components/StageButton.jsx";
import StageBackground from "../components/StageBackground.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import { useTranslation } from "react-i18next";
import ForgotPasswordForm from "../components/ForgotPasswordForm.jsx";
import CheckEmailForm from "../components/CheckEmailForm.jsx";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    const [registeredEmail, setRegisteredEmail] = useState("");
    const [loginError, setLoginError] = useState("");

    const navigate = useNavigate();
    const { t } = useTranslation();

    // ==========================================
    // LOGIN TRADIZIONALE
    // ==========================================

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (
                    response.status === 403 &&
                    data.code === "EMAIL_NOT_VERIFIED"
                ) {
                    setRegisteredEmail(email.trim().toLowerCase());
                    setIsCheckingEmail(true);
                    setLoginError("");
                    return;
                }
                if (
                    response.status === 400 ||
                    response.status === 401
                ) {
                    setLoginError("invalidCredentials");
                } else {
                    setLoginError("loginFailed");
                }
                return;
            }

            sessionStorage.setItem("token", data.token);

            const userResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/me`,
                {
                    headers: {
                        Authorization: `Bearer ${data.token}`
                    }
                }
            );

            if (!userResponse.ok) {
                setLoginError("userFetchError");
                sessionStorage.removeItem("token");
                return;
            }

            const userData = await userResponse.json();

            console.log("Nome utente:", userData.user.name);

            navigate("/bands", { replace: true });

        } catch (error) {
            console.error("Errore durante il login:", error);

            setLoginError("connectionError");
            sessionStorage.removeItem("token");
        }
    };

    // ==========================================
    // LOGIN GOOGLE
    // ==========================================

    const handleGoogleLogin = () => {
        window.location.href =
            `${import.meta.env.VITE_API_URL}/auth/google`;
    };

    // ==========================================
    // REGISTRAZIONE COMPLETATA
    // ==========================================

    const handleRegistrationSuccess = (email) => {
        setRegisteredEmail(email);
        setIsRegistering(false);
        setIsForgotPassword(false);
        setIsCheckingEmail(true);
        setLoginError("");
    };

    // ==========================================
    // RITORNO AL LOGIN
    // ==========================================

    const handleBackToLogin = () => {
        setIsRegistering(false);
        setIsForgotPassword(false);
        setIsCheckingEmail(false);
        setLoginError("");
    };

    return (
        <div className="login-page">
            <StageBackground />

            <div className="login-language">
                <LanguageSwitcher />
            </div>

            <div className="login-content">

                {/* HEADER */}


                <div className="login-header">

                    <img
                        src="/images/logo-stage.png"
                        alt=""
                        className="login-logo-icon"
                    />


                    <h1 className="login-title">
                        <span className="login-brand">
                            StageMate
                        </span>
                    </h1>

                    <p>{t("loginSubtitle")}</p>
                </div>


                <div className="login-container">

                    {/* SCHERMATA VERIFICA EMAIL */}

                    {isCheckingEmail ? (
                        <CheckEmailForm
                            email={registeredEmail}
                            onBack={handleBackToLogin}
                        />

                        /* RECUPERO PASSWORD */

                    ) : isForgotPassword ? (
                        <ForgotPasswordForm
                            onBack={handleBackToLogin}
                        />

                        /* REGISTRAZIONE */

                    ) : isRegistering ? (
                        <RegisterForm
                            onSuccess={handleRegistrationSuccess}
                        />

                        /* LOGIN */

                    ) : (
                        <Form
                            className="login-form"
                            onSubmit={handleLogin}
                        >
                            {loginError && (
                                <p
                                    role="alert"
                                    className="register-error"
                                >
                                    {t(loginError)}
                                </p>
                            )}

                            <div className="login-field">
                                <label
                                    htmlFor="email"
                                    className="login-label"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className="login-input"
                                    placeholder={t("emailPlaceholder")}
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                />
                            </div>

                            <div className="login-field">
                                <label
                                    htmlFor="password"
                                    className="login-label"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="login-input"
                                    placeholder={t("passwordPlaceholder")}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>

                            <div className="forgot-password-container">
                                <button
                                    type="button"
                                    className="forgot-password-link"
                                    onClick={() => {
                                        setIsForgotPassword(true);
                                        setLoginError("");
                                    }}
                                >
                                    {t("forgotPassword")}
                                </button>
                            </div>

                            <StageButton type="submit">
                                {t("loginButton")}
                            </StageButton>
                        </Form>
                    )}

                    {/* ACCESSO GOOGLE E REGISTRAZIONE */}

                    {!isForgotPassword && !isCheckingEmail && (
                        <div className="login-alternative">

                            <div className="login-divider">
                                <span>{t("or")}</span>
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
                                {t("googleLogin")}
                            </button>

                            <p className="register-text">
                                {isRegistering
                                    ? t("alreadyAccount")
                                    : t("noAccount")}{" "}

                                <button
                                    type="button"
                                    className="register-link"
                                    onClick={() => {
                                        setIsRegistering(!isRegistering);
                                        setLoginError("");
                                    }}
                                >
                                    {isRegistering
                                        ? t("loginButton")
                                        : t("registerButton")}
                                </button>
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Login;
