import { firebaseAdmin, firestore } from "../_firebaseAdmin.js";
import { getPaypalBaseUrl, getPaypalToken } from "../_paypal.js";

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
};

const getPlanId = (planCode) => {
  if (planCode === "PRO") return process.env.PAYPAL_PLAN_ID_PRO;
  if (planCode === "PLUS") return process.env.PAYPAL_PLAN_ID_PLUS;
  return null;
};

const getBaseUrl = (req) => {
  return (
    process.env.APP_BASE_URL ||
    req.headers.origin ||
    `https://${req.headers.host}`
  );
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const { planCode } = req.body || {};
    const planId = getPlanId(planCode);
    if (!planCode || !planId) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const baseUrl = getBaseUrl(req);
    const returnUrl = `${baseUrl}/dashboard/plan?paypal=success`;
    const cancelUrl = `${baseUrl}/dashboard/plan?paypal=cancel`;

    const accessToken = await getPaypalToken();
    const response = await fetch(`${getPaypalBaseUrl()}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: `${uid}:${planCode}`,
        application_context: {
          brand_name: "ContApp Peru",
          locale: "es-PE",
          user_action: "SUBSCRIBE_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.message || "PayPal error" });
    }

    const approval = data?.links?.find((link) => link.rel === "approve");
    if (!approval?.href) {
      return res.status(500).json({ error: "No approval link" });
    }

    const userRef = firestore.collection("users").doc(uid);
    await userRef.set(
      {
        paypalSubscriptionId: data.id,
        paypalPlanId: planId,
        pendingPlan: planCode,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ approvalUrl: approval.href, subscriptionId: data.id });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Server error" });
  }
}
