import { getAuth } from "firebase/auth";

const normalizeBase = (value?: string) => {
  if (!value) return "";
  const cleaned = value.trim();
  if (!cleaned) return "";
  return cleaned.endsWith("/") ? cleaned.slice(0, -1) : cleaned;
};

const getBaseUrl = () => normalizeBase(import.meta.env.VITE_BACKEND_URL as string | undefined);

const buildUrl = (path: string) => {
  const base = getBaseUrl();
  if (base) return `${base}${path}`;
  return `/api${path}`;
};

const getAuthToken = async () => {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error("Usuario no autenticado");
  }
  return user.getIdToken();
};

export const postWithAuth = async <T>(path: string, body: Record<string, unknown>) => {
  const token = await getAuthToken();
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Error en servidor");
  }
  return data as T;
};
