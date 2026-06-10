# 🚀 Deploy su Vercel - Guida Completa

## Struttura del progetto su Vercel

Avrai **3 progetti Vercel** separati:

| Progetto | Cartella | Tipo |
|----------|----------|------|
| `provvisorio-store` | `frontend/store` | Vite (static) |
| `provvisorio-admin` | `frontend/admin` | Vite (static) |
| `provvisorio-backend` | `provvisorio_backend` | Serverless Functions |

---

## 1. Backend (deploy per primo)

### Su Vercel:
1. Crea nuovo progetto → Importa repo GitHub
2. **Root Directory**: `provvisorio_backend`
3. **Framework Preset**: Other
4. **Build Command**: (vuoto)
5. **Output Directory**: (vuoto)

### Environment Variables da aggiungere:
```
MONGO=mongodb+srv://username:password@cluster.mongodb.net/provvisorio
JWT_SECRET=tua_secret_key_molto_lunga_e_sicura
CLOUDINARY_CLOUD_NAME=tuo_cloud_name
CLOUDINARY_API_KEY=tua_api_key
CLOUDINARY_API_SECRET=tua_api_secret
```

### Dopo il deploy:
- Segnati l'URL del backend (es. `https://provvisorio-backend.vercel.app`)
- Tutte le API saranno accessibili a: `https://provvisorio-backend.vercel.app/api/...`

---

## 2. Store (frontend pubblico)

### Su Vercel:
1. Crea nuovo progetto → Importa stessa repo GitHub
2. **Root Directory**: `frontend/store`
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

### Environment Variables:
```
VITE_API_URL=https://provvisorio-backend.vercel.app/api
```

### Dopo il deploy:
- Il sito sarà accessibile all'URL assegnato da Vercel
- Puoi aggiungere un custom domain (es. provvisorio.com)

---

## 3. Admin (pannello admin) — deploy con Surge.sh

### Setup Surge (solo la prima volta):
```bash
npx surge login
```
(Inserisci email e password quando richiesto)

### Deploy:
```bash
cd frontend/admin
npm run build
npx surge dist provvisorio-admin.surge.sh
```

Oppure usa lo script automatico:
```bash
cd frontend/admin
./deploy-surge.sh provvisorio-admin.surge.sh
```

### Come funziona:
- `.env.production` contiene `VITE_API_URL=https://provvisorio-website.vercel.app/api`
- Vite usa automaticamente `.env.production` quando fai `npm run build`
- `.env` (locale) punta a `http://localhost:4444/api` per sviluppo

### Dopo il deploy:
- Admin accessibile a: `https://provvisorio-admin.surge.sh`
- Surge è gratuito, HTTPS incluso, nessun limite di build

---

## 4. MongoDB Atlas Setup

1. Vai su [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea account gratuito (M0 Free Cluster)
3. Crea cluster
4. **Database Access**: crea utente con read/write
5. **Network Access**: aggiungi `0.0.0.0/0` (permetti tutti - necessario per Vercel serverless)
6. **Connect**: copia connection string → sostituisci `<password>` con la password dell'utente
7. Usa questa stringa come variabile `MONGO` nel backend

---

## 5. Flusso di aggiornamento

```bash
# Dopo aver fatto modifiche al codice:
git add .
git commit -m "descrizione modifica"
git push origin main
```

Vercel farà automaticamente il redeploy di tutti e 3 i progetti.

---

## 6. Custom Domain (opzionale)

### Store:
- Vercel Dashboard → progetto store → Settings → Domains
- Aggiungi: `provvisorio.com` e `www.provvisorio.com`

### Admin:
- Aggiungi: `admin.provvisorio.com`

### Backend:
- Aggiungi: `api.provvisorio.com`
- Aggiorna `VITE_API_URL` in store e admin a: `https://api.provvisorio.com/api`

---

## ⚠️ Note importanti

- **Vercel Hobby Plan**: 10s timeout per serverless functions, 100GB bandwidth/mese
- **Cold starts**: la prima chiamata API dopo inattività può essere lenta (1-3s)
- **Upload immagini**: Cloudinary gestisce gli upload, Vercel funge solo da proxy (max 4.5MB per request)
- **CORS**: configurato con `cors()` (accetta tutti gli origin - sicuro con auth token)