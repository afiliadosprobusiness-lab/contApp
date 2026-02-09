import { postWithAuth } from "@/lib/backend";

export const createPaypalSubscription = async (planCode: "PRO" | "PLUS") => {
  return postWithAuth<{ approvalUrl: string; subscriptionId: string }>("/paypal/create-subscription", { planCode });
};

export const getPaypalManageUrl = () => {
  const custom = import.meta.env.VITE_PAYPAL_MANAGE_URL as string | undefined;
  if (custom) return custom;
  const env = (import.meta.env.VITE_PAYPAL_ENV || "live").toLowerCase();
  return env === "sandbox"
    ? "https://www.sandbox.paypal.com/myaccount/autopay/"
    : "https://www.paypal.com/myaccount/autopay/";
};
