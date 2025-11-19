import React from "react";
import { useNavigate } from "react-router-dom";
import "./Success.css";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">
          Thank you for registering for the District Christ Ambassadors Program.
        </p>
        <div className="success-details">
          <div className="detail-row">
            <span>Amount Paid:</span>
            <span className="amount">₹250</span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span className="status">Confirmed</span>
          </div>
        </div>
        <p className="success-note">
          A confirmation email has been sent to your registered email address.
        </p>
        <button 
          className="home-button" 
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}