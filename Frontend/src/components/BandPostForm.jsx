
import { useEffect, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";

const API_URL = "http://localhost:9097";

const BandPostForm = ({ bandId, onPostCreated }) => {
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!image) {
            setPreview("");
            return;
        }

        const url = URL.createObjectURL(image);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [image]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!content.trim() && !image) return;

        setPublishing(true);
        setError("");

        try {
            const token = sessionStorage.getItem("token");

            const formData = new FormData();
            formData.append("content", content.trim());

            if (image) {
                formData.append("image", image);
            }

            const response = await fetch(
                `${API_URL}/bands/${bandId}/posts`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Errore nella pubblicazione");
            }

            setContent("");
            setImage(null);

            onPostCreated?.(data.post);

            window.dispatchEvent(
                new Event("notifications-updated")
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <form className="band-post-form" onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Scrivi qualcosa per la tua band..."
                maxLength={5000}
                disabled={publishing}
                rows={3}
            />

            {preview && (
                <div className="band-post-preview">
                    <img src={preview} alt="Anteprima fotografia" />

                    <button
                        type="button"
                        onClick={() => setImage(null)}
                        disabled={publishing}
                        aria-label="Rimuovi fotografia"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {error && <p role="alert">{error}</p>}

            <div className="band-post-form-actions">
                <label className="band-post-image-button">
                    <ImagePlus size={19} />
                    Aggiungi foto

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        disabled={publishing}
                        onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (!file) return;

                            if (file.size > 5 * 1024 * 1024) {
                                setError("La foto non può superare 5 MB");
                                event.target.value = "";
                                return;
                            }

                            setError("");
                            setImage(file);
                            event.target.value = "";
                        }}
                    />
                </label>

                <button
                    type="submit"
                    disabled={publishing || (!content.trim() && !image)}
                >
                    <Send size={17} />
                    {publishing ? "Pubblicazione..." : "Pubblica"}
                </button>
            </div>
        </form>
    );
};

export default BandPostForm;
