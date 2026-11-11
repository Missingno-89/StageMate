
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CheckEmailForm = ({ email, onBack }) => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleResend = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/resend-verification`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                }
            );

            if (!response.ok) {
                setError("resendVerificationError");
                return;
            }

            setMessage("resendVerificationSuccess");
        } catch (err) {
            console.error("Errore reinvio verifica:", err);
            setError("connectionError");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form check-email-form">
            <div className="check-email-icon">
                <span aria-hidden="true">✉</span>
            </div>

            <h2>{t("checkEmailTitle")}</h2>

            <p>{t("checkEmailDescription")}</p>

            <p className="check-email-address">{email}</p>

            <p>{t("checkEmailInstructions")}</p>

            {message && (
                <p className="registration-success" role="status">
                    {t(message)}
                </p>
            )}

            {error && (
                <p className="register-error" role="alert">
                    {t(error)}
                </p>
            )}

            <button
                type="button"
                className="check-email-resend"
                onClick={handleResend}
                disabled={loading || !email}
            >
                {loading
                    ? t("sendingEmail")
                    : t("resendVerificationButton")}
            </button>

            <button
                type="button"
                className="forgot-password-back"
                onClick={onBack}
            >
                {t("backToLogin")}
            </button>
        </div>
    );
};

export default CheckEmailForm;
