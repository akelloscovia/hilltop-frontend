import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./contact.css";
import { apiGet, apiPost } from "../utils/apiClient";
import { validateContactForm } from "../utils/validation";
import { success, error as showError } from "../utils/toastNotification";
import { setSEOTags } from "../utils/seoUtils";
import { SkeletonLoading } from "../components/Skeleton";

export default function Contact() {
  const navigate = useNavigate();

  // FORM DATA
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: ""
  });

  const [formErrors, setFormErrors] = useState({});

  // Default contact info
  const defaultContactInfo = {
    email: "info@hilltopjunior.ug",
    phone: "+256 771 234 567",
    location: "Kasangati, Wakiso District, Uganda",
    googleMapLink: "https://maps.google.com?q=Hilltop+Junior+School+Kasangati"
  };

  // CONTACT INFO FROM BACKEND
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Set SEO tags
  useEffect(() => {
    setSEOTags(
      'Contact Us - Hilltop Junior School',
      'Get in touch with Hilltop Junior School. We are here to answer your questions and discuss enrollment.',
      'contact, reach out, inquiries, support'
    );
  }, []);

  // FETCH CONTACT INFO
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await apiGet('/contact_info');
        setContactInfo(data);
      } catch (err) {
        console.error("Error fetching contact info:", err);
        setError(err.message);
        setContactInfo(defaultContactInfo);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // HANDLE FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateContactForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);

    try {
      await apiPost('/contact', formData);
      success("✅ Message sent successfully! We'll get back to you soon.");

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        inquiryType: "",
        message: ""
      });
    } catch (err) {
      console.error("Error submitting message:", err);
      showError(`❌ ${err.message || "Error sending message"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}><SkeletonLoading count={3} /></div>;
  }

  return (
    <div className="contact-page">

      {/* REACH TO US */}
      <section className="reach-section">
        <h3>Reach to Us</h3>
        <div className="reach-boxes">
          <div className="box">
            <h4>Email</h4>
            <p>{contactInfo?.email || "Loading..."}</p>
          </div>
          <div className="box">
            <h4>Phone</h4>
            <p>{contactInfo?.phone || "Loading..."}</p>
          </div>
          <div className="box">
            <h4>Location</h4>
            <p>{contactInfo?.location || "Loading..."}</p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="form-section">
        <h3>Send Us a Message</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <input 
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className={formErrors.fullName ? "input-error" : ""}
              />
              {formErrors.fullName && (
                <span className="error-text">⚠️ {formErrors.fullName}</span>
              )}
            </div>
            <div className="form-group">
              <input 
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className={formErrors.email ? "input-error" : ""}
              />
              {formErrors.email && (
                <span className="error-text">⚠️ {formErrors.email}</span>
              )}
            </div>
            <div className="form-group">
              <input 
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className={formErrors.phone ? "input-error" : ""}
              />
              {formErrors.phone && (
                <span className="error-text">⚠️ {formErrors.phone}</span>
              )}
            </div>
            <div className="form-group">
              <input 
                type="text"
                name="inquiryType"
                placeholder="Inquiry Type"
                value={formData.inquiryType}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              required
              className={formErrors.message ? "input-error" : ""}
            ></textarea>
            {formErrors.message && (
              <span className="error-text">⚠️ {formErrors.message}</span>
            )}
          </div>

          <button type="submit" className="send-btn" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>

      {/* LOCATION */}
      {contactInfo.googleMapLink && (
        <section className="location-section">
          <div className="location-text">
            <p><strong>Our Location</strong></p>
            <p>{contactInfo.location}</p>
            <p>Email: {contactInfo.email}</p>
          </div>

          <a href={contactInfo.googleMapLink} target="_blank" rel="noreferrer">
            <button className="map-btn">Open Google Map</button>
          </a>
        </section>
      )}

      {/* ✅ ADMIN LOGIN BUTTON */}
      <div className="admin-login">
        <button
          className="admin-btn"
          onClick={() => {
            alert("Admin login button clicked");
            navigate("/admin/login");
          }}
        >
          Admin Login
        </button>
      </div>

    </div>
  );
}