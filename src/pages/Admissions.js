import React, { useEffect, useState } from "react";
import "./admissions.css";
import { apiGet, apiPost } from "../utils/apiClient";
import { validateAdmissionsForm } from "../utils/validation";
import { success, error as showError } from "../utils/toastNotification";
import { setSEOTags } from "../utils/seoUtils";
import { SkeletonLoading } from "../components/Skeleton";

const API_URL = "/admissions";
const API_BASE_URL = process.env.REACT_APP_API_URL || "";
const getImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (API_BASE_URL) return `${API_BASE_URL}/${value}`;
  return value.startsWith("/") ? value : `/${value}`;
};

export default function Admissions() {
  const [admissionData, setAdmissionData] = useState(null);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSEOTags(
      "Admissions - School",
      "Apply for admission",
      "admissions, school, apply"
    );
  }, []);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const data = await apiGet(API_URL);

        setAdmissionData(data || {});

        let img = "";
        const heroSource = data.hero_image || data.heroImage;

        if (heroSource) {
          img = getImageUrl(heroSource);
        } else if (Array.isArray(data?.hero_images) && data.hero_images.length > 0) {
          const random =
            data.hero_images[
              Math.floor(Math.random() * data.hero_images.length)
            ];

          img = getImageUrl(random);
        }

        setHeroImage(img);
        setErr(null);
      } catch (err) {
        console.error("Admissions fetch error:", err);
        setErr(err.message);
        setAdmissionData({});
        setHeroImage("");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, []);

  const handleInputChange = (e) => {
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

  const [formData, setFormData] = useState({
    student_name: "",
    date_of_birth: "",
    parent_name: "",
    parent_email: "",
    grade_applied: "",
    contact_number: "",
    message: ""
  });

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    const errors = validateAdmissionsForm(formData);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError("Fix form errors first");
      return;
    }

    setSubmitting(true);

    try {
      await apiPost("/admissions/apply", formData);

      success("Application submitted successfully!");

      setShowModal(false);

      setFormData({
        student_name: "",
        date_of_birth: "",
        parent_name: "",
        parent_email: "",
        grade_applied: "",
        contact_number: "",
        message: ""
      });
    } catch (err) {
      console.error(err);
      showError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const normalizeAdmissionRequirement = (req) => {
    if (!req) return null;
    if (typeof req === "string") {
      return {
        title: "",
        items: [req]
      };
    }

    if (typeof req === "object") {
      return {
        title: req.title || req.name || "",
        items: Array.isArray(req.items)
          ? req.items
          : typeof req.items === "string"
          ? [req.items]
          : req.options || []
      };
    }

    return null;
  };

  const admissionRequirements = Array.isArray(admissionData?.requirements)
    ? admissionData.requirements
    : [];

  const admissionSteps = Array.isArray(admissionData?.steps)
    ? admissionData.steps
    : [];

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <SkeletonLoading count={4} />
      </div>
    );
  }

  const data = admissionData || {};
  const normalizedRequirements = admissionRequirements
    .map(normalizeAdmissionRequirement)
    .filter(Boolean);
  const flatRequirements = normalizedRequirements.flatMap((req) => req.items || []);
  const normalizedSteps = admissionSteps.map((step) =>
    typeof step === "string" ? step : step.title || step
  );

  return (
    <div
      className="admissions-page"
      style={{
        backgroundImage: heroImage
          ? `linear-gradient(rgba(7, 15, 32, 0.75), rgba(7, 15, 32, 0.75)), url(${heroImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="admissions-backdrop" />
      <div className="admissions-wrapper">
        <section className="admissions-hero-card">
          <div className="hero-chip">Admissions Requirements</div>
          <h1>{data.title || "Admissions Open"}</h1>
          <h2 className="hero-subtitle">
            {data.subtitle || "Register your child for a bright academic future."}
          </h2>
          <p className="hero-description">
            {data.description || "Apply to our school today and benefit from quality teaching, character formation, and a caring learning environment."}
          </p>
        </section>

        <section className="admissions-highlights">
          <div className="highlight-card">
            <h3>Requirements</h3>
            {flatRequirements.length > 0 ? (
              <ul>
                {flatRequirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No requirements available yet. Please update from the dashboard.</p>
            )}
          </div>

          <div className="highlight-card">
            <h3>Application Process</h3>
            {normalizedSteps.length > 0 ? (
              <ol>
                {normalizedSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <p>No process steps published yet. Please update from the dashboard.</p>
            )}
          </div>
        </section>

        <section className="admissions-fees-card">
          <div className="fees-header">
            <h3>Fees Structure</h3>
            <span className="fees-subtitle">Fees are indicative and may change for the next intake.</span>
          </div>

          {data.fees?.items?.length > 0 ? (
            <div className="fees-grid">
              {data.fees.items.map((fee, index) => (
                <div key={index} className="fee-row">
                  <span>{fee.type || `Fee ${index + 1}`}</span>
                  <strong>{fee.amount || "TBA"}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-fees">No fee structure found. Update this from the admissions dashboard.</p>
          )}

          {data.fees?.registration && (
            <div className="registration-fee">
              <span>Registration Fee</span>
              <strong>{data.fees.registration}</strong>
            </div>
          )}
        </section>

        <div className="admissions-cta">
          <button onClick={() => setShowModal(true)}>
            {data.apply_button_text || "To Apply"}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply Now</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="application-form">
              <form onSubmit={handleSubmitApplication}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Student Name</label>
                    <input
                      name="student_name"
                      placeholder="Student Name"
                      value={formData.student_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Name</label>
                    <input
                      name="parent_name"
                      placeholder="Parent Name"
                      value={formData.parent_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Email</label>
                    <input
                      type="email"
                      name="parent_email"
                      placeholder="Email"
                      value={formData.parent_email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Grade Applied</label>
                    <input
                      name="grade_applied"
                      placeholder="Grade Applied"
                      value={formData.grade_applied}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      name="contact_number"
                      placeholder="Phone"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-actions">
                  <button className="submit-btn" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
