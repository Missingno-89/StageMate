import { useEffect, useRef, useState } from "react";
import BandPostComments from "./BandPostComments.jsx";
import {
    UserRound,
    CalendarDays,
    Ellipsis,
    Pencil,
    Trash2
} from "lucide-react";

const BandPostCard = ({
    post,
    bandId,
    currentUserId,
    ownerId,
    onDelete,
    onUpdate
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title || "");
    const [editContent, setEditContent] = useState(post.content || "");
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const menuRef = useRef(null);

    const author = post.createdBy;

    // IDENTIFICAZIONE AUTORE
    const authorId =
        author && typeof author === "object"
            ? author._id
            : author;

    const authorName =
        author && typeof author === "object"
            ? `${author.name || ""} ${author.surname || ""}`.trim()
            : "Membro della band";

    const avatar =
        author && typeof author === "object"
            ? author.avatar
            : null;

    // PERMESSI
    const isAuthor =
        Boolean(currentUserId && authorId) &&
        String(currentUserId) === String(authorId);

    const isOwner =
        Boolean(currentUserId && ownerId) &&
        String(currentUserId) === String(ownerId);

    const canEdit = isAuthor;
    const canDelete = isAuthor || isOwner;
    const showMenu = canEdit || canDelete;

    // DATA
    const formattedDate = post.created_at
        ? new Date(post.created_at).toLocaleString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
        : "";

    // CHIUSURA MENU CLICCANDO FUORI
    useEffect(() => {
        if (!menuOpen) return;

        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick
            );
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [menuOpen]);

    const handleConfirmDelete = async () => {
        if (!canDelete || deleting) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await onDelete(post._id);
        } catch (error) {
            setDeleteError(error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleStartEditing = () => {
        if (!canEdit) return;

        setEditTitle(post.title || "");
        setEditContent(post.content || "");
        setEditError("");
        setConfirmDelete(false);
        setMenuOpen(false);
        setEditing(true);
    };

    const handleCancelEditing = () => {
        setEditing(false);
        setEditError("");
        setEditTitle(post.title || "");
        setEditContent(post.content || "");
    };

    const handleSaveEditing = async (event) => {
        event.preventDefault();

        if (!canEdit || saving) return;

        const cleanTitle = editTitle.trim();
        const cleanContent = editContent.trim();

        if (!cleanTitle && !cleanContent && !post.image) {
            setEditError(
                "Il post deve contenere testo o un'immagine"
            );
            return;
        }

        setSaving(true);
        setEditError("");

        try {
            await onUpdate(post._id, {
                title: cleanTitle,
                content: cleanContent
            });

            setEditing(false);
        } catch (error) {
            setEditError(
                error.message || "Errore durante il salvataggio"
            );
        } finally {
            setSaving(false);
        }
    };



    return (
        <article className="band-post-card">
            <header className="band-post-card-header">
                <div className="band-post-card-avatar">
                    {avatar ? (
                        <img src={avatar} alt="" />
                    ) : (
                        <UserRound size={22} />
                    )}
                </div>

                <div className="band-post-card-author">
                    <span className="band-post-card-author-name">
                        {authorName}
                    </span>

                    <span className="band-post-card-date">
                        <CalendarDays size={13} />
                        {formattedDate}
                    </span>
                </div>

                {showMenu && (
                    <div
                        className="band-post-menu-wrapper"
                        ref={menuRef}
                    >
                        <button
                            type="button"
                            className="band-post-menu-trigger"
                            aria-label="Opzioni post"
                            aria-expanded={menuOpen}
                            aria-haspopup="menu"
                            onClick={() =>
                                setMenuOpen((previous) => !previous)
                            }
                        >
                            <Ellipsis size={22} />
                        </button>

                        {menuOpen && (
                            <div
                                className="band-post-menu"
                                role="menu"
                            >
                                {canEdit && (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="band-post-menu-item"
                                        onClick={handleStartEditing}
                                    >
                                        <Pencil size={16} />
                                        Modifica post
                                    </button>
                                )}

                                {canDelete && (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="band-post-menu-item danger"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setDeleteError("");
                                            setConfirmDelete(true);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        Elimina post
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </header>

            {confirmDelete && (
                <div className="band-post-delete-confirm">
                    <div className="band-post-delete-heading">
                        <Trash2 size={18} />
                        <strong>Eliminare questo post?</strong>
                    </div>

                    <p>
                        Questa operazione è definitiva e non può
                        essere annullata.
                    </p>

                    {deleteError && (
                        <p className="band-post-delete-error" role="alert">
                            {deleteError}
                        </p>
                    )}

                    <div className="band-post-delete-actions">
                        <button
                            type="button"
                            className="band-post-delete-cancel"
                            disabled={deleting}
                            onClick={() => {
                                setConfirmDelete(false);
                                setDeleteError("");
                            }}
                        >
                            Annulla
                        </button>

                        <button
                            type="button"
                            className="band-post-delete-submit"
                            disabled={deleting}
                            onClick={handleConfirmDelete}
                        >
                            <Trash2 size={15} />
                            {deleting
                                ? "Eliminazione..."
                                : "Elimina definitivamente"}
                        </button>
                    </div>
                </div>
            )}



            <div className="band-post-card-body">
                {editing ? (
                    <form
                        className="band-post-edit-form"
                        onSubmit={handleSaveEditing}
                    >
                        {post.title && (
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(event) =>
                                    setEditTitle(event.target.value)
                                }
                                maxLength={255}
                                disabled={saving}
                                placeholder="Titolo del post"
                            />
                        )}

                        <textarea
                            value={editContent}
                            onChange={(event) =>
                                setEditContent(event.target.value)
                            }
                            maxLength={5000}
                            rows={4}
                            disabled={saving}
                            placeholder="Modifica il contenuto del post..."
                        />

                        {post.image && (
                            <div className="band-post-card-media">
                                <img
                                    src={post.image}
                                    alt="Fotografia allegata al post"
                                />
                            </div>
                        )}

                        {editError && (
                            <p
                                className="band-post-edit-error"
                                role="alert"
                            >
                                {editError}
                            </p>
                        )}

                        <div className="band-post-edit-actions">
                            <button
                                type="button"
                                className="band-post-edit-cancel"
                                disabled={saving}
                                onClick={handleCancelEditing}
                            >
                                Annulla
                            </button>

                            <button
                                type="submit"
                                className="band-post-edit-save"
                                disabled={saving}
                            >
                                {saving
                                    ? "Salvataggio..."
                                    : "Salva modifiche"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {post.title && (
                            <h3 className="band-post-card-title">
                                {post.title}
                            </h3>
                        )}

                        {post.content && (
                            <p className="band-post-card-content">
                                {post.content}
                            </p>
                        )}

                        {post.image && (
                            <div className="band-post-card-media">
                                <img
                                    src={post.image}
                                    alt="Fotografia allegata al post"
                                    loading="lazy"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <BandPostComments bandId={bandId} postId={post._id} currentUserId={currentUserId} ownerId={ownerId} />
        </article>
    );
};

export default BandPostCard;
