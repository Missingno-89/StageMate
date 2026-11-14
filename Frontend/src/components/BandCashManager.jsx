
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, ArrowDownLeft, ArrowUpRight, Plus, Minus, ChevronUp, UserRound, Pencil, Trash2, } from "lucide-react";
import "../styles/BandCashManager.css";
const API_URL = "http://localhost:9097";
export default function BandCashManager() {
    const { bandId } = useParams();
    const navigate = useNavigate();
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // Form espandibile
    const [expandedForm, setExpandedForm] = useState(null);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editAmount, setEditAmount] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [movementLoading, setMovementLoading] = useState(false);
    const [movementError, setMovementError] = useState("");
    // Identità e permessi
    const [currentUser, setCurrentUser] = useState(null);
    const [bandOwnerId, setBandOwnerId] = useState(null);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [permissionsError, setPermissionsError] = useState("");
    // ========================================
    // RECUPERO DATI FONDO CASSA
    // ========================================
    async function fetchCashData(showLoading = false) {
        try {
            if (showLoading) setLoading(true);
            setError("");
            const headers = {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            };
            const [balanceResponse, transactionsResponse] =
                await Promise.all([
                    fetch(
                        `${API_URL}/bands/${bandId}/transactions/balance`,
                        { headers }
                    ),
                    fetch(
                        `${API_URL}/bands/${bandId}/transactions`,
                        { headers }
                    ),
                ]);
            if (!balanceResponse.ok || !transactionsResponse.ok) {
                throw new Error("Errore nel caricamento del fondo cassa");
            }
            const balanceData = await balanceResponse.json();
            const transactionsData = await transactionsResponse.json();
            setBalance(balanceData);
            setTransactions(transactionsData.transactions ?? []);
        } catch (error) {
            setError(error.message);
        } finally {
            if (showLoading) setLoading(false);
        }
    }
    useEffect(() => {
        if (bandId) {
            fetchCashData(true);
        }
    }, [bandId]);
    // ========================================
    // Recuperiamo identità e owner una sola volta per band.
    useEffect(() => {
        const controller = new AbortController();
        async function fetchPermissions() {
            setPermissionsLoading(true);
            setPermissionsError("");
            setCurrentUser(null);
            setBandOwnerId(null);
            try {
                const headers = {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                };
                const [bandResponse, userResponse] = await Promise.all([
                    fetch(`${API_URL}/bands/${bandId}`, {
                        headers,
                        signal: controller.signal,
                    }),
                    fetch(`${API_URL}/auth/me`, {
                        headers,
                        signal: controller.signal,
                    }),
                ]);
                if (!bandResponse.ok || !userResponse.ok) {
                    throw new Error("Impossibile verificare i permessi sui movimenti");
                }
                const bandData = await bandResponse.json();
                const userData = await userResponse.json();
                const owner = bandData.band?.owner;
                // Supporta sia { user: {...} } sia la risposta utente diretta.
                const user = userData.user ?? userData;
                if (!user?._id || !owner) {
                    throw new Error("Dati utente o owner mancanti nella risposta API");
                }
                if (!controller.signal.aborted) {
                    setCurrentUser(user);
                    setBandOwnerId(owner?._id ?? owner);
                }
            } catch (err) {
                if (err.name !== "AbortError" && !controller.signal.aborted) {
                    setPermissionsError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) setPermissionsLoading(false);
            }
        }
        if (bandId) fetchPermissions();
        return () => controller.abort();
    }, [bandId]);
    // FORMATTAZIONE
    // ========================================
    const formatCurrency = (value) =>
        (value / 100).toLocaleString("it-IT", {
            style: "currency",
            currency: "EUR",
        });
    const formatDate = (date) =>
        new Date(date).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    // ========================================
    // APERTURA / CHIUSURA FORM
    // ========================================
    function toggleForm(type) {
        if (saving) return;
        setExpandedForm((previous) =>
            previous === type ? null : type
        );
        setAmount("");
        setDescription("");
        setFormError("");
    }
    // ========================================
    // SALVATAGGIO MOVIMENTO
    // ========================================
    async function handleSaveTransaction(event, type) {
        event.preventDefault();
        if (saving) return;
        setFormError("");
        const normalizedAmount = amount.trim().replace(",", ".");
        const numericAmount = Number(normalizedAmount);
        if (
            !normalizedAmount ||
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0 ||
            !/^\d+([.,]\d{1,2})?$/.test(amount.trim())
        ) {
            setFormError("Inserisci un importo valido (massimo 2 decimali).");
            return;
        }
        const amountInCents = Math.round(numericAmount * 100);
        if (
            !Number.isSafeInteger(amountInCents) ||
            amountInCents < 1
        ) {
            setFormError("L'importo inserito non è valido.");
            return;
        }
        const cleanDescription = description.trim();
        if (!cleanDescription) {
            setFormError("Inserisci una motivazione.");
            return;
        }
        if (cleanDescription.length > 500) {
            setFormError("La motivazione non può superare 500 caratteri.");
            return;
        }
        try {
            setSaving(true);
            const response = await fetch(
                `${API_URL}/bands/${bandId}/transactions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        type,
                        amount: amountInCents,
                        description: cleanDescription,
                    }),
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || "Errore nel salvataggio del movimento"
                );
            }
            // Aggiorna saldo e storico
            await fetchCashData();
            // Chiude il form dopo il salvataggio
            setExpandedForm(null);
            setAmount("");
            setDescription("");
        } catch (error) {
            setFormError(error.message);
        } finally {
            setSaving(false);
        }
    }
    // ========================================
    // FORM ESPANDIBILE
    // ========================================
    function renderTransactionForm(type) {
        const isIncome = type === "income";
        return (
            <form
                className="cash-manager-form"
                onSubmit={(event) =>
                    handleSaveTransaction(event, type)
                }
            >
                <h3>
                    {isIncome ? "Nuova entrata" : "Nuova uscita"}
                </h3>
                <div className="cash-manager-form-field">
                    <label htmlFor={`cash-amount-${type}`}>
                        Importo (€)
                    </label>
                    <input
                        id={`cash-amount-${type}`}
                        type="text"
                        inputMode="decimal"
                        placeholder="Es. 25,50"
                        value={amount}
                        onChange={(event) =>
                            setAmount(event.target.value)
                        }
                        disabled={saving}
                        required
                    />
                </div>
                <div className="cash-manager-form-field">
                    <label htmlFor={`cash-description-${type}`}>
                        Motivazione
                    </label>
                    <textarea
                        id={`cash-description-${type}`}
                        placeholder={
                            isIncome
                                ? "Es. Quota mensile dei membri"
                                : "Es. Pagamento sala prove"
                        }
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        maxLength={500}
                        rows={3}
                        disabled={saving}
                        required
                    />
                </div>
                {formError && (
                    <p className="cash-manager-form-error" role="alert">
                        {formError}
                    </p>
                )}
                <div className="cash-manager-form-actions">
                    <button
                        type="button"
                        className="cash-manager-cancel"
                        onClick={() => toggleForm(type)}
                        disabled={saving}
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        className={
                            isIncome
                                ? "cash-manager-save-income"
                                : "cash-manager-save-expense"
                        }
                        disabled={saving}
                    >
                        {saving
                            ? "Salvataggio..."
                            : isIncome
                                ? "Salva entrata"
                                : "Salva uscita"}
                    </button>
                </div>
            </form>
        );
    }
    // ========================================
    // RENDER
    // ========================================
    if (loading) {
        return (
            <p className="cash-manager-status">
                Caricamento fondo cassa...
            </p>
        );
    }
    if (error && !balance) {
        return (
            <p className="cash-manager-status">
                {error}
            </p>
        );
    }
    function handleOpenEdit(transaction) {
        if (movementLoading) return;
        if (editingId === transaction._id) {
            setEditingId(null);
            return;
        }
        setDeletingId(null);
        setMovementError("");
        setEditingId(transaction._id);
        setEditAmount(
            (transaction.amount / 100).toFixed(2).replace(".", ",")
        );
        setEditDescription(transaction.description);
    }
    function handleOpenDelete(transactionId) {
        if (movementLoading) return;
        setEditingId(null);
        setMovementError("");
        setDeletingId((previous) =>
            previous === transactionId ? null : transactionId
        );
    }
    async function handleUpdateTransaction(event, transactionId) {
        event.preventDefault();
        if (movementLoading) return;
        setMovementError("");
        const normalizedAmount = editAmount.trim().replace(",", ".");
        if (!/^\d+(\.\d{1,2})?$/.test(normalizedAmount)) {
            setMovementError("Inserisci un importo valido.");
            return;
        }
        const amountInCents = Math.round(Number(normalizedAmount) * 100);
        if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
            setMovementError("L'importo deve essere maggiore di zero.");
            return;
        }
        const cleanDescription = editDescription.trim();
        if (!cleanDescription || cleanDescription.length > 500) {
            setMovementError(
                "La motivazione deve contenere da 1 a 500 caratteri."
            );
            return;
        }
        try {
            setMovementLoading(true);
            const response = await fetch(
                `${API_URL}/bands/${bandId}/transactions/${transactionId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        amount: amountInCents,
                        description: cleanDescription,
                    }),
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || "Errore durante la modifica"
                );
            }
            await fetchCashData();
            setEditingId(null);
            setMovementError("");
        } catch (error) {
            setMovementError(error.message);
        } finally {
            setMovementLoading(false);
        }
    }
    async function handleDeleteTransaction(transactionId) {
        if (movementLoading) return;
        try {
            setMovementLoading(true);
            setMovementError("");
            const response = await fetch(
                `${API_URL}/bands/${bandId}/transactions/${transactionId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data.message || "Errore durante l'eliminazione"
                );
            }
            await fetchCashData();
            setDeletingId(null);
            setMovementError("");
        } catch (error) {
            setMovementError(error.message);
        } finally {
            setMovementLoading(false);
        }
    }
    const currentUserId = currentUser?._id;
    const isBandOwner =
        Boolean(currentUserId && bandOwnerId) &&
        String(currentUserId) === String(bandOwnerId);
    const canManageTransaction = (transaction) => {
        if (!currentUserId) return false;
        const creatorId =
            transaction.createdBy?._id ??
            transaction.createdBy;
        return (
            isBandOwner ||
            (Boolean(creatorId) && String(creatorId) === String(currentUserId))
        );
    };
    return (
        <main className="cash-manager">
         
            {/* HEADER */}
            <div className="cash-manager-header">
                <Wallet size={28} />
                <h1>Fondo cassa</h1>
            </div>
            {/* SALDO */}
            <section className="cash-manager-balance">
                <span>Saldo disponibile</span>
                <h2>
                    {formatCurrency(balance?.balance ?? 0)}
                </h2>
                <div className="cash-manager-totals">
                    <div className="cash-manager-income">
                        <ArrowDownLeft size={20} />
                        <span>Entrate</span>
                        <strong>
                            {formatCurrency(balance?.totalIncome ?? 0)}
                        </strong>
                    </div>
                    <div className="cash-manager-expense">
                        <ArrowUpRight size={20} />
                        <span>Uscite</span>
                        <strong>
                            {formatCurrency(balance?.totalExpense ?? 0)}
                        </strong>
                    </div>
                </div>
            </section>
            {/* RIQUADRI ESPANDIBILI */}
            <div className="cash-manager-actions">
                {/* ENTRATE */}
                <div
                    className={`cash-manager-action-card income ${expandedForm === "income" ? "expanded" : ""
                        }`}
                >
                    <button
                        type="button"
                        className="cash-manager-action-toggle"
                        onClick={() => toggleForm("income")}
                        aria-expanded={expandedForm === "income"}
                        disabled={saving}
                    >
                        {expandedForm === "income" ? (
                            <ChevronUp size={19} />
                        ) : (
                            <Plus size={19} />
                        )}
                        Aggiungi entrata
                    </button>
                    {expandedForm === "income" &&
                        renderTransactionForm("income")}
                </div>
                {/* USCITE */}
                <div
                    className={`cash-manager-action-card expense ${expandedForm === "expense" ? "expanded" : ""
                        }`}
                >
                    <button
                        type="button"
                        className="cash-manager-action-toggle"
                        onClick={() => toggleForm("expense")}
                        aria-expanded={expandedForm === "expense"}
                        disabled={saving}
                    >
                        {expandedForm === "expense" ? (
                            <ChevronUp size={19} />
                        ) : (
                            <Minus size={19} />
                        )}
                        Aggiungi uscita
                    </button>
                    {expandedForm === "expense" &&
                        renderTransactionForm("expense")}
                </div>
            </div>
            {/* STORICO MOVIMENTI */}
            <section className="cash-manager-history">
                <h2>Storico movimenti</h2>
                {permissionsError && (
                    <p className="cash-manager-form-error" role="alert">
                        {permissionsError}. I movimenti restano visibili, ma modifica ed eliminazione sono disabilitate.
                    </p>
                )}
                {error && (
                    <p className="cash-manager-form-error" role="alert">
                        {error}
                    </p>
                )}
                {transactions.length === 0 ? (
                    <p className="cash-manager-empty">
                        Nessun movimento registrato.
                    </p>
                ) : (
                    <div className="cash-manager-list">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction._id}
                                className="cash-manager-transaction"
                            >
                                <div className="cash-manager-transaction-main">
                                    <div className="cash-manager-transaction-info">
                                        <strong>{transaction.description}</strong>
                                        <span className="cash-manager-transaction-author">
                                            <UserRound size={14} />
                                            Registrata da{" "}
                                            {transaction.createdBy
                                                ? `${transaction.createdBy.name} ${transaction.createdBy.surname}`
                                                : "Utente non disponibile"}
                                        </span>
                                        <span>{formatDate(transaction.date)}</span>
                                    </div>
                                    <div className="cash-manager-transaction-right">
                                        <strong
                                            className={
                                                transaction.type === "income"
                                                    ? "cash-manager-positive"
                                                    : "cash-manager-negative"
                                            }
                                        >
                                            {transaction.type === "income" ? "+" : "−"}
                                            {formatCurrency(transaction.amount)}
                                        </strong>
                                        {!permissionsLoading && canManageTransaction(transaction) && (
                                            <div className="cash-manager-transaction-buttons">
                                            <button
                                                type="button"
                                                className="cash-manager-edit-button"
                                                title="Modifica movimento"
                                                aria-label="Modifica movimento"
                                                onClick={() => handleOpenEdit(transaction)}
                                                disabled={movementLoading}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="cash-manager-delete-button"
                                                title="Elimina movimento"
                                                aria-label="Elimina movimento"
                                                onClick={() => handleOpenDelete(transaction._id)}
                                                disabled={movementLoading}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        )}
                                    </div>
                                </div>
                                {/* FORM MODIFICA */}
                                {canManageTransaction(transaction) && editingId === transaction._id && (
                                    <form
                                        className="cash-manager-inline-form"
                                        onSubmit={(event) =>
                                            handleUpdateTransaction(event, transaction._id)
                                        }
                                    >
                                        <h3>Modifica movimento</h3>
                                        <div className="cash-manager-form-field">
                                            <label htmlFor={`edit-amount-${transaction._id}`}>
                                                Importo (€)
                                            </label>
                                            <input
                                                id={`edit-amount-${transaction._id}`}
                                                type="text"
                                                inputMode="decimal"
                                                value={editAmount}
                                                onChange={(event) =>
                                                    setEditAmount(event.target.value)
                                                }
                                                disabled={movementLoading}
                                                required
                                            />
                                        </div>
                                        <div className="cash-manager-form-field">
                                            <label htmlFor={`edit-description-${transaction._id}`}>
                                                Motivazione
                                            </label>
                                            <textarea
                                                id={`edit-description-${transaction._id}`}
                                                value={editDescription}
                                                onChange={(event) =>
                                                    setEditDescription(event.target.value)
                                                }
                                                maxLength={500}
                                                rows={2}
                                                disabled={movementLoading}
                                                required
                                            />
                                        </div>
                                        {movementError && (
                                            <p className="cash-manager-form-error" role="alert">
                                                {movementError}
                                            </p>
                                        )}
                                        <div className="cash-manager-form-actions">
                                            <button
                                                type="button"
                                                className="cash-manager-cancel"
                                                onClick={() => setEditingId(null)}
                                                disabled={movementLoading}
                                            >
                                                Annulla
                                            </button>
                                            <button
                                                type="submit"
                                                className="cash-manager-save-edit"
                                                disabled={movementLoading}
                                            >
                                                {movementLoading
                                                    ? "Salvataggio..."
                                                    : "Salva modifiche"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {/* CONFERMA ELIMINAZIONE */}
                                {canManageTransaction(transaction) && deletingId === transaction._id && (
                                    <div className="cash-manager-delete-confirm">
                                        <p>
                                            Vuoi davvero eliminare questo movimento?
                                            L'operazione non potrà essere annullata.
                                        </p>
                                        {movementError && (
                                            <p className="cash-manager-form-error" role="alert">
                                                {movementError}
                                            </p>
                                        )}
                                        <div className="cash-manager-form-actions">
                                            <button
                                                type="button"
                                                className="cash-manager-cancel"
                                                onClick={() => setDeletingId(null)}
                                                disabled={movementLoading}
                                            >
                                                Annulla
                                            </button>
                                            <button
                                                type="button"
                                                className="cash-manager-confirm-delete"
                                                onClick={() =>
                                                    handleDeleteTransaction(transaction._id)
                                                }
                                                disabled={movementLoading}
                                            >
                                                {movementLoading
                                                    ? "Eliminazione..."
                                                    : "Elimina definitivamente"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
