
import { useState } from "react";
import "../styles/CreateBand.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CreateBand = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateBand = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const token = sessionStorage.getItem("token");

            if (!token) {
                navigate("/");
                return;
            }

            const response = await fetch("http://localhost:9097/bands", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || t("createBandError")
                );
            }

            const bandId = data.newBand._id;

            if (avatarFile) {
                const formData = new FormData();
                formData.append("avatar", avatarFile);

                const avatarResponse = await fetch(
                    `http://localhost:9097/bands/${bandId}/avatar`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
                    }
                );

                if (!avatarResponse.ok) {
                    const avatarData = await avatarResponse.json();

                    throw new Error(
                        avatarData.message || t("avatarUploadError")
                    );
                }
            }

            navigate("/bands");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError(t("invalidBandImage"));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(t("bandImageTooLarge"));
            return;
        }

        setError("");
        setAvatarFile(file);

        const reader = new FileReader();

        reader.onload = () => {
            setAvatarPreview(reader.result);
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="create-band-container">
            <h2>{t("createBandTitle")}</h2>

            <form className="login-form" onSubmit={handleCreateBand}>
                <div className="login-field">
                    <div className="create-band-avatar-section">
                        <label
                            htmlFor="band-avatar"
                            className="create-band-avatar-preview"
                        >
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt={t("bandLogoPreview")}
                                />
                            ) : (
                                <span>♪</span>
                            )}
                        </label>

                        <label
                            htmlFor="band-avatar"
                            className="create-band-avatar-label"
                        >
                            {t("chooseBandLogo")}
                        </label>

                        <input
                            id="band-avatar"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleAvatarChange}
                            className="create-band-avatar-input"
                        />
                    </div>

                    <label className="login-label" htmlFor="band-name">
                        {t("bandName")}
                    </label>

                    <input
                        id="band-name"
                        className="login-input"
                        type="text"
                        placeholder={t("bandNamePlaceholder")}
                        maxLength={255}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="login-field">
                    <label
                        className="login-label"
                        htmlFor="band-description"
                    >
                        {t("bandDescription")}
                    </label>

                    <textarea
                        id="band-description"
                        className="login-input"
                        placeholder={t("bandDescriptionPlaceholder")}
                        maxLength={255}
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {error && (
                    <p className="create-band-error" role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="create-band-submit"
                    disabled={loading}
                >
                    {loading ? t("creatingBand") : t("createBand")}
                </button>
            </form>

            <button
                type="button"
                className="bands-create-link create-band-back"
                onClick={() => navigate("/bands")}
            >
                ← {t("backToBands")}
            </button>
        </div>
    );
};

export default CreateBand;
