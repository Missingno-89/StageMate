import { useEffect, useState } from "react";
import { MessageCircle, Send, Trash2, UserRound } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9097";

export default function BandPostComments({ bandId, postId, currentUserId, ownerId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const endpoint = `${API_URL}/bands/${bandId}/posts/${postId}/comments`;
    const authHeaders = () => ({ Authorization: `Bearer ${sessionStorage.getItem("token")}` });

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        fetch(endpoint, { headers: authHeaders(), signal: controller.signal })
            .then(async response => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.message || "Impossibile caricare i commenti");
                if (!controller.signal.aborted) setComments(data.comments || []);
            })
            .catch(err => { if (err.name !== "AbortError") setError(err.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [endpoint]);

    const submitComment = async event => {
        event.preventDefault();
        const value = content.trim();
        if (!value || sending) return;
        setSending(true);
        setError("");
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ content: value })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || "Impossibile pubblicare il commento");
            setComments(previous => [...previous, data.comment]);
            setContent("");
        } catch (err) { setError(err.message); }
        finally { setSending(false); }
    };

    const removeComment = async commentId => {
        if (deletingId) return;
        setDeletingId(commentId);
        setError("");
        try {
            const response = await fetch(`${endpoint}/${commentId}`, {
                method: "DELETE", headers: authHeaders()
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || "Impossibile eliminare il commento");
            setComments(previous => previous.filter(comment => comment._id !== commentId));
            setConfirmId(null);
        } catch (err) { setError(err.message); }
        finally { setDeletingId(null); }
    };

    return (
        <section className="band-post-comments" aria-label="Commenti al post">
            <h4 className="band-post-comments-title"><MessageCircle size={17} /> Commenti {!loading && `(${comments.length})`}</h4>
            {loading ? <p className="band-post-comments-muted">Caricamento commenti...</p> : (
                <div className="band-post-comments-list">
                    {comments.length === 0 && <p className="band-post-comments-muted">Nessun commento. Scrivi il primo!</p>}
                    {comments.map(comment => {
                        const author = comment.createdBy || {};
                        const authorId = typeof author === "object" ? author._id : author;
                        const canDelete = String(authorId) === String(currentUserId) || String(ownerId) === String(currentUserId);
                        return (
                            <div className="band-post-comment" key={comment._id}>
                                <div className="band-post-comment-avatar">{author.avatar ? <img src={author.avatar} alt="" /> : <UserRound size={17} />}</div>
                                <div className="band-post-comment-main">
                                    <div className="band-post-comment-top">
                                        <strong>{`${author.name || ""} ${author.surname || ""}`.trim() || "Membro della band"}</strong>
                                        <time>{comment.created_at ? new Date(comment.created_at).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</time>
                                        {canDelete && <button type="button" className="band-post-comment-remove" aria-label="Elimina commento" onClick={() => setConfirmId(comment._id)}><Trash2 size={15} /></button>}
                                    </div>
                                    <p>{comment.content}</p>
                                    {confirmId === comment._id && <div className="band-post-comment-confirm"><span>Eliminare questo commento?</span><button type="button" disabled={!!deletingId} onClick={() => setConfirmId(null)}>Annulla</button><button type="button" className="danger" disabled={!!deletingId} onClick={() => removeComment(comment._id)}>{deletingId === comment._id ? "Eliminazione..." : "Elimina"}</button></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {error && <p className="band-post-comments-error" role="alert">{error}</p>}
            <form className="band-post-comments-form" onSubmit={submitComment}>
                <input aria-label="Scrivi un commento" value={content} maxLength={1000} onChange={event => setContent(event.target.value)} placeholder="Scrivi un commento..." disabled={sending} />
                <button type="submit" disabled={sending || !content.trim()}><Send size={16} /> {sending ? "Invio..." : "Pubblica"}</button>
            </form>
        </section>
    );
}
