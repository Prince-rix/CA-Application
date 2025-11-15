import React, { useState } from "react";
import { createOrder, verifyPayment } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "./PaymentOptions.css";
import '@fortawesome/fontawesome-free/css/all.min.css'; // Font Awesome

export default function PaymentOptions() {
  const navigate = useNavigate();
  const { id: user_id } = useParams();

  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(""); // user must select
  const amount = 250; // registration fee

  // Block rendering if no user_id
  if (!user_id) {
    navigate("/", { replace: true });
    return null; // prevent rendering
  }

  const loadRazorpaySdk = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  async function startPayment() {
    if (!selectedMethod) {
      alert("Please select a payment method before proceeding.");
      return;
    }

    try {
      setLoading(true);

      const resp = await createOrder({ user_id });
      if (!resp || !resp.data || resp.data.status !== "success") {
        throw new Error("Order creation failed");
      }

      const orderObj = resp.data.data;
      const sdkLoaded = await loadRazorpaySdk();
      if (!sdkLoaded) {
        alert("Razorpay SDK failed to load.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_123456789",
        amount: orderObj.amount,
        currency: orderObj.currency || "INR",
        name: "District Christ Ambassadors Program",
        description: `Registration Fee - ₹${amount}`,
        order_id: orderObj.id,
        notes: { userId: user_id },
        handler: async (response) => {
          try {
            const verifyResp = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResp.data.status === "success") {
              navigate("/success");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        theme: { color: "#f7971e" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        alert("Payment failed or cancelled.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  }

  const getButtonClass = (method) => {
    return `method-btn ${selectedMethod === method ? "selected" : ""}`;
  };

  return (
    <div className="payment-options">
      <div className="payment-card">
        <h2>Choose Payment Method</h2>
        <p style={{ fontSize: "18px", color: "#f7971e", marginBottom: "20px" }}>
          Registration Fee: <strong>₹{amount}</strong>
        </p>

        <div className="method-block">
          <h3>UPI</h3>
          <button
            className={getButtonClass("upi")}
            onClick={() => setSelectedMethod("upi")}
          >
            <i className="fa-brands fa-google-pay fa-2x"></i>
            <span>Pay via UPI</span>
          </button>
        </div>

        <div className="method-block">
          <h3>Credit / Debit Card</h3>
          <button
            className={getButtonClass("card")}
            onClick={() => setSelectedMethod("card")}
          >
            <i className="fa-regular fa-credit-card fa-2x"></i>
            <span>Pay by Card</span>
          </button>
        </div>

        <div className="method-block">
          <h3>Wallets / Netbanking</h3>
          <button
            className={getButtonClass("wallet")}
            onClick={() => setSelectedMethod("wallet")}
          >
            <i className="fa-brands fa-amazon-pay fa-2x"></i>
            <span>Pay via Wallet</span>
          </button>
        </div>

        <button
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            width: "100%",
            background: "#f7971e",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
          onClick={startPayment}
          disabled={loading}
        >
          {loading ? "Processing Payment..." : `Pay ₹${amount}`}
        </button>
      </div>
    </div>
  );
}
