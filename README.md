# ContApp Perú (Frontend)

Frontend web de ContApp Perú. Incluye dashboard en tiempo real, integración SUNAT, asistente IA y planes de suscripción.

**Stack**
- Vite + React + TypeScript
- Tailwind + shadcn-ui
- Firebase (Auth + Firestore)

---

## Qué puede hacer el sistema

- Dashboard financiero en tiempo real (ventas, compras, IGV).
- Gestión de negocios con RUC y autocompletado desde SUNAT (padrón reducido).
- Sincronización SUNAT con credenciales de Usuario Secundario (worker separado).
- Asistente ContApp IA con chat (backend propio).
- Suscripciones PayPal PRO/PLUS con activación automática por webhook.

---

## Arquitectura (alto nivel)

- **Frontend (este repo)**: Vercel
- **Backend principal**: Cloud Run (PayPal + OpenAI)
- **SUNAT Worker**: Cloud Run (automatización y sincronización)

Repos relacionados:
- Backend: `contapp-pe-backend`
- SUNAT Worker: `contapp-pe-sunat-worker`

---

## Variables de entorno (Vercel)

Mantén solo variables **VITE_** en Vercel.

Requeridas:
- `VITE_BACKEND_URL` = URL del backend principal (Cloud Run)
- `VITE_SUNAT_API_URL` = URL del SUNAT Worker (Cloud Run)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_ADMIN_EMAIL`

Opcionales:
- `VITE_PAYPAL_ENV` (live/sandbox)
- `VITE_PAYPAL_MANAGE_URL` (portal de suscripciones PayPal)

---

## Desarrollo local

```bash
npm install
npm run dev
```

---

## Deploy

- **Frontend**: Vercel
- **Backend principal**: Cloud Run
- **SUNAT Worker**: Cloud Run

Si actualizas variables en Vercel, haz redeploy para aplicar cambios.

---

## Notas importantes

- Los secretos (PayPal/OpenAI/Firebase Admin) viven **solo** en Cloud Run.
- En Vercel se dejan únicamente variables `VITE_*`.
- Los planes PayPal son mensuales y activan el plan automáticamente vía webhook.
