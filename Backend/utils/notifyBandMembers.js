
import Notification from "../models/Notification.js";

export async function notifyBandMembers({
    band,
    actorId,
    type,
    referenceId,
    message
}) {
    const recipients = [
        band.owner,
        ...band.members
    ];

    // Eliminiamo eventuali duplicati
    const uniqueRecipients = [
        ...new Set(
            recipients.map(id => id.toString())
        )
    ].filter(id => id !== actorId.toString());

    // Nessun altro membro da notificare
    if (uniqueRecipients.length === 0) {
        return;
    }

    // Creiamo una notifica per ogni destinatario
    await Notification.insertMany(
        uniqueRecipients.map(userId => ({
            userId,
            bandId: band._id,
            type,
            referenceId,
            message
        }))
    );
}
