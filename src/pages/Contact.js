import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./contact.css";

import { apiGet, apiPost } from "../utils/apiClient";
import { validateContactForm } from "../utils/validation";
import { success, error as showError } from "../utils/toastNotification";
import { setSEOTags } from "../utils/seoUtils";
import { SkeletonLoading } from "../components/Skeleton";

const CONTACT_INFO_URL = "/contact_info";
const CONTACT_MESSAGE_URL = "/contact_message";

export default function Contact() {
  const navigate = useNavigate();

  // ---------------- FORM STATE ----------------
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: ""
  });

  const [formErrors, setFormErrors] = useState({});

  // ---------------- BACKEND CONTACT INFO ----------------
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ---------------- SEO ----------------
  useEffect(() => {
    setSEOTags(
      "Contact Us - Hilltop Junior School",
      "Get in touch with Hilltop Junior School. We are here to answer your questions and discuss enrollment.",
      "contact, reach out, inquiries, support"
    );
  }, []);

  // ---------------- FETCH CONTACT INFO ----------------
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await apiGet(CONTACT_INFO_URL);

        setContactInfo({
          email: data?.email || data?.[0]?.email || "",
          phone: data?.phone_number || data?.[0]?.phone_number || "",
          location: data?.address || data?.[0]?.address || "",
          googleMapLink: data?.map_embed_url || data?.[0]?.map_embed_url || ""
        });
      } catch (err) {
        console.error("Error fetching contact info:", err);
        setContactInfo({
          email: "",
          phone: "",
          location: "",
          googleMapLink: ""
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // ---------------- SUBMIT FORM ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateContactForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);

    try {
      await apiPost(CONTACT_MESSAGE_URL, {
        first_name: formData.fullName.split(" ")[0],
        last_name: formData.fullName.split(" ").slice(1).join(" ") || " ",
        email: formData.email,
        phone: formData.phone,
        message: `Inquiry Type: ${formData.inquiryType}\n\n${formData.message}`
      });

      success("Message sent successfully!");

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        inquiryType: "",
        message: ""
      });
    } catch (err) {
      console.error("Submit error:", err);
      showError(err.message || "Error sending message");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <SkeletonLoading count={3} />
      </div>
    );
  }

  return (
    <div className="contact-page">

      {/* ---------------- CONTACT INFO ---------------- */}
      <section className="reach-section">
        <h3>Reach to Us</h3>

        <div className="reach-boxes">
          <div className="box">
            <h4>Email</h4>
            <p>{contactInfo?.email || "Not set in dashboard"}</p>
          </div>

          <div className="box">
            <h4>Phone</h4>
            <p>{contactInfo?.phone || "Not set in dashboard"}</p>
          </div>

          <div className="box">
            <h4>Location</h4>
            <p>{contactInfo?.location || "Not set in dashboard"}</p>
          </div>
        </div>
      </section>

      {/* ---------------- FORM ---------------- */}
      <section className="form-section">
        <h3>Send Us a Message</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className={formErrors.fullName ? "input-error" : ""}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? "input-error" : ""}
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className={formErrors.phone ? "input-error" : ""}
            />

            <input
              type="text"
              name="inquiryType"
              placeholder="Inquiry Type"
              value={formData.inquiryType}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="message"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            className={formErrors.message ? "input-error" : ""}
          />

          <button type="submit" className="send-btn" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>

      {/* ---------------- MAP ---------------- */}
      {contactInfo?.googleMapLink && (
        <section className="location-section">
          <div className="location-text">
            <p><strong>Our Location</strong></p>
            <p>{contactInfo.location}</p>
            <p>{contactInfo.email}</p>
          </div>

          <a href={contactInfo.googleMapLink} target="_blank" rel="noreferrer">
            <button className="map-btn">Open Google Map</button>
          </a>
        </section>
      )}

      {/* ---------------- ADMIN BUTTON ---------------- */}
      <div className="admin-login">
        <button
          className="admin-btn"
          onClick={() => navigate("/admin/login")}
        >
          Admin Login
        </button>
      </div>

    </div>
  );
}
