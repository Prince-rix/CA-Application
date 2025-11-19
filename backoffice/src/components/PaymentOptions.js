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
            <img src="/icons/google-icon-logo-svgrepo-com.svg"
                 alt="Google Pay"
                 onClick={() => openUPIApp("gpay")} />
            <img src="/icons/phonepe-icon.svg"
                 alt="PhonePe"
                 onClick={() => openUPIApp("phonepe")} />
            <img src="/icons/paytm-icon.svg"
                 alt="Paytm"
                 onClick={() => openUPIApp("paytm")} />
            <img src="/icons/bhim-upi-icon.svg"
                 alt="BHIM"
                 onClick={() => openUPIApp("bhim")} />
          </div>

          <button className="pay-btn">
            Pay ₹{totalAmount}
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

          <button className="pay-btn">
            Pay ₹{totalAmount}
          </button>
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
