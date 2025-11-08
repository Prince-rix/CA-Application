import React, { useEffect, useRef } from "react";
import RegistrationForm from "./components/RegistrationForm";
import GallerySlider from "./components/GallerySlider";
import "./App.css";

function App() {
  const galleryRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      galleryRef.current.scrollIntoView({ behavior: "smooth" });
    }, 4000);

    const timer2 = setTimeout(() => {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const scrollToGallery = () => {
    galleryRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToForm = () => {
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-container">
      <div className="hero-section">
        <h1>Greetings to All in the Name of the Lord Jesus Christ</h1>
        <p>Raise and Shine! We are excited for our District Christ Ambassadors Program. Please register and pay the fees to participate.</p>
        <div className="down-arrow" onClick={scrollToGallery}>&#x2193;</div>
      </div>

      <div className="gallery-section" ref={galleryRef}>
        <h2>Beautiful Jerusalem</h2>
        <GallerySlider />
        <button className="scroll-btn" onClick={scrollToForm}>Please Register Now</button>
      </div>

      <div ref={formRef}>
        <RegistrationForm />
      </div>
    </div>
  );
}

export default App;
