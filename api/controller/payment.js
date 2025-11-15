const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const db = require("../model");
const { sequelize } = require("../config/dbconnection");

const FIXED_AMOUNT = 250; // INR

// Create Razorpay order
async function createOrderInternal(data) {
    const options = {
        amount: FIXED_AMOUNT * 100,
        currency: "INR",
        receipt: String(data.user_id),
        notes: { userId: data.user_id },
    };

    const order = await razorpay.orders.create(options);

    if (!order) return { status: "error", message: "Order creation failed" };

    await db.Registration.update({
        razorpay_order_id: order.id,
        status: "created",
        amount: FIXED_AMOUNT,
        payment_provider: "razorpay"
    }, { where: { id: data.user_id } });

    return { status: "success", message: "Order created", data: order };
}

// Verify payment (frontend)
async function verifyPaymentInternal(data) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return { status: "error", message: "Missing payment details" };
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    const reg = await db.Registration.findOne({ where: { razorpay_order_id } });

    if (expectedSignature !== razorpay_signature) {
        if (reg) {
            await db.Registration.update({ status: "failed" }, { where: { razorpay_order_id } });
        }
        return { status: "error", message: "Signature verification failed" };
    }

    if (reg) {
        await db.Registration.update({
            status: "success",
            payment_id: razorpay_payment_id,
            razorpay_signature
        }, { where: { razorpay_order_id } });
    }

    return { status: "success", message: "Payment verified successfully", data: { razorpay_payment_id } };
}

// Razorpay webhook
async function webhookHandler(req) {
    const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
    const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
    const incomingSignature = req.headers["x-razorpay-signature"] || "";

    if (!incomingSignature || expectedSignature !== incomingSignature) {
        return { status: "error", message: "Invalid webhook signature" };
    }

    const payload = typeof req.body === "string" ? JSON.parse(rawBody) : req.body;
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (!payment) return { status: "error", message: "Invalid payload" };

    const orderId = payment.order_id;

    if (event === "payment.captured") {
        await db.Registration.update({ status: "success", payment_id: payment.id }, { where: { razorpay_order_id: orderId } });
        return { status: "success", message: "Payment captured" };
    }

    if (event === "payment.failed") {
        await db.Registration.update({ status: "failed", payment_id: payment.id }, { where: { razorpay_order_id: orderId } });
        return { status: "success", message: "Payment failed updated" };
    }

    if (event === "payment.authorized") {
        await db.Registration.update({ status: "authorized", payment_id: payment.id }, { where: { razorpay_order_id: orderId } });
        return { status: "success", message: "Payment authorized" };
    }

    return { status: "success", message: "Event ignored" };
}

module.exports = {
    async createOrder(req, res) {
        try {
            const { user_id } = req.body;
            if (!user_id) return res.json({ status: "error", message: "user_id required" });

            const registration = await db.Registration.findOne({ where: { id: user_id } });
            if (!registration) return res.json({ status: "error", message: "User not found" });

            const orderRes = await createOrderInternal({ user_id });
            if(orderRes.status == 'error'){
                return res.json(orderRes)
            }
            return res.json(orderRes);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ status: "error", message: err.message });
        }
    },
    async verifyPayment(req, res) {
        try {
            const verifyRes = await verifyPaymentInternal(req.body);
            if(verifyRes.status == 'error'){
                return res.json(verifyRes)
            }
            return res.json(verifyRes)
        } catch (err) {
            console.error(err);
            return res.status(500).json({ status: "error", message: err.message });
        }
    },
    async webhook(req, res) {
        try {
            const resp = await webhookHandler(req);
            return res.status(200).json(resp);
        } catch (err) {
            console.error("Webhook error", err);
            return res.status(500).json({ status: "error", message: err.message });
        }
    },
};
