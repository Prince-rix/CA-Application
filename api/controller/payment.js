const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const db = require("../model");
const { sequelize } = require("../config/dbconnection");

// FIXED amount
const FIXED_AMOUNT = 250; // INR

// Create order: create Razorpay order and store razorpay_order_id in registrations
async function createOrderInternal(data) {
  const options = {
    amount: FIXED_AMOUNT * 100, // paise
    currency: "INR",
    receipt: String(data.user_id),
    notes: { userId: data.user_id },
  };

  const order = await razorpay.orders.create(options);
  if (!order) {
    return { status: "error", message: "Order creation failed" };
  }

  // Save razorpay_order_id to registration row (so we can find it later)
  await db.Registration.update(
    {
      razorpay_order_id: order.id,
      status: "created",
      amount: FIXED_AMOUNT,
      payment_provider: "razorpay",
    },
    { where: { id: data.user_id } }
  );

  return { status: "success", message: "Order created", data: order };
}

// Verify payment (called by frontend after checkout)
async function verifyPaymentInternal(data) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return { status: "error", message: "Missing payment details" };
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // find registration row to update user id (optional)
  const reg = await db.Registration.findOne({ where: { razorpay_order_id } });

  if (expectedSignature !== razorpay_signature) {
    // signature mismatch — mark failed / suspicious
    if (reg) {
      await db.Registration.update(
        { status: "failed", razorpay_signature: razorpay_signature, payment_provider: "razorpay"},
        { where: { razorpay_order_id } }
      );
    }
    return { status: "error", message: "Signature verification failed" };
  }

  // signature OK -> update registration to success
  if (reg) {
    await db.Registration.update(
      {
        status: "success",
        payment_provider: "razorpay",
        payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
      },
      { where: { razorpay_order_id } }
    );
  }

  return { status: "success", message: "Payment verified successfully", data: { razorpay_payment_id } };
}

// Webhook handler — expects raw body (server configured for /api/webhook raw)
// handles payment.captured and payment.failed, authorized etc.
async function webhookHandler(req) {
  // body may be Buffer (raw) or parsed JSON (if not using raw)
  const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
  const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

  // compute HMAC on raw body
  const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  const incomingSignature = (req.headers["x-razorpay-signature"] || "").toString();

  if (!incomingSignature || expectedSignature !== incomingSignature) {
    console.warn("Invalid webhook signature");
    return { status: "error", message: "Invalid webhook signature" };
  }

  // parse payload JSON
  const payload = typeof req.body === "string" ? JSON.parse(rawBody) : req.body;
  const event = payload.event;
  const payment = payload.payload?.payment?.entity;

  if (!payment) {
    return { status: "error", message: "Invalid payload" };
  }

  const orderId = payment.order_id;
  const userIdFromNotes = payment.notes?.userId;

  // payment captured -> success
  if (event === "payment.captured") {
    // update registrations
    await db.Registration.update(
      {
        status: "success",
        payment_provider: "razorpay",
        payment_id: payment.id,
        razorpay_signature: incomingSignature
      },
      { where: { razorpay_order_id: orderId } }
    );
    return { status: "success", message: "Payment captured" };
  }

  // payment failed -> failed
  if (event === "payment.failed") {
    await db.Registration.update(
      {
        status: "failed",
        payment_provider: "razorpay",
        payment_id: payment.id
      },
      { where: { razorpay_order_id: orderId } }
    );
    return { status: "success", message: "Payment failed updated" };
  }

  // payment authorized (authorized but not captured)
  if (event === "payment.authorized") {
    await db.Registration.update(
      {
        status: "authorized",
        payment_provider: "razorpay",
        payment_id: payment.id
      },
      { where: { razorpay_order_id: orderId } }
    );
    return { status: "success", message: "Payment authorized" };
  }

  // other events -> no-op
  return { status: "success", message: "Event ignored" };
}

module.exports = {
  // POST /api/create/order
  async createOrder(req, res) {
    try {
      const body = req.body;
      if (!body || !body.user_id) {
        return res.json({ status: "error", message: "user_id required" });
      }

      // ensure registration exists (optional)
      const registration = await db.Registration.findOne({ where: { id: body.user_id } });
      if (!registration) {
        return res.json({ status: "error", message: "User not found" });
      }

      const resp = await createOrderInternal(body);
      return res.json(resp);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },

  // POST /api/payment/success (frontend calls this with order/payment/signature)
  async verifyPayment(req, res) {
    try {
      const resp = await verifyPaymentInternal(req.body);
      return res.json(resp);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },

  // POST /api/webhook  (Razorpay -> your server)
  async webhook(req, res) {
    try {
      const resp = await webhookHandler(req);
      // reply 200 quickly so Razorpay doesn't retry
      return res.status(200).json(resp);
    } catch (err) {
      console.error("Webhook error", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },
};
