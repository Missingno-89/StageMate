import { useState } from "react";
import "../styles/CreateBand.css"
import { useNavigate } from "react-router-dom";

const CreateBand = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
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
                throw new Error(data.message || "Errore nella creazione della band");
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
                        avatarData.message || "Errore nel caricamento dell'avatar"
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
            setError("Seleziona un'immagine JPG, PNG o WebP");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("L'immagine non può superare 5 MB");
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
            <h2>Crea una nuova band</h2>

            <form className="login-form" onSubmit={handleCreateBand}>
                <div className="login-field">
                    <div className="create-band-avatar-section">
                        <label htmlFor="band-avatar" className="create-band-avatar-preview">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Anteprima logo band" />
                            ) : (
                                <span>♪</span>
                            )}
                        </label>
                        <label htmlFor="band-avatar" className="create-band-avatar-label">
                            Scegli il logo della band
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
                        Nome della band
                    </label>

                    <input
                        id="band-name"
                        className="login-input"
                        type="text"
                        placeholder="Es. VEMORA"
                        maxLength={255}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="login-field">
                    <label className="login-label" htmlFor="band-description">
                        Descrizione
                    </label>

                    <textarea
                        id="band-description"
                        className="login-input"
                        placeholder="Raccontaci qualcosa sulla tua band..."
                        maxLength={255}
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                {error && <p className="create-band-error" role="alert">{error}</p>}
                <button
                    type="submit"
                    className="create-band-submit"
                    disabled={loading}
                >
                    {loading ? "Creazione in corso..." : "Crea band"}
                </button>
            </form>
            <button
                type="button"
                className="bands-create-link create-band-back"
                onClick={() => navigate("/bands")}
            >
                ← Torna alle mie band
            </button>
        </div>
    );
};

export default CreateBand;