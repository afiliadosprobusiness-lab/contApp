# ContApp Perú (Frontend) — Project Context

## Objetivo de negocio
ContApp Perú es un sistema contable asistido por IA para emprendedores, freelancers y PyMEs en Perú. Permite gestionar negocios, visualizar métricas en tiempo real, y sincronizar comprobantes/impuestos con SUNAT mediante un worker separado.

## Tech Stack
- App: React 18 + TypeScript + Vite
- UI: TailwindCSS + shadcn/ui (Radix UI) + lucide-react
- Routing: react-router-dom
- Data: Firebase (Web SDK: Auth + Firestore)
- Charts: recharts
- Deploy: Vercel (frontend)

## Arquitectura (decisiones clave)
- 3 piezas:
  - Frontend (este repo): UI, navegación, Firestore realtime.
  - Backend principal (`contapp-pe-backend`): chat IA (OpenAI) + PayPal (create subscription + webhook).
  - SUNAT Worker (`contapp-pe-sunat-worker`): automatización/consulta RUC y sincronización (Playwright).
- Secrets:
  - Solo en Cloud Run (backend y worker). En Vercel se usan únicamente variables `VITE_*`.
- Autenticación:
  - Firebase Auth en el frontend.
  - Se pasa Firebase ID Token al backend/worker cuando requieren auth.

## Reglas UI/UX
- Mobile-first y dashboard usable en pantallas pequeñas.
- Estados claros: loading/empty/error con toasts y mensajes de ayuda.
- Accesibilidad:
  - Mantener `focus-visible` y labels.
  - Evitar “texto cortado”: usar `min-w-0`, `truncate`, `break-words` según corresponda.

## Convenciones de código
- TypeScript (evitar `any`).
- Alias `@/` para imports.
- Componentes UI reutilizables en `src/components/ui/*`.
- Evitar uso directo de `window` durante render (compatibilidad SSR).
- Firestore:
  - Los listeners (`onSnapshot`) se limpian en `useEffect`.
  - Las rutas de documentos/colecciones deben mantenerse consistentes con reglas.

## Configuración (resumen)
- Variables públicas (Vercel):
  - `VITE_BACKEND_URL`, `VITE_SUNAT_API_URL`
  - Firebase `VITE_FIREBASE_*`
  - `VITE_ADMIN_EMAIL` (superadmin)
- Reglas de Firestore:
  - Definen acceso por usuario y privilegios admin (ver `FIRESTORE_RULES.md`).

