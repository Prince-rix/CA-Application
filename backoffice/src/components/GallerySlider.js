// GallerySlider.js
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "./GallerySlider.css";

const images = [
  "https://cdn.britannica.com/19/93419-050-6381B963/Western-Wall-remains-Jerusalem-Second-Temple-Dome.jpg",
  "https://www.nextleveloftravel.com/data/blog/8528/sacred-wonders-discover-13-unforgettable-holy-sites-in-israel-.jpg",
  "https://dailyverses.net/images/en/niv/xl/isaiah-60-1-2.jpg"
];

export default function GallerySlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    swipe: true,
    arrows: true
  };

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {images.map((img, idx) => (
          <div key={idx}>
            <img src={img} alt={`Jerusalem ${idx + 1}`} className="slider-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
}
