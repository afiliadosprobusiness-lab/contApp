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


## Actualizacion 2026-02-15

### Nuevo flujo de Facturacion
- Nueva ruta: `/dashboard/facturacion`.
- Emision manual de `FACTURA` y `BOLETA` desde frontend.
- Dashboard operativo con metricas de:
  - ventas del mes
  - clientes activos (unicos)
  - productos vendidos (unicos por descripcion)
  - facturas pendientes (cantidad y saldo)
- Cobranza basica: accion para marcar factura como pagada.

### Modelo Firestore agregado
- Subcoleccion: `users/{uid}/businesses/{businessId}/invoices/{invoiceId}`
- Campos observados:
  - `documentType` (`FACTURA|BOLETA`)
  - `serie`, `numero`
  - `customerName`, `customerDocumentType`, `customerDocumentNumber`
  - `issueDate`, `dueDate`
  - `subtotal`, `igv`, `total`
  - `paidAmount`, `balance`, `paymentStatus` (`PENDIENTE|PARCIAL|PAGADO|VENCIDO`)
  - `status` (`EMITIDO`)
  - `source` (`MANUAL`)
  - `items[]` (descripcion, cantidad, precio, impuesto, totales)
  - `createdAt`, `updatedAt`

### Compatibilidad
- Se mantiene escritura en `comprobantes` para ventas emitidas desde Facturacion, evitando romper los modulos existentes de dashboard/impuestos.

## Actualizacion 2026-02-15 (fase 2)

### Cobranza y exportacion
- Soporte de pagos parciales por factura en la ruta `/dashboard/facturacion`.
- Historial de abonos por documento en subcoleccion dedicada.
- Exportacion CSV de facturas/boletas emitidas desde la misma pantalla.

### Modelo Firestore agregado
- Subcoleccion: `users/{uid}/businesses/{businessId}/invoices/{invoiceId}/payments/{paymentId}`
- Campos observados:
  - `amount`
  - `paymentDate`
  - `note`
  - `createdAt`

### Regla funcional de estado de pago
- `paymentStatus` se actualiza a `PARCIAL` cuando existe abono y saldo mayor a cero.
- `paymentStatus` se actualiza a `PAGADO` cuando el saldo llega a cero.

## Actualizacion 2026-02-15 (fase 3)

### Integracion frontend -> backend billing
- La pantalla `/dashboard/facturacion` migra a consumo de API backend para:
  - emitir factura/boleta
  - listar facturas
  - listar pagos por factura
  - registrar abonos
  - marcar pago total
- Se incorpora cliente HTTP en:
  - `src/lib/backend.ts` (`getWithAuth`)
  - `src/lib/billing.ts` (wrappers `billing/*`)

### Dependencia operativa
- `VITE_BACKEND_URL` debe apuntar al backend principal con los endpoints `billing/*` habilitados.
- Si no existe `VITE_BACKEND_URL`, el fallback `/api/*` no cubre `billing/*` en el serverless actual.

## Actualizacion 2026-02-15 (fase 4 CPE)

### Integracion CPE desde Facturacion
- La pantalla `/dashboard/facturacion` agrega accion por comprobante para enviar/reenviar CPE.
- Flujo UI:
  - frontend -> `POST /billing/invoices/:invoiceId/emit-cpe` (backend principal)
  - backend -> `POST /sunat/cpe/emit` (worker SUNAT)
  - worker persiste resultado CPE en `invoices/{invoiceId}`.

### Campos CPE consumidos por UI
- `cpeStatus`
- `cpeProvider`
- `cpeTicket`
- `cpeCode`, `cpeDescription`
- `cpeError`
- `cpeLastAttemptAt`, `cpeAcceptedAt`
