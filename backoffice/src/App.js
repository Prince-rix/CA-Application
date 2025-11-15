import React, { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import RegistrationForm from "./components/RegistrationForm";
import GallerySlider from "./components/GallerySlider";
import PaymentOptions from "./components/PaymentOptions";
import Success from "./components/Success";

import "./App.css";

function MainPage() {
  const galleryRef = useRef(null);
  const formRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-scroll to gallery after 5s
    setTimeout(() => {
      if (galleryRef.current)
        galleryRef.current.scrollIntoView({ behavior: "smooth" });
    }, 5000);

    // Auto-scroll to form after 9s
    setTimeout(() => {
      if (formRef.current)
        formRef.current.scrollIntoView({ behavior: "smooth" });
    }, 9000);
  }, []);

  return (
    <div className="app-container">
      <div className="hero-section">
        <h1>Greetings to All in the Name of the Lord Jesus Christ</h1>
        <p>
          Raise and Shine! We are excited for our District Christ Ambassadors
          Program. Please register and pay the fees to participate.
        </p>
      </div>

      <div className="gallery-section" ref={galleryRef}>
        <h2>Beautiful Jerusalem</h2>
        <GallerySlider />
      </div>

      <div ref={formRef}>
        {/* Pass onRegisterSuccess callback to RegistrationForm */}
        <RegistrationForm
          onRegisterSuccess={(userId) =>
            navigate(`/payment-options/${userId}`)
          }
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/payment-options/:id" element={<PaymentOptions />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}
