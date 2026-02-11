import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  sunatSecondaryUser?: string;
  sunatSecondaryPassword?: string;
  plan: 'FREE' | 'PRO' | 'PLUS';
  role: 'USER' | 'ADMIN';
  status?: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_ADMIN_EMAIL = 'afiliadosprobusiness@gmail.com';
const FIRESTORE_TIMEOUT_MS = 12000;

const withFirestoreTimeout = async <T>(operation: Promise<T>, action: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const error: any = new Error(`Firestore timeout: ${action}`);
          error.code = 'app/firestore-timeout';
          reject(error);
        }, FIRESTORE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const isAdminEmail = (email: string): boolean => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const configured = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
  return [configured, DEFAULT_ADMIN_EMAIL].includes(normalizedEmail);
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    const role = isAdminEmail(email) ? 'ADMIN' : 'USER';
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 5);

    await withFirestoreTimeout(
      setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || null,
        plan: role === 'ADMIN' ? 'PLUS' : 'PRO',
        role,
        status: role === 'ADMIN' ? 'ACTIVE' : 'TRIAL',
        trialEndsAt: role === 'ADMIN' ? null : trialEndsAt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      'register profile create'
    );

    return user;
  } catch (error: any) {
    console.error('Error en registro:', error);
    throw new Error(getAuthErrorMessage(error?.code || error?.message));
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error en login:', error);
    throw new Error(getAuthErrorMessage(error?.code || error?.message));
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    await ensureUserProfile(user);

    return user;
  } catch (error: any) {
    console.error('Error en login con Google:', error);
    throw new Error(getAuthErrorMessage(error?.code || error?.message));
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await withFirestoreTimeout(getDoc(doc(db, 'users', uid)), 'get profile');

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        phone: data.phone,
        sunatSecondaryUser: data.sunatSecondaryUser,
        sunatSecondaryPassword: data.sunatSecondaryPassword,
        plan: data.plan,
        role: data.role || 'USER',
        trialEndsAt: data.trialEndsAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return null;
  }
};

export const ensureUserProfile = async (user: User): Promise<void> => {
  if (!user) return;

  const userDoc = await withFirestoreTimeout(getDoc(doc(db, 'users', user.uid)), 'ensure profile read');
  const isAdmin = isAdminEmail(user.email || '');

  if (userDoc.exists()) {
    const data = userDoc.data();
    if (isAdmin && data.role !== 'ADMIN') {
      await withFirestoreTimeout(
        setDoc(
          doc(db, 'users', user.uid),
          {
            role: 'ADMIN',
            plan: 'PLUS',
            status: 'ACTIVE',
            trialEndsAt: null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        'promote admin'
      );
    }
    return;
  }

  const role = isAdmin ? 'ADMIN' : 'USER';
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 5);

  await withFirestoreTimeout(
    setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      plan: role === 'ADMIN' ? 'PLUS' : 'PRO',
      role,
      status: role === 'ADMIN' ? 'ACTIVE' : 'TRIAL',
      trialEndsAt: role === 'ADMIN' ? null : trialEndsAt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    'ensure profile create'
  );
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error al resetear contrasena:', error);
    throw new Error(getAuthErrorMessage(error?.code || error?.message));
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

const getAuthErrorMessage = (errorCode: string): string => {
  const normalized = String(errorCode || '').toLowerCase();

  if (normalized.includes('err_blocked_by_client') || normalized.includes('blocked_by_client')) {
    return 'Tu navegador o una extension esta bloqueando Firestore. Desactiva el bloqueador para este sitio e intenta nuevamente.';
  }

  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Este correo ya esta registrado',
    'auth/invalid-email': 'Correo electronico invalido',
    'auth/operation-not-allowed': 'Operacion no permitida',
    'auth/weak-password': 'La contrasena debe tener al menos 6 caracteres',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contrasena incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta mas tarde',
    'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
    'auth/cancelled-popup-request': 'Solicitud cancelada',
    'auth/network-request-failed': 'Error de conexion. Verifica tu internet',
    'app/firestore-timeout': 'No se pudo conectar a Firestore. Si usas bloqueador de anuncios o privacidad, desactivalo para este sitio.',
  };

  return errorMessages[normalized] || 'Error de autenticacion. Intenta nuevamente';
};
