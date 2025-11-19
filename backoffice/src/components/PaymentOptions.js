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

  const toggleUPI = () => {
    setSelectedMethod("upi");
    setShowUPI((prev) => !prev);
  };

  const toggleCard = () => {
    setSelectedMethod("card");
    setShowUPI(false);
  };

  // Load Razorpay script
  const loadScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Mobile UPI: system chooser
  const initiateMobileUPI = async () => {
    if (!isMobile) return;

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

          if (verifyRes?.status === "success") navigate("/success");
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

  // Desktop UPI: manual UPI ID
  const initiateDesktopUPI = async () => {
    if (isMobile) return; // mobile handled separately

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
          vpa: upiId,
        },
        handler: async function (response) {
          const verifyRes = await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes?.status === "success") navigate("/success");
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

  const handleUPIPay = () => {
    if (isMobile) initiateMobileUPI();
    else initiateDesktopUPI();
  };

  // -------------------------------
  // CARD PAY
  // -------------------------------
  const handleCardPay = async () => {
    if (!isMobile) {
      // Desktop / Laptop: open Razorpay card popup
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
            card: true,
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

            if (verifyRes?.status === "success") navigate("/success");
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
    } else {
      alert("Card payments are supported on laptop/desktop only for now.");
    }
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
          {!isMobile && (
            <>
              <label>Enter UPI ID</label>
              <input
                type="text"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </>
          )}
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

      {selectedMethod === "card" && (
        <div className="card-section">
          <p>You will enter card details in Razorpay popup.</p>
          <button className="pay-btn" onClick={handleCardPay}>
            {loading ? "Processing..." : `Pay ₹${totalAmount}`}
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
