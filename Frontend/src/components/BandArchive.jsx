
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    FolderOpen,
    Upload,
    Download,
    Trash2,
    FileAudio,
    FileText,
    Image as ImageIcon
} from "lucide-react";

import "../styles/BandArchive.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9097";

export default function BandArchive() {
    const { bandId } = useParams();

   
    const [files, setFiles] = useState([]);
    const [userId, setUserId] = useState(null);
    const [ownerId, setOwnerId] = useState(null);

    const [chosen, setChosen] = useState(null);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmId, setConfirmId] = useState(null);


    const headers = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`
    });

  
    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const [filesResponse, userResponse, bandResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/bands/${bandId}/files`, {
                            headers: headers()
                        }),
                        fetch(`${API_URL}/auth/me`, {
                            headers: headers()
                        }),
                        fetch(`${API_URL}/bands/${bandId}`, {
                            headers: headers()
                        })
                    ]);

                if (
                    !filesResponse.ok ||
                    !userResponse.ok ||
                    !bandResponse.ok
                ) {
                    throw new Error("Impossibile caricare l'archivio");
                }

                const [filesData, userData, bandData] =
                    await Promise.all([
                        filesResponse.json(),
                        userResponse.json(),
                        bandResponse.json()
                    ]);

                if (active) {
                    setFiles(filesData.files || []);
                    setUserId(userData.user?._id);

                    setOwnerId(
                        bandData.band?.owner?._id ||
                        bandData.band?.owner
                    );
                }

            } catch (err) {
                if (active) {
                    setError(err.message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            active = false;
        };
    }, [bandId]);

   
    async function send(event) {
        event.preventDefault();

        const form = event.currentTarget;

        if (!chosen || busy) return;

        setBusy(true);
        setError("");

        try {
            const body = new FormData();
            body.append("file", chosen);

            const response = await fetch(
                `${API_URL}/bands/${bandId}/files`,
                {
                    method: "POST",
                    headers: headers(),
                    body
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Caricamento fallito"
                );
            }

            setFiles(oldFiles => [
                data.file,
                ...oldFiles
            ]);

            setChosen(null);
            form.reset();

        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

   
    async function remove(id) {
        setBusy(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/bands/${bandId}/files/${id}`,
                {
                    method: "DELETE",
                    headers: headers()
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Eliminazione fallita"
                );
            }

            setFiles(oldFiles =>
                oldFiles.filter(file => file._id !== id)
            );

            setConfirmId(null);

        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

   
    return (
        <div className="band-archive">

            {/* INTESTAZIONE */}
            <header className="band-archive-heading">
                <FolderOpen size={32} />

                <div>
                    <h1>Archivio file</h1>
                    <p>
                        Condividi documenti, immagini e tracce audio
                        con la band.
                    </p>
                </div>
            </header>

            {/* CARICAMENTO FILE */}
            <section className="band-archive-panel">
                <h2>Carica un file</h2>

                <form
                    className="band-archive-upload"
                    onSubmit={send}
                >
                    <label className="band-archive-picker">
                        <Upload size={18} />

                        {chosen ? "Cambia file" : "Seleziona file"}

                        <input
                            type="file"
                            accept=".mp3,.wav,.pdf,.jpg,.jpeg,.png"
                            onChange={event =>
                                setChosen(
                                    event.target.files?.[0] || null
                                )
                            }
                            disabled={busy}
                        />
                    </label>

                    <span className="band-archive-filename">
                        {chosen
                            ? `${chosen.name} · ${(chosen.size / 1024 / 1024).toFixed(1)} MB`
                            : "MP3, WAV, PDF, JPG, PNG · massimo 20 MB"
                        }
                    </span>

                    <button
                        className="band-archive-primary"
                        disabled={!chosen || busy}
                    >
                        {busy ? "Attendi..." : "Carica"}
                    </button>
                </form>
            </section>

            {/* ELENCO FILE CONDIVISI */}
            <section className="band-archive-panel">
                <h2>File condivisi ({files.length})</h2>

                {error && (
                    <p
                        className="band-archive-error"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {loading ? (
                    <p>Caricamento...</p>

                ) : files.length === 0 ? (
                    <p className="band-archive-muted">
                        Non ci sono ancora file nell'archivio.
                    </p>

                ) : (
                    <div className="band-archive-list">
                        {files.map(file => {

                            // DATI AUTORE
                            const author = file.uploadedBy;
                            const authorId = author?._id || author;

                            // PERMESSI DI ELIMINAZIONE
                            const canDelete =
                                String(authorId) === String(userId) ||
                                String(ownerId) === String(userId);

                            // ICONA IN BASE AL TIPO DI FILE
                            const Icon = file.mimeType.startsWith("audio/")
                                ? FileAudio
                                : file.mimeType.startsWith("image/")
                                    ? ImageIcon
                                    : FileText;

                            return (
                                <div
                                    className="band-archive-item"
                                    key={file._id}
                                >
                                    <Icon
                                        size={25}
                                        className="band-archive-icon"
                                    />

                                    {/* INFORMAZIONI FILE */}
                                    <div className="band-archive-info">
                                        <strong title={file.name}>
                                            {file.name}
                                        </strong>

                                        <small>
                                            {(file.size / 1024 / 1024).toFixed(1)} MB
                                            {" · "}
                                            {author?.name || "Membro"}
                                            {" "}
                                            {author?.surname || ""}
                                            {" · "}
                                            {new Date(file.created_at)
                                                .toLocaleDateString("it-IT")}
                                        </small>
                                    </div>

                                    {/* APERTURA FILE */}
                                    <a
                                        className="band-archive-action"
                                        href={file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`Apri ${file.name}`}
                                    >
                                        <Download size={18} />
                                        <span>Apri</span>
                                    </a>

                                    {/* PULSANTE ELIMINA */}
                                    {canDelete && (
                                        <button
                                            className="band-archive-danger"
                                            onClick={() =>
                                                setConfirmId(file._id)
                                            }
                                            disabled={busy}
                                            aria-label={`Elimina ${file.name}`}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}

                                    {/* CONFERMA ELIMINAZIONE */}
                                    {confirmId === file._id && (
                                        <div className="band-archive-confirm">
                                            <span>
                                                Eliminare definitivamente
                                                questo file?
                                            </span>

                                            <button
                                                onClick={() =>
                                                    setConfirmId(null)
                                                }
                                                disabled={busy}
                                            >
                                                Annulla
                                            </button>

                                            <button
                                                className="band-archive-danger"
                                                onClick={() =>
                                                    remove(file._id)
                                                }
                                                disabled={busy}
                                            >
                                                Elimina
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
