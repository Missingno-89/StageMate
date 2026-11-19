# StageMate 🎸

**StageMate** è una web app per organizzare la vita di una band in un unico spazio privato: membri, prove e concerti, comunicazioni, spese e file condivisi.

## 🌐 Prova StageMate online

**[Apri StageMate](https://stage-mate-six.vercel.app)**

- **Frontend:** [https://stage-mate-six.vercel.app](https://stage-mate-six.vercel.app) — Vercel
- **Backend API:** [https://stagemate-backend.onrender.com](https://stagemate-backend.onrender.com) — Render
- **Repository:** [Missingno-89/StageMate](https://github.com/Missingno-89/StageMate)

> **Nota sulla registrazione:** l'invio delle email tramite Resend è attualmente configurato in modalità di test, con limitazioni sui destinatari. La verifica via email potrebbe quindi non essere disponibile per tutti gli indirizzi. Il login Google è disponibile come metodo alternativo di accesso.

## ✨ Funzionalità

- Registrazione e accesso con credenziali o Google OAuth
- Gestione di più band e dei rispettivi membri
- Band private, inviti e gestione dei ruoli
- Dashboard riservata alla band
- Calendario condiviso per prove, live e altri impegni
- Lettura degli eventi e conferma della presenza
- Bacheca con post e commenti
- Fondo cassa condiviso con entrate, uscite e storico
- Archivio di file, immagini e tracce audio
- Notifiche all'interno dell'applicazione
- Profilo utente e impostazioni
- Interfaccia responsive per desktop e smartphone

## 🛠️ Tecnologie

| Area | Tecnologie |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Autenticazione | JWT, Google OAuth |
| Gestione media | Cloudinary |
| Email | Resend (modalità test) |
| Deploy | Vercel (frontend), Render (backend) |

## 📁 Struttura del repository

```text
StageMate/
├── Frontend/    # Applicazione React/Vite
└── Backend/     # API Express e modelli MongoDB
```

## 💻 Avvio in locale

Sono necessari **Node.js**, **npm** e le variabili d'ambiente per i servizi esterni.

1. Clona il repository:
   ```bash
   git clone https://github.com/Missingno-89/StageMate.git
   cd StageMate
   ```
2. Installa le dipendenze in `Backend` e `Frontend` con `npm install`.
3. Configura i rispettivi file `.env` in base alle variabili utilizzate dal progetto. Non inserire credenziali o segreti nel repository.
4. Avvia il backend da `Backend` con `npm run dev`.
5. Avvia il frontend da `Frontend` con `npm run dev`.

Il frontend utilizza `VITE_API_URL` per individuare il backend corretto nell'ambiente locale o in produzione.

## 🎓 Progetto

StageMate nasce come progetto capstone del percorso **Web Developer di EPICODE**, con l'obiettivo di realizzare un'applicazione full-stack utile per l'organizzazione quotidiana di gruppi musicali.

---

**StageMate — La tua band, un unico spazio.**
