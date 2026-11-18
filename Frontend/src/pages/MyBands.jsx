import "../styles/Login.css";
import "../styles/MyBands.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PendingInvitations from "../components/PendingInvitations.jsx";
import { Ellipsis, ImagePlus, Upload, X } from "lucide-react";

const MyBands = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [bands, setBands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [menuBandId, setMenuBandId] = useState(null);
    const [editingBandId, setEditingBandId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchBands = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:9097/bands/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error("Impossibile recuperare le band");
                }

                const data = await response.json();
                setBands(data.bands);
                const meResponse = await fetch("http://localhost:9097/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                });
                if (meResponse.ok) {
                    const meData = await meResponse.json();
                    if (!controller.signal.aborted) setCurrentUserId(meData.user?._id || null);
                }

            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Errore:", error.message);
                    setError(error.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchBands();

        return () => controller.abort();
    }, []);
    const refreshBands = async () => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(
                "http://localhost:9097/bands/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Impossibile aggiornare le band");
            }

            const data = await response.json();
            setBands(data.bands);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    };

    const saveAvatar = async (event) => {
        event.preventDefault();
        if (!editingBandId || !selectedImage || savingAvatar) return;
        setSavingAvatar(true);
        setAvatarError("");
        try {
            const formData = new FormData();
            formData.append("avatar", selectedImage);
            const response = await fetch(`http://localhost:9097/bands/${editingBandId}/avatar`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
                body: formData
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || "Impossibile aggiornare l'avatar");
            setBands(previous => previous.map(band =>
                band._id === editingBandId ? { ...band, avatar: data.band?.avatar || band.avatar } : band
            ));
            setEditingBandId(null);
            setSelectedImage(null);
        } catch (err) {
            setAvatarError(err.message);
        } finally {
            setSavingAvatar(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        navigate("/", { replace: true });
    };


    return (
        <>
        <PendingInvitations onInvitationAccepted={refreshBands} />
            <p className="bands-subtitle">
                {t("selectBand")}
            </p>

            {loading && <p>{t("loadingBands")}</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && !error && (
                <>
                    {bands.length === 0 && (
                        <p className="bands-empty-message">
                            {t("noBands")}
                        </p>
                    )}

                    <div className="bands-grid">
                        {bands.map((band) => {
                            const isOwner = currentUserId && String(band.owner?._id || band.owner) === String(currentUserId);
                            return (
                                <div className="band-card" key={band._id}>
                                    {isOwner && (
                                        <div className="band-card-options">
                                            <button type="button" className="band-card-menu-trigger"
                                                aria-label={`Opzioni ${band.name}`} aria-expanded={menuBandId === band._id}
                                                onClick={() => setMenuBandId(previous => previous === band._id ? null : band._id)}>
                                                <Ellipsis size={22} />
                                            </button>
                                            {menuBandId === band._id && (
                                                <div className="band-card-menu">
                                                    <button type="button" onClick={() => {
                                                        setEditingBandId(band._id);
                                                        setSelectedImage(null);
                                                        setAvatarError("");
                                                        setMenuBandId(null);
                                                    }}>
                                                        <ImagePlus size={16} /> Modifica avatar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button type="button" className="band-card-open"
                                        onClick={() => navigate(`/bands/${band._id}/dashboard`)}>
                                        <div className="band-avatar">
                                            {band.avatar ? <img src={band.avatar} alt={band.name} /> : <span>♪</span>}
                                        </div>
                                        <h2>{band.name}</h2>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {editingBandId && (
                <div className="band-avatar-modal-backdrop" onClick={() => !savingAvatar && setEditingBandId(null)}>
                    <form className="band-avatar-modal" onClick={event => event.stopPropagation()} onSubmit={saveAvatar}>
                        <div className="band-avatar-modal-heading">
                            <h2>Modifica avatar della band</h2>
                            <button type="button" aria-label="Chiudi" disabled={savingAvatar}
                                onClick={() => setEditingBandId(null)}><X size={20} /></button>
                        </div>
                        <p className="band-avatar-upload-label">Seleziona una nuova immagine</p>
                        <div className="band-avatar-upload-row">
                            <label htmlFor="band-new-avatar" className={`band-avatar-upload-button${savingAvatar ? " is-disabled" : ""}`}>
                                <Upload size={18} aria-hidden="true" />
                                Carica immagine
                            </label>
                            <span className="band-avatar-file-name">
                                {selectedImage ? selectedImage.name : "Nessuna immagine selezionata"}
                            </span>
                        </div>
                        <input id="band-new-avatar" className="band-avatar-file-input"
                            type="file" accept="image/png,image/jpeg,image/webp"
                            required disabled={savingAvatar} onChange={event => {
                                setSelectedImage(event.target.files?.[0] || null);
                                setAvatarError("");
                            }} />
                        {avatarError && <p className="band-avatar-error" role="alert">{avatarError}</p>}
                        <div className="band-avatar-modal-actions">
                            <button type="button" disabled={savingAvatar} onClick={() => setEditingBandId(null)}>Annulla</button>
                            <button type="submit" disabled={!selectedImage || savingAvatar}>
                                {savingAvatar ? "Salvataggio..." : "Salva avatar"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bands-create-section">
                <p>
                    {t("createBandQuestion")}{" "}
                    <button
                        type="button"
                        className="bands-create-link"
                        onClick={() => navigate("/bands/new")}
                    >
                        {t("createBand")}
                    </button>
                </p>
            </div>

            <button
                type="button"
                className="bands-logout"
                onClick={handleLogout}
            >
                <span className="logout-icon">↪</span>
                {t("logout")}
            </button>
        </>
    );

};

export default MyBands;
