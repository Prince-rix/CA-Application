import React, { useState } from "react";
import { createUser } from "../api";
import "./RegistrationForm.css";

export default function RegistrationForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    church_name: "",
    section: "Central Section"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createUser(formData);
      if (res.data.status === "success" && res.data.data?.id) {
        // Call parent callback to navigate
        onRegisterSuccess(res.data.data.id);
      } else {
        alert(res.data.message || "Error creating user");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating user");
    }
  };

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
      <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
      <input type="number" name="age" placeholder="Age" onChange={handleChange} required />
      <input type="text" name="church_name" placeholder="Church Name" onChange={handleChange} required />
      <select name="section" value={formData.section} onChange={handleChange}>
        <option value="Central Section">Central Section</option>
        <option value="Western Section">Western Section</option>
      </select>
      <button type="submit" className="submit-btn">Register</button>
    </form>
  );
}
