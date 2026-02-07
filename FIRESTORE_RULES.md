# Reglas de Firestore para ContApp Pe

Copia y pega estas reglas en Firebase Console > Firestore Database > Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar si el usuario es admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      // Leer: el propio usuario o el admin
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || isAdmin());
      
      // Crear: cualquier usuario autenticado
      allow create: if request.auth != null;
      
      // Actualizar: el propio usuario o el admin
      allow update: if request.auth != null && 
                       (request.auth.uid == userId || isAdmin());
      
      // Eliminar: solo admin
      allow delete: if isAdmin();
    }
    
    // Businesses collection (nested under users)
    match /users/{userId}/businesses/{businessId} {
      allow read, write: if request.auth != null && 
                            (request.auth.uid == userId || isAdmin());
    }
    
    // Comprobantes collection (nested under businesses)
    match /users/{userId}/businesses/{businessId}/comprobantes/{comprobanteId} {
      allow read, write: if request.auth != null && 
                            (request.auth.uid == userId || isAdmin());
    }
    
    // Tax calculations
    match /users/{userId}/businesses/{businessId}/tax_calculations/{calcId} {
      allow read, write: if request.auth != null && 
                            (request.auth.uid == userId || isAdmin());
    }
    
    // Subscriptions
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.userId || isAdmin());
      allow write: if isAdmin(); // Solo admin puede modificar suscripciones
    }
  }
}
```

## Pasos para actualizar:

1. Ve a Firebase Console
2. Firestore Database > Reglas (pestaña superior)
3. Reemplaza TODO el contenido con el código de arriba
4. Haz clic en "Publicar"
