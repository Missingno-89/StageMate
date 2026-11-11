
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import StageBackground from "../components/StageBackground.jsx";
import "../styles/Login.css";

const VerifyEmail = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState("loading");
    const requestStarted = useRef(false);

    useEffect(() => {
        if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
            setStatus("error");
            return;
        }

        
        if (requestStarted.current) return;
        requestStarted.current = true;

        const verify = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/verify-email`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ token })
                    }
                );

                setStatus(response.ok ? "success" : "error");
            } catch (error) {
                console.error("Errore verifica email:", error);
                setStatus("error");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="login-page">
            <StageBackground />

            <div className="login-content">
                <div className="login-header">
                    <h1 className="login-title">
                        <span className="login-brand">StageMate</span>
                    </h1>
                    <p>{t("verifyEmailTitle")}</p>
                </div>

                <div className="login-container">
                    <div
                        className="login-form"
                        style={{ textAlign: "center" }}
                    >
                        {status === "loading" && (
                            <p role="status">
                                {t("verifyingEmail")}
                            </p>
                        )}

                        {status === "success" && (
                            <>
                                <div
                                    className="registration-success"
                                    role="status"
                                >
                                    <strong>
                                        {t("verifyEmailSuccess")}
                                    </strong>
                                    <p>
                                        {t("verifyEmailSuccessMessage")}
                                    </p>
                                </div>

                                <Link
                                    to="/"
                                    className="forgot-password-back"
                                >
                                    {t("backToLogin")}
                                </Link>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <p
                                    role="alert"
                                    className="register-error"
                                >
                                    {t("verifyEmailError")}
                                </p>

                                <Link
                                    to="/"
                                    className="forgot-password-back"
                                >
                                    {t("backToLogin")}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
