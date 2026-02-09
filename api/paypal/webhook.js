import { firebaseAdmin, firestore } from "../_firebaseAdmin.js";
import { getPaypalBaseUrl, getPaypalToken } from "../_paypal.js";

const getHeader = (req, name) => {
  const key = name.toLowerCase();
  return req.headers[key];
};

const planFromId = (planId) => {
  if (!planId) return null;
  if (planId === process.env.PAYPAL_PLAN_ID_PRO) return "PRO";
  if (planId === process.env.PAYPAL_PLAN_ID_PLUS) return "PLUS";
  return null;
};

const findUserBySubscription = async (subscriptionId) => {
  if (!subscriptionId) return null;
  const snap = await firestore
    .collection("users")
    .where("paypalSubscriptionId", "==", subscriptionId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0];
};

const verifyWebhook = async (req, event) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error("Missing PAYPAL_WEBHOOK_ID");
  }

  const accessToken = await getPaypalToken();
  const payload = {
    auth_algo: getHeader(req, "paypal-auth-algo"),
    cert_url: getHeader(req, "paypal-cert-url"),
    transmission_id: getHeader(req, "paypal-transmission-id"),
    transmission_sig: getHeader(req, "paypal-transmission-sig"),
    transmission_time: getHeader(req, "paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: event,
  };

  const response = await fetch(`${getPaypalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "PayPal webhook verify error");
  }

  return data?.verification_status === "SUCCESS";
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const ok = await verifyWebhook(req, event);
    if (!ok) {
      return res.status(400).json({ error: "Webhook not verified" });
    }

    const type = event?.event_type || "";
    const resource = event?.resource || {};
    const subscriptionId = resource?.id;
    const planId = resource?.plan_id;
    const planCode = planFromId(planId);
    const customId = resource?.custom_id;
    const [customUid, customPlan] = (customId || "").split(":");
    const uid = customUid || customId || null;

    let userDoc = null;
    if (uid) {
      userDoc = firestore.collection("users").doc(uid);
    } else {
      const found = await findUserBySubscription(subscriptionId);
      userDoc = found ? found.ref : null;
    }

    if (!userDoc) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const updates = {
      paypalSubscriptionId: subscriptionId || null,
      paypalPlanId: planId || null,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    if (type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      updates.status = "ACTIVE";
      if (planCode || customPlan) updates.plan = planCode || customPlan;
      updates.pendingPlan = firebaseAdmin.firestore.FieldValue.delete();
    }

    if (
      type === "BILLING.SUBSCRIPTION.CANCELLED" ||
      type === "BILLING.SUBSCRIPTION.SUSPENDED" ||
      type === "BILLING.SUBSCRIPTION.EXPIRED" ||
      type === "BILLING.SUBSCRIPTION.PAYMENT.FAILED"
    ) {
      updates.status = "SUSPENDED";
      updates.pendingPlan = firebaseAdmin.firestore.FieldValue.delete();
    }

    if (type === "BILLING.SUBSCRIPTION.UPDATED") {
      if (resource?.status === "ACTIVE") {
        updates.status = "ACTIVE";
        if (planCode || customPlan) updates.plan = planCode || customPlan;
        updates.pendingPlan = firebaseAdmin.firestore.FieldValue.delete();
      }
    }

    await userDoc.set(updates, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Webhook error" });
  }
}
