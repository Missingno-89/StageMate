
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form } from "react-bootstrap";

import StageBackground from "../components/StageBackground.jsx";
import StageButton from "../components/StageButton.jsx";
import "../styles/Login.css";

const ResetPassword = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("resetInvalidToken");
            return;
        }

        if (password !== confirmPassword) {
            setError("passwordMismatch");
            return;
        }

        if (password.length < 8) {
            setError("passwordTooShort");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token,
                        newPassword: password
                    })
                }
            );

            if (!response.ok) {
                setError(
                    response.status === 400
                        ? "resetInvalidToken"
                        : "resetPasswordError"
                );
                return;
            }

            setSuccess(true);

        } catch (err) {
            console.error("Errore reset password:", err);
            setError("connectionError");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <StageBackground />

            <div className="login-content">
                <div className="login-header">
                    <h1 className="login-title">
                        <span className="login-brand">StageMate</span>
                    </h1>
                    <p>{t("resetPasswordTitle")}</p>
                </div>

                <div className="login-container">
                    {success ? (
                        <div className="login-form">
                            <div className="registration-success" role="status">
                                <strong>{t("resetPasswordSuccess")}</strong>
                            </div>

                            <Link to="/login" className="forgot-password-back">
                                {t("backToLogin")}
                            </Link>
                        </div>
                    ) : (
                        <Form className="login-form" onSubmit={handleSubmit}>
                            {!token && (
                                <p role="alert" className="register-error">
                                    {t("resetInvalidToken")}
                                </p>
                            )}

                            <div className="login-field">
                                <label htmlFor="new-password" className="login-label">
                                    {t("createPassword")}
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    className="login-input"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="confirm-new-password" className="login-label">
                                    {t("confirmPassword")}
                                </label>
                                <input
                                    id="confirm-new-password"
                                    type="password"
                                    className="login-input"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            {error && (
                                <p role="alert" className="register-error">
                                    {t(error)}
                                </p>
                            )}

                            <StageButton type="submit" disabled={loading || !token}>
                                {loading ? t("resettingPassword") : t("resetPasswordButton")}
                            </StageButton>

                            <Link to="/" className="forgot-password-back">
                                {t("backToLogin")}
                            </Link>
                        </Form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
