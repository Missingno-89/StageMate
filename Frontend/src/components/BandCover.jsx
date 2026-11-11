
import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import "../styles/BandCover.css";

const BandCover = ({ band, onCoverUpdated }) => {
    const fileInputRef = useRef(null);

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleCoverChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Formato non supportato. Usa JPG, PNG o WebP.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("L'immagine non può superare 5 MB.");
            event.target.value = "";
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("cover", file);

            const token = sessionStorage.getItem("token");

            const response = await fetch(
                `http://localhost:9097/bands/${band._id}/cover`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Errore nel caricamento"
                );
            }

            onCoverUpdated(data.band);

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    return (
        <div
            className="band-cover"
            style={
                band.cover
                    ? {
                        backgroundImage: `linear-gradient(
                            to top,
                            rgba(0, 0, 0, 0.85),
                            rgba(0, 0, 0, 0.05)
                        ), url("${band.cover}")`
                    }
                    : {}
            }
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverChange}
                hidden
            />

            <h1 className="band-cover-name">
                {band.name}
            </h1>

            <button
                type="button"
                className="band-cover-edit"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Cambia copertina"
                title="Cambia copertina"
            >
                <Camera size={20} />

                <span>
                    {uploading
                        ? "Caricamento..."
                        : "Modifica copertina"}
                </span>
            </button>

            {error && (
                <p role="alert" className="band-cover-error">
                    {error}
                </p>
            )}
        </div>
    );
};

export default BandCover;
