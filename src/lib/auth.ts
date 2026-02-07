import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

// Tipos
export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    plan: 'FREE' | 'PRO' | 'PLUS';
    role: 'USER' | 'ADMIN';
    status?: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
    trialEndsAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Verificar si un email es el del super admin
 */
const isAdminEmail = (email: string): boolean => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    return email.toLowerCase() === adminEmail?.toLowerCase();
};

/**
 * Registrar usuario con email y contraseña
 */
export const registerWithEmail = async (
    email: string,
    password: string,
    displayName?: string
): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Actualizar perfil con nombre
        if (displayName) {
            await updateProfile(user, { displayName });
        }

        // Determinar si es admin
        const role = isAdminEmail(email) ? 'ADMIN' : 'USER';

        // Crear documento de usuario en Firestore
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 5); // 5 días de prueba

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: displayName || null,
            plan: role === 'ADMIN' ? 'PLUS' : 'PRO', // Admin tiene plan PLUS automáticamente
            role: role,
            status: role === 'ADMIN' ? 'ACTIVE' : 'TRIAL',
            trialEndsAt: role === 'ADMIN' ? null : trialEndsAt,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return user;
    } catch (error: any) {
        console.error('Error en registro:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Login con email y contraseña
 */
export const loginWithEmail = async (
    email: string,
    password: string
): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        console.error('Error en login:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Login con Google
 */
export const loginWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Verificar si es nuevo usuario
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            // Determinar si es admin
            const role = isAdminEmail(user.email || '') ? 'ADMIN' : 'USER';

            // Crear perfil para nuevo usuario de Google
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 5);

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                plan: role === 'ADMIN' ? 'PLUS' : 'PRO',
                role: role,
                status: role === 'ADMIN' ? 'ACTIVE' : 'TRIAL',
                trialEndsAt: role === 'ADMIN' ? null : trialEndsAt,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        return user;
    } catch (error: any) {
        console.error('Error en login con Google:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error en logout:', error);
        throw error;
    }
};

/**
 * Obtener perfil de usuario desde Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                uid: data.uid,
                email: data.email,
                displayName: data.displayName,
                plan: data.plan,
                role: data.role || 'USER', // Default a USER si no existe
                trialEndsAt: data.trialEndsAt?.toDate(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate()
            };
        }

        return null;
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        return null;
    }
};

/**
 * Resetear contraseña
 */
export const resetPassword = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error('Error al resetear contraseña:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Observer de cambios de autenticación
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Mensajes de error en español
 */
const getAuthErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/invalid-email': 'Correo electrónico inválido',
        'auth/operation-not-allowed': 'Operación no permitida',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
        'auth/cancelled-popup-request': 'Solicitud cancelada',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
    };

    return errorMessages[errorCode] || 'Error de autenticación. Intenta nuevamente';
};
