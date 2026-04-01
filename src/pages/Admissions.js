import React, { useEffect, useState } from "react";
import "./admissions.css";
import { apiGet, apiPost } from "../utils/apiClient";
import { validateAdmissionsForm } from "../utils/validation";
import { success, error as showError } from "../utils/toastNotification";
import { setSEOTags } from "../utils/seoUtils";
import { SkeletonLoading } from "../components/Skeleton";

export default function Admissions() {
  const [admissionData, setAdmissionData] = useState(null);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    student_name: "",
    date_of_birth: "",
    parent_name: "",
    parent_email: "",
    grade_applied: "",
    contact_number: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Default fallback data
  const defaultData = {
    title: "Admissions",
    subtitle: "Welcome to Hilltop Junior School",
    description: "Join our vibrant learning community. We welcome students of all backgrounds.",
    requirements: [
      {
        title: "Age Requirements",
        items: ["Daycare: 2-3 years", "Kindergarten: 4-5 years", "Primary: 6+ years"]
      },
      {
        title: "Required Documents",
        items: ["Birth certificate", "Medical records", "Previous school records (if applicable)", "Parent identification"]
      }
    ],
    how_to_apply: {
      title: "How to Apply",
      steps: ["Complete the application form", "Submit required documents", "Schedule an interview", "Receive admission decision"]
    },
    fees: {
      items: [
        { type: "Daycare", amount: "UGX 2,000,000/term" },
        { type: "Kindergarten", amount: "UGX 2,500,000/term" },
        { type: "Primary", amount: "UGX 3,000,000/term" }
      ],
      registration: "UGX 500,000 (one-time)"
    },
    apply_button_text: "Apply Now"
  };

  // Set SEO tags
  useEffect(() => {
    setSEOTags(
      'Admissions - Hilltop Junior School',
      'Apply now for admission to Hilltop Junior School. Learn about our admission requirements, fees, and application process.',
      'admissions, apply, enrollment, school'
    );
  }, []);

  // Fetch admissions data
  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const data = await apiGet('/admissions');
        setAdmissionData(data);

        if (data?.hero_images?.length > 0) {
          const randomImage = data.hero_images[Math.floor(Math.random() * data.hero_images.length)];
          setHeroImage(`http://127.0.0.1:5000/${randomImage}`);
        }
      } catch (err) {
        console.error("Error fetching admissions data:", err);
        setErr(err.message);
        setAdmissionData(defaultData);
        setHeroImage("/images/placeholder.jpg");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, []);

  const handleInputChange = (e) => {
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

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateAdmissionsForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);

    try {
      await apiPost('/admissions/apply', formData);
      success("✅ Application submitted successfully! We'll contact you soon.");
      setShowModal(false);
      setFormData({
        student_name: "",
        date_of_birth: "",
        parent_name: "",
        parent_email: "",
        grade_applied: "",
        contact_number: ""
      });
    } catch (err) {
      console.error("Error submitting application:", err);
      showError(`❌ ${err.message || "Error submitting application"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}><SkeletonLoading count={4} /></div>;
  }

  const data = admissionData || defaultData;

  return (
    <div
      className="admissions-page"
      style={{
        backgroundImage: heroImage
          ? `linear-gradient(rgba(2, 21, 61, 0.8), rgba(10, 47, 146, 0.73)), url(${heroImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.6s ease-in-out",
      }}
    >
      <div className="admissions-wrapper">
        <section className="admissions-card">
          <header className="admissions-card-header">
            <h2>{data.title || "Admissions"}</h2>
            <h3>{data.subtitle || ""}</h3>
            <p>{data.description || ""}</p>
          </header>

          <div className="admissions-card-body">
            <div className="admissions-text">
              {data.requirements?.map((req, index) => (
                <div className="info-box" key={index}>
                  <h4>{req.title}</h4>
                  <ul>
                    {req.items?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {data.how_to_apply && (
                <div className="info-box">
                  <h4>{data.how_to_apply.title}</h4>
                  <ol>
                    {data.how_to_apply.steps?.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {data.image && (
              <div className="admissions-image">
                <img
                  src={`http://127.0.0.1:5000/${data.image}`}
                  alt="Admission"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/placeholder.jpg";
                  }}
                />
              </div>
            )}
          </div>

          {data.fees && (
            <div className="fees-section">
              <h4>Fees Structure</h4>
              <div className="fees-grid">
                {data.fees.items?.map((fee, index) => (
                  <div className="fee-box" key={index}>
                    <span>{fee.type}</span>
                    <strong>{fee.amount}</strong>
                  </div>
                ))}
              </div>
              {data.fees.registration && (
                <p className="fee-note">
                  Registration: {data.fees.registration}
                </p>
              )}
            </div>
          )}

          {data.apply_button_text && (
            <div className="apply">
              <button onClick={() => setShowModal(true)}>{data.apply_button_text}</button>
            </div>
          )}
          {err && <div style={{ textAlign: "center", color: "yellow", marginTop: "1rem" }}>Note: Showing default content. Real data unavailable.</div>}
        </section>
      </div>

      {/* APPLICATION MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Form</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitApplication} className="application-form">
              <div className="form-group">
                <label htmlFor="student_name">Student Name *</label>
                <input
                  type="text"
                  id="student_name"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter student's full name"
                  className={formErrors.student_name ? "input-error" : ""}
                />
                {formErrors.student_name && (
                  <span className="error-text">⚠️ {formErrors.student_name}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth *</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    required
                    className={formErrors.date_of_birth ? "input-error" : ""}
                  />
                  {formErrors.date_of_birth && (
                    <span className="error-text">⚠️ {formErrors.date_of_birth}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="grade_applied">Grade/Level Applied *</label>
                  <select
                    id="grade_applied"
                    name="grade_applied"
                    value={formData.grade_applied}
                    onChange={handleInputChange}
                    required
                    className={formErrors.grade_applied ? "input-error" : ""}
                  >
                    <option value="">Select grade</option>
                    <option value="Daycare">Daycare</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Primary 1">Primary 1</option>
                    <option value="Primary 2">Primary 2</option>
                    <option value="Primary 3">Primary 3</option>
                    <option value="Primary 4">Primary 4</option>
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6">Primary 6</option>
                  </select>
                  {formErrors.grade_applied && (
                    <span className="error-text">⚠️ {formErrors.grade_applied}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="parent_name">Parent/Guardian Name *</label>
                <input
                  type="text"
                  id="parent_name"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter parent's full name"
                  className={formErrors.parent_name ? "input-error" : ""}
                />
                {formErrors.parent_name && (
                  <span className="error-text">⚠️ {formErrors.parent_name}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="parent_email">Email *</label>
                  <input
                    type="email"
                    id="parent_email"
                    name="parent_email"
                    value={formData.parent_email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                    className={formErrors.parent_email ? "input-error" : ""}
                  />
                  {formErrors.parent_email && (
                    <span className="error-text">⚠️ {formErrors.parent_email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="contact_number">Phone Number *</label>
                  <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    required
                    placeholder="+256 XXX XXX XXX"
                    className={formErrors.contact_number ? "input-error" : ""}
                  />
                  {formErrors.contact_number && (
                    <span className="error-text">⚠️ {formErrors.contact_number}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Additional Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Any additional information (optional)"
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}