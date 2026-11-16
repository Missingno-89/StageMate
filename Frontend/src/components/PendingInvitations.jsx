
import { useEffect, useState } from "react";
import { Users, Check, X } from "lucide-react";
import "../styles/PendingInvitations.css";

const API_URL = "http://localhost:9097";

const PendingInvitations = ({ onInvitationAccepted }) => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchInvitations = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/invitations/my`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error("Impossibile recuperare gli inviti");
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setInvitations(data.invitations || []);
                }
            } catch (err) {
                if (err.name !== "AbortError" && !controller.signal.aborted) {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchInvitations();

        return () => controller.abort();
    }, []);

    const handleInvitation = async (invitationId, action) => {
        if (processingId) return;

        setProcessingId(invitationId);
        setError("");

        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/invitations/${invitationId}/${action}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message || "Impossibile gestire l'invito"
                );
            }

            setInvitations((prev) =>
                prev.filter((invitation) =>
                    invitation._id !== invitationId
                )
            );

            if (action === "accept") {
                onInvitationAccepted?.();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <p>Caricamento inviti...</p>;
    }

    if (error && invitations.length === 0) {
        return <p role="alert">{error}</p>;
    }

    if (invitations.length === 0) {
        return null;
    }

    return (
        <section className="pending-invitations">
            <h2>
                <Users size={21} />
                Inviti ricevuti
                <span className="pending-invitations-count">
                    {invitations.length}
                </span>
            </h2>

            {error && <p role="alert">{error}</p>}

            <div className="pending-invitations-list">
                {invitations.map((invitation) => (
                    <article
                        key={invitation._id}
                        className="pending-invitation-card"
                    >
                        <div className="pending-invitation-info">
                            <Users size={24} />

                            <div>
                                <strong>
                                    {invitation.band?.name ||
                                        "Invito a una band"}
                                </strong>

                                <p>
                                    Hai ricevuto un invito a entrare
                                    in questa band.
                                </p>
                            </div>
                        </div>

                        <div className="pending-invitation-actions">
                            <button
                                type="button"
                                className="accept"
                                disabled={processingId !== null}
                                onClick={() =>
                                    handleInvitation(
                                        invitation._id,
                                        "accept"
                                    )
                                }
                            >
                                <Check size={17} />
                                Accetta
                            </button>

                            <button
                                type="button"
                                className="decline"
                                disabled={processingId !== null}
                                onClick={() =>
                                    handleInvitation(
                                        invitation._id,
                                        "decline"
                                    )
                                }
                            >
                                <X size={17} />
                                Rifiuta
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default PendingInvitations;
