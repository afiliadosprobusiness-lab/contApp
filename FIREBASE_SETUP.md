# 🔥 Configuración de Firebase para ContApp Pe

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener:
- Node.js instalado (v18 o superior)
- Una cuenta de Google
- Acceso a [Firebase Console](https://console.firebase.google.com/)

---

## 🚀 PASO 1: Crear Proyecto en Firebase

1. **Ve a Firebase Console**
   - https://console.firebase.google.com/
   - Haz clic en "Agregar proyecto"

2. **Configura el proyecto**
   - Nombre: `contapp-peru` (o el que prefieras)
   - Analytics: Activado (opcional pero recomendado)
   - Cuenta de Analytics: Selecciona o crea una

3. **Espera a que Firebase cree tu proyecto**

---

## 🔧 PASO 2: Configurar Firebase Authentication

1. **En Firebase Console > Authentication**
   - Haz clic en "Comenzar"

2. **Habilitar métodos de inicio de sesión:**
   - **Correo electrónico/Contraseña**: Activar
   - **Google**: Activar
     - Nombre público del proyecto: Ingresar
     - Correo de asistencia: Tu email
     - Guardar

3. **(Opcional) Agregar dominio autorizado:**
   - En la pestaña "Settings"
   - Agregar `localhost` (ya debería estar)
   - Agregar tu dominio de producción cuando deploys

---

## 📊 PASO 3: Configurar Firestore Database

1. **En Firebase Console > Firestore Database**
   - Haz clic en "Crear base de datos"

2. **Ubicación:**
   - Selecciona `southamerica-east1` (São Paulo - más cercano a Perú)

3. **Reglas de seguridad:**
   - Comienza en **modo de producción**
   - Las reglas personalizadas se agregarán después

4. **Firestore está listo!**

5. **Crear colecciones iniciales:**
   
   Copia y pega estas reglas en Firestore Rules:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       
       // Users collection
       match /users/{userId} {
         allow read: if request.auth != null && request.auth.uid == userId;
         allow create: if request.auth != null;
         allow update: if request.auth != null && request.auth.uid == userId;
       }
       
       // Businesses collection (nested under users)
       match /users/{userId}/businesses/{businessId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Comprobantes collection (nested under businesses)
       match /users/{userId}/businesses/{businessId}/comprobantes/{comprobanteId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Tax calculations
       match /users/{userId}/businesses/{businessId}/tax_calculations/{calcId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Subscriptions
       match /subscriptions/{subscriptionId} {
         allow read: if request.auth != null && request.auth.uid == resource.data.userId;
         allow write: if false; // Solo el backend puede escribir
       }
     }
   }
   ```

---

## 📁 PASO 4: Configurar Firebase Storage

1. **En Firebase Console > Storage**
   - Haz clic en "Comenzar"

2. **Reglas de seguridad:**
   - Comienza en **modo de producción**

3. **Ubicación:**
   - Selecciona `southamerica-east1`

4. **Reglas de Storage:**

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /comprobantes/{userId}/{businessId}/{fileName} {
         allow read: if request.auth != null && request.auth.uid == userId;
         allow write: if request.auth != null && 
                        request.auth.uid == userId &&
                        request.resource.size < 10 * 1024 * 1024 && // Max 10 MB
                        request.resource.contentType.matches('(image/.*)|(application/pdf)|(application/xml)');
       }
     }
   }
   ```

---

## 🔑 PASO 5: Obtener Credenciales del Proyecto

1. **En Firebase Console > Project Settings (⚙️)**
   - Haz clic en el ícono de engranaje > "Configuración del proyecto"

2. **Agregar app web:**
   - Scroll down y haz clic en el ícono `</>` (Web)
   - Alias de la app: `ContApp Web`
   - **NO** marcar "Firebase Hosting" (por ahora)
   - Clic en "Registrar app"

3. **Copiar configuración:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "contapp-peru.firebaseapp.com",
     projectId: "contapp-peru",
     storageBucket: "contapp-peru.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
     measurementId: "G-XXXXXXXX"
   };
   ```

---

## 🔐 PASO 6: Configurar Variables de Entorno

1. **Crea un archivo `.env` en la raíz del proyecto:**

   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env` con tus credenciales de Firebase:**

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIza.....
   VITE_FIREBASE_AUTH_DOMAIN=contapp-peru.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=contapp-peru
   VITE_FIREBASE_STORAGE_BUCKET=contapp-peru.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX

   # Culqi (dejar vacío por ahora)
   VITE_CULQI_PUBLIC_KEY=

   # OpenAI (dejar vacío por ahora)
   VITE_OPENAI_API_KEY=
   ```

3. **⚠️ IMPORTANTE:** El archivo `.env` NO se debe subir a Git (ya está en `.gitignore`)

---

## ▶️ PASO 7: Ejecutar la Aplicación

1. **Instalar dependencias (si no lo has hecho):**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   ```
   http://localhost:8080
   ```

---

## ✅ PASO 8: Probar la Autenticación

1. **Ir a la página de registro:**
   - `http://localhost:8080/registro`

2. **Registrarse con email:**
   - Nombre: Tu nombre
   - Email: tu@correo.com  
   - Contraseña: mínimo 6 caracteres

3. **Verificar en Firebase Console:**
   - Authentication > Users
   - Deberías ver tu usuario registrado

4. **Verificar perfil en Firestore:**
   - Firestore Database > users
   - Deberías ver un documento con tu UID

5. **Probar login con Google:**
   - Ir a `/login`
   - Clic en "Continuar con Google"

---

## 🗄️ Estructura de Firestore Database

La base de datos tendrá esta estructura:

```
users/
  {userId}/
    uid: string
    email: string
    displayName: string
    plan: 'FREE' | 'PRO' | 'PLUS'
    status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED'
    trialEndsAt: timestamp
    createdAt: timestamp
    updatedAt: timestamp
    
    businesses/ (subcollection)
      {businessId}/
        ruc: string
        name: string
        type: string
        status: 'ACTIVE' | 'INACTIVE'
        createdAt: timestamp
        
        comprobantes/ (subcollection)
          {comprobanteId}/
            type: 'VENTA' | 'COMPRA'
            serie: string
            numero: string
            fecha: timestamp
            cliente: string
            proveedor: string
            monto: number
            igv: number
            xmlUrl: string
            pdfUrl: string
            
        tax_calculations/ (subcollection)
          {year}-{month}/
            igvSales: number
            igvPurchases: number
            igvToPay: number
            rentaEstimated: number
            calculatedAt: timestamp

subscriptions/
  {subscriptionId}/
    userId: string
    plan: 'PRO' | 'PLUS'
    status: 'ACTIVE' | 'CANCELLED'
    currentPeriodStart: timestamp
    currentPeriodEnd: timestamp
    paymentMethod: string
    amount: number
```

---

## 🎉 ¡Listo!

Ahora tienes Firebase completamente configurado con:
- ✅ Authentication (Email + Google)
- ✅ Firestore Database
- ✅ Storage
- ✅ Reglas de seguridad básicas

---

## 🔧 Siguientes Pasos Recomendados

1. **Configurar Culqi para pagos:**
   - Crear cuenta en https://culqi.com
   - Obtener claves de prueba
   - Agregar a `.env`

2. **Configurar OpenAI para IA contable:**
   - Crear cuenta en https://platform.openai.com
   - Generar API key
   - Agregar a `.env`

3. **Implementar funcionalidades de negocio:**
   - CRUD de negocios (RUCs)
   - Subida de comprobantes
   - Cálculo de impuestos
   - Chat de IA

4. **Deploy en producción:**
   - Vercel (frontend)
   - Firebase Hosting (alternativa)
   - Configurar dominios

---

## 📚 Recursos Útiles

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [React + Firebase](https://firebase.google.com/docs/web/setup)
