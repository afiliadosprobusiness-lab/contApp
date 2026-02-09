import admin from "firebase-admin";

const initFirebaseAdmin = () => {
  if (admin.apps.length) return admin;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  }

  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
};

export const firebaseAdmin = initFirebaseAdmin();
export const firestore = firebaseAdmin.firestore();
