import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Crown, Mail, Send, Trash2, Users, UserRound, X } from "lucide-react";
import "../styles/BandMembers.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9097";

const getId = (value) => typeof value === "object" && value !== null ? String(value._id ?? "") : String(value ?? "");

export default function BandMembers() {
    const { bandId } = useParams();
    const [members, setMembers] = useState([]);
    const [band, setBand] = useState(null);
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [inviteMessage, setInviteMessage] = useState("");
    const [inviteError, setInviteError] = useState("");
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState("");

    const request = async (path, options = {}) => {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("Sessione scaduta: effettua nuovamente l'accesso.");
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers
            }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || `Errore HTTP ${response.status}`);
        return data;
    };

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const [bandData, membersData, meData] = await Promise.all([
                    request(`/bands/${bandId}`),
                    request(`/bands/${bandId}/members`),
                    request("/auth/me")
                ]);
                if (!active) return;
                setBand(bandData.band);
                setMembers(Array.isArray(membersData) ? membersData : membersData.members ?? []);
                setMe(meData.user ?? meData);
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, [bandId]);

    const ownerId = getId(band?.owner);
    const isOwner = Boolean(ownerId && ownerId === getId(me));
    const sortedMembers = [...members].sort((a, b) => {
        if (getId(a) === ownerId) return -1;
        if (getId(b) === ownerId) return 1;
        return `${a.name ?? ""} ${a.surname ?? ""}`.localeCompare(`${b.name ?? ""} ${b.surname ?? ""}`, "it");
    });

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!isOwner || sending) return;
        setSending(true);
        setInviteError("");
        setInviteMessage("");
        try {
            await request(`/bands/${bandId}/invitations`, {
                method: "POST",
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });
            setInviteMessage(
                "Invito inviato! Il destinatario riceverà una notifica su StageMate."
            );
            setEmail("");
        } catch (err) {
            setInviteError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleRemove = async () => {
        if (!isOwner || !memberToRemove || removing || getId(memberToRemove) === ownerId) return;
        setRemoving(true);
        setRemoveError("");
        try {
            await request(`/bands/${bandId}/members/${getId(memberToRemove)}`, { method: "DELETE" });
            setMembers((prev) => prev.filter((member) => getId(member) !== getId(memberToRemove)));
            setMemberToRemove(null);
        } catch (err) {
            setRemoveError(err.message);
        } finally {
            setRemoving(false);
        }
    };

    return (
        <main className="band-members-page">
            <header className="band-members-header">
                <div className="band-members-heading">
                    <Users size={26} aria-hidden="true" />
                    <div><h1>Membri</h1><p>Gestisci i componenti della tua band</p></div>
                </div>
                {!loading && !error && <span className="band-members-count">{members.length} {members.length === 1 ? "membro" : "membri"}</span>}
            </header>

            {loading && <p className="band-members-muted">Caricamento membri...</p>}
            {error && <p className="band-members-error" role="alert">{error}</p>}

            {!loading && !error && (
                <>
                    <section className="band-members-panel" aria-labelledby="band-members-list-title">
                        <h2 id="band-members-list-title">Componenti della band</h2>
                        <div className="band-members-list">
                            {sortedMembers.length === 0 && <p className="band-members-muted">Nessun membro trovato.</p>}
                            {sortedMembers.map((member) => {
                                const memberId = getId(member);
                                const owner = memberId === ownerId;
                                const name = [member.name, member.surname].filter(Boolean).join(" ") || "Membro";
                                return (
                                    <div className="band-members-item" key={memberId}>
                                        <div className="band-members-avatar" aria-hidden="true">{member.avatar ? <img src={member.avatar} alt="" /> : <UserRound size={21} />}</div>
                                        <div className="band-members-person">
                                            <strong>{name}</strong>
                                            <span>{owner ? "Proprietario" : "Membro"}</span>
                                        </div>
                                        {owner ? <Crown className="band-members-crown" size={20} aria-label="Proprietario" /> : isOwner ? (
                                            <button type="button" className="band-members-remove" onClick={() => { setMemberToRemove(member); setRemoveError(""); }} aria-label={`Rimuovi ${name}`} title={`Rimuovi ${name}`}><Trash2 size={18} /></button>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {isOwner && (
                        <section className="band-members-panel" aria-labelledby="band-members-invite-title">
                            <h2 id="band-members-invite-title"><Mail size={20} aria-hidden="true" /> Invita un nuovo membro</h2>
                            <p className="band-members-muted">Inserisci l'indirizzo email della persona che vuoi invitare. L'invito scade dopo 7 giorni.</p>
                            <form className="band-members-invite-form" onSubmit={handleInvite}>
                                <label htmlFor="band-invite-email">Indirizzo email</label>
                                <div className="band-members-invite-row">
                                    <input id="band-invite-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@esempio.it" disabled={sending} />
                                    <button type="submit" disabled={sending || !email.trim()}><Send size={17} /> {sending ? "Invio..." : "Invia invito"}</button>
                                </div>
                            </form>
                            {inviteMessage && <p className="band-members-success" role="status">{inviteMessage}</p>}
                            {inviteError && <p className="band-members-error" role="alert">{inviteError}</p>}
                        </section>
                    )}
                </>
            )}

            {memberToRemove && (
                <div className="band-members-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !removing) setMemberToRemove(null); }}>
                    <div className="band-members-confirm" role="dialog" aria-modal="true" aria-labelledby="band-members-confirm-title">
                        <button type="button" className="band-members-close" onClick={() => setMemberToRemove(null)} disabled={removing} aria-label="Chiudi"><X size={20} /></button>
                        <h2 id="band-members-confirm-title">Rimuovere il membro?</h2>
                        <p>Vuoi davvero rimuovere <strong>{[memberToRemove.name, memberToRemove.surname].filter(Boolean).join(" ")}</strong> dalla band?</p>
                        {removeError && <p className="band-members-error" role="alert">{removeError}</p>}
                        <div className="band-members-confirm-actions">
                            <button type="button" onClick={() => setMemberToRemove(null)} disabled={removing}>Annulla</button>
                            <button type="button" className="danger" onClick={handleRemove} disabled={removing}>{removing ? "Rimozione..." : "Rimuovi"}</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
