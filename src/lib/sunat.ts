import { getAuth } from "firebase/auth";

const getApiBase = () => {
  const raw = import.meta.env.VITE_SUNAT_API_URL || "http://localhost:8080";
  const cleaned = String(raw).trim();
  return cleaned.endsWith("/") ? cleaned.slice(0, -1) : cleaned;
};

const getAuthToken = async () => {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error("Usuario no autenticado");
  }
  return user.getIdToken();
};

const getJson = async (path: string) => {
  const token = await getAuthToken();
  const response = await fetch(`${getApiBase()}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Error en servidor SUNAT");
  }
  return data;
};

const postJson = async (path: string, body: Record<string, unknown>) => {
  const token = await getAuthToken();
  const response = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Error en servidor SUNAT");
  }
  return data;
};

export const saveSunatCredentials = async (payload: {
  businessId: string;
  ruc: string;
  solUser: string;
  solPassword: string;
}) => {
  return postJson("/sunat/credentials", payload);
};

export const saveSunatCertificate = async (payload: {
  businessId: string;
  filename?: string;
  pfxBase64: string;
  pfxPassword: string;
}) => {
  return postJson("/sunat/certificate", payload);
};

export const getSunatCertificateStatus = async (payload: { businessId: string }) => {
  const query = new URLSearchParams({ businessId: payload.businessId }).toString();
  return getJson(`/sunat/certificate/status?${query}`) as Promise<{
    ok: true;
    configured: boolean;
    filename?: string | null;
    sizeBytes?: number | null;
    sha256?: string | null;
    updatedAt?: any;
    createdAt?: any;
  }>;
};

export const syncSunat = async (payload: { businessId: string; year: number; month: number }) => {
  return postJson("/sunat/sync", payload);
};

export const lookupRuc = async (payload: { ruc: string }) => {
  return postJson("/sunat/ruc", payload);
};
