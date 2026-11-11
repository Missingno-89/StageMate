
import { useState } from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import StageButton from "./StageButton.jsx";

const ForgotPasswordForm = ({ onBack }) => {
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                }
            );

            if (!response.ok) {
                setError("forgotPasswordError");
                return;
            }

            setSuccess(true);

        } catch (err) {
            console.error("Errore recupero password:", err);
            setError("connectionError");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form className="login-form" onSubmit={handleSubmit}>
            {success ? (
                <div className="registration-success" role="status">
                    <strong>{t("forgotPasswordSuccessTitle")}</strong>
                    <p>{t("forgotPasswordSuccessMessage")}</p>
                </div>
            ) : (
                <>
                    <p className="forgot-password-description">
                        {t("forgotPasswordDescription")}
                    </p>

                    <div className="login-field">
                        <label
                            htmlFor="forgot-email"
                            className="login-label"
                        >
                            Email
                        </label>

                        <input
                            id="forgot-email"
                            type="email"
                            className="login-input"
                            placeholder={t("emailPlaceholder")}
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p role="alert" className="register-error">
                            {t(error)}
                        </p>
                    )}

                    <StageButton type="submit" disabled={loading}>
                        {loading
                            ? t("sendingEmail")
                            : t("sendResetLink")}
                    </StageButton>
                </>
            )}

            <button
                type="button"
                className="forgot-password-back"
                onClick={onBack}
            >
                {t("backToLogin")}
            </button>
        </Form>
    );
};

export default ForgotPasswordForm;
