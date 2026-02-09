import { getAuth } from "firebase/auth";

const getAuthToken = async () => {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error("Usuario no autenticado");
  }
  return user.getIdToken();
};

export const createPaypalSubscription = async (planCode: "PRO" | "PLUS") => {
  const token = await getAuthToken();
  const response = await fetch("/api/paypal/create-subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planCode }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "No se pudo crear la suscripcion");
  }

  return data as { approvalUrl: string; subscriptionId: string };
};

export const getPaypalManageUrl = () => {
  const custom = import.meta.env.VITE_PAYPAL_MANAGE_URL as string | undefined;
  if (custom) return custom;
  const env = (import.meta.env.VITE_PAYPAL_ENV || "live").toLowerCase();
  return env === "sandbox"
    ? "https://www.sandbox.paypal.com/myaccount/autopay/"
    : "https://www.paypal.com/myaccount/autopay/";
};
