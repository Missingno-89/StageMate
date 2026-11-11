
import { useState } from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import StageButton from "./StageButton.jsx";

const RegisterForm = ({ onSuccess }) => {
    const { t } = useTranslation();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

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
                `${import.meta.env.VITE_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        surname,
                        email,
                        password
                    })
                }
            );

            if (!response.ok) {
                if (response.status === 409) {
                    setError("emailAlreadyRegistered");
                } else if (response.status === 400) {
                    setError("invalidRegistration");
                } else {
                    setError("registrationError");
                }
                return;
            }

            onSuccess(email.trim().toLowerCase());

        } catch (err) {
            console.error("Errore registrazione:", err);
            setError("connectionError");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form className="login-form" onSubmit={handleRegister}>
            <div className="login-field">
                <label htmlFor="register-name" className="login-label">
                    {t("name")}
                </label>
                <input
                    id="register-name"
                    type="text"
                    className="login-input"
                    placeholder={t("namePlaceholder")}
                    autoComplete="given-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="login-field">
                <label htmlFor="register-surname" className="login-label">
                    {t("surname")}
                </label>
                <input
                    id="register-surname"
                    type="text"
                    className="login-input"
                    placeholder={t("surnamePlaceholder")}
                    autoComplete="family-name"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                />
            </div>

            <div className="login-field">
                <label htmlFor="register-email" className="login-label">
                    Email
                </label>
                <input
                    id="register-email"
                    type="email"
                    className="login-input"
                    placeholder={t("emailPlaceholder")}
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="login-field">
                <label htmlFor="register-password" className="login-label">
                    Password
                </label>
                <input
                    id="register-password"
                    type="password"
                    className="login-input"
                    placeholder={t("createPassword")}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="login-field">
                <label
                    htmlFor="register-confirm-password"
                    className="login-label"
                >
                    {t("confirmPassword")}
                </label>
                <input
                    id="register-confirm-password"
                    type="password"
                    className="login-input"
                    placeholder={t("confirmPasswordPlaceholder")}
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

            <StageButton type="submit" disabled={loading}>
                {loading ? t("registering") : t("registerButton")}
            </StageButton>
        </Form>
    );
};

export default RegisterForm;
