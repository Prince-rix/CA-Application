import React, { useEffect, useState } from "react";
import { createOrder, verifyPayment } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "./PaymentOptions.css";
import '@fortawesome/fontawesome-free/css/all.min.css'; // Font Awesome icons

export default function PaymentOptions() {
  const navigate = useNavigate();
  const { id: user_id } = useParams();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // User must register first
    if (!user_id) {
      alert("Please register first before proceeding to payment.");
      navigate("/");
    }
  }, [user_id, navigate]);

  const loadRazorpaySdk = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  async function startPayment(chosenMethod) {
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
        description: "Registration Fee - ₹250",
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

  return (
    <div className="payment-options">
      <div className="payment-card">
        <h2>Choose Payment Method</h2>

        <div className="method-block">
          <h3>UPI</h3>
          <button className="upi-btn" onClick={() => startPayment("upi")}>
            <i className="fa-brands fa-google-pay fa-2x"></i> Pay via UPI
          </button>
        </div>

        <div className="method-block">
          <h3>Credit / Debit Card</h3>
          <button className="card-btn" onClick={() => startPayment("card")}>
            <i className="fa-regular fa-credit-card fa-2x"></i> Pay by Card
          </button>
        </div>

        <div className="method-block">
          <h3>Wallets / Netbanking</h3>
          <button className="wallet-btn" onClick={() => startPayment("wallet")}>
            <i className="fa-brands fa-amazon-pay fa-2x"></i> Pay via Wallet
          </button>
        </div>

        {loading && <p className="loading">Opening payment...</p>}
      </div>
    </div>
  );
}
