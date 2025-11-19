import React, { useState } from "react";
import { createOrder, verifyPayment } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "./PaymentOptions.css";

export default function PaymentOptions() {
  const navigate = useNavigate();
  const { id: user_id } = useParams();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showUPI, setShowUPI] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = 250;
  const totalAmount = amount;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 👉 UPI App Deep Links
  const upiApps = {
    gpay: "upi://pay?pa=yourupi@upi&pn=DistrictCA&am=250",
    phonepe: "phonepe://pay?pa=yourupi@upi&pn=DistrictCA&am=250",
    paytm: "paytmmp://pay?pa=yourupi@upi&pn=DistrictCA&am=250",
    bhim: "upi://pay?pa=yourupi@upi&pn=DistrictCA&am=250",
  };

  const openUPIApp = (app) => {
    if (isMobile) {
      window.location.href = upiApps[app]; // redirect to app
    } else {
      alert("You are on a laptop. Please enter your UPI ID manually.");
    }
  };

  const toggleUPI = () => {
    setSelectedMethod("upi");
    setShowUPI((prev) => !prev);
  };

  const toggleCard = () => {
    setSelectedMethod("card");
    setShowUPI(false);
  };

  // -------------------------------
  // ⭐ NEW: Load Razorpay script
  // -------------------------------
  const loadScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // -------------------------------
  // ⭐ NEW: Laptop UPI flow
  // -------------------------------
  const initiateUPIPayment = async () => {
    if (isMobile) return; // mobile handled using deep links

    if (!upiId) {
      alert("Please enter UPI ID");
      return;
    }

    setLoading(true);

    const loaded = await loadScript();
    if (!loaded) {
      alert("Failed to load Razorpay");
      setLoading(false);
      return;
    }

    try {
      const orderRes = await createOrder({ user_id });

      if (!orderRes?.data?.id) {
        alert("Order creation failed");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: totalAmount * 100,
        currency: "INR",
        name: "District CA",
        description: "Registration Payment",
        order_id: orderRes.data.id,

        method: {
          upi: true,
        },

        prefill: {
          email: "test@mail.com",
          contact: "9999999999",
        },

        handler: async function (response) {
          const verifyRes = await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes?.status === "success") navigate("/payment-success");
          else navigate("/payment-failed");
        },

        theme: { color: "#0a66c2" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.log(err);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  // -------------------------------
  // ⭐ NEW: Decide button action
  // -------------------------------
  const handleUPIPay = () => {
    if (isMobile) {
      alert("Select a UPI app icon below.");
      return;
    }
    initiateUPIPayment();
  };

  return (
    <div className="payment-wrapper">
      <h2>Complete Payment</h2>

      {/* UPI OPTION */}
      <div
        className={`method-box ${selectedMethod === "upi" ? "active" : ""}`}
        onClick={toggleUPI}
      >
        <div className="method-title">UPI</div>
        <div className="method-sub">Pay using any UPI app</div>
      </div>

      {showUPI && (
        <div className="upi-section">
          <label>Enter UPI ID</label>
          <input
            type="text"
            placeholder="example@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />

          <div className="upi-icons">
            <img
              src="/icons/google-icon-logo-svgrepo-com.svg"
              alt="Google Pay"
              onClick={() => openUPIApp("gpay")}
            />
            <img
              src="/icons/phonepe-icon.svg"
              alt="PhonePe"
              onClick={() => openUPIApp("phonepe")}
            />
            <img
              src="/icons/paytm-icon.svg"
              alt="Paytm"
              onClick={() => openUPIApp("paytm")}
            />
            <img
              src="/icons/bhim-upi-icon.svg"
              alt="BHIM"
              onClick={() => openUPIApp("bhim")}
            />
          </div>

          {/* ⭐ UPDATED BUTTON */}
          <button className="pay-btn" onClick={handleUPIPay}>
            {loading ? "Processing..." : `Pay ₹${totalAmount}`}
          </button>
        </div>
      )}

      {/* CARD OPTION */}
      <div
        className={`method-box ${selectedMethod === "card" ? "active" : ""}`}
        onClick={toggleCard}
      >
        <div className="method-title">Card (Debit/Credit)</div>
        <div className="method-sub">Enter card details securely</div>
      </div>

      {selectedMethod === "card" && !showUPI && (
        <div className="card-section">
          <p>You will enter card details in Razorpay popup.</p>

          <button className="pay-btn">Pay ₹{totalAmount}</button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="summary-box">
        <div className="summary-row">
          <span>Registration Fee</span>
          <span>₹{amount}</span>
        </div>

        <div className="summary-total">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>
    </div>
  );
}
