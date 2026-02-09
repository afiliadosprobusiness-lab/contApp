const getPaypalEnv = () => (process.env.PAYPAL_ENV || "live").toLowerCase();

export const getPaypalBaseUrl = () => {
  return getPaypalEnv() === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
};

export const getPaypalToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description || "PayPal auth error");
  }

  return data.access_token;
};
