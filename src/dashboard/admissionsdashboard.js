import React, { useEffect, useState } from "react";
import "./admissionsdashboard.css";
import { apiGet, apiPut, apiPutForm } from "../utils/apiClient";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

const buildImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (API_BASE_URL) return `${API_BASE_URL}/${value}`;
  return value.startsWith("/") ? value : `/${value}`;
};

const defaultAdmissions = {
  title: "Join Our Community",
  subtitle: "Admissions Open",
  description: "We welcome students from all backgrounds.",
  requirementsText: "Birth certificate\nMedical report\nPrevious school records",
  stepsText: "Submit application\nAttend interview\nPay fees",
  nursery_fee: "500,000 UGX",
  primary_fee: "600,000 UGX",
  transport_fee: "200,000 UGX",
  snacks_fee: "100,000 UGX",
  registration_fee: "50,000 UGX",
  apply_button_text: "Apply Now",
  image_url: ""
};

const normalizeAdmissionsData = (raw = {}) => {
  const fees = raw.fees || {};
  const feeItems = Array.isArray(fees.items) ? fees.items : [];

  const getFeeAmount = (term, fallback) => {
    const found = feeItems.find(
      (item) => typeof item.type === "string" && item.type.toLowerCase().includes(term)
    );
    return found?.amount || fallback;
  };

  return {
    title: raw.title || defaultAdmissions.title,
    subtitle: raw.subtitle || defaultAdmissions.subtitle,
    description: raw.description || defaultAdmissions.description,
    requirementsText:
      typeof raw.requirements === "string"
        ? raw.requirements
        : Array.isArray(raw.requirements)
        ? raw.requirements.map((item) => (typeof item === "string" ? item : item?.title || "")).filter(Boolean).join("\n")
        : defaultAdmissions.requirementsText,
    stepsText:
      typeof raw.steps === "string"
        ? raw.steps
        : Array.isArray(raw.steps)
        ? raw.steps.map((item) => (typeof item === "string" ? item : item?.title || "")).filter(Boolean).join("\n")
        : defaultAdmissions.stepsText,
    nursery_fee: getFeeAmount("nursery", defaultAdmissions.nursery_fee),
    primary_fee: getFeeAmount("primary", defaultAdmissions.primary_fee),
    transport_fee: getFeeAmount("transport", defaultAdmissions.transport_fee),
    snacks_fee: getFeeAmount("snacks", defaultAdmissions.snacks_fee),
    registration_fee: fees.registration || raw.registration_fee || defaultAdmissions.registration_fee,
    apply_button_text: raw.apply_button_text || defaultAdmissions.apply_button_text,
    image_url: raw.image || raw.image_url || ""
  };
};

const buildPayload = (data) => {
  const requirements = data.requirementsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((item) => ({ title: item, items: [item] }));

  const steps = data.stepsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    requirements,
    steps,
    fees: {
      items: [
        { type: "Nursery Fee", amount: data.nursery_fee },
        { type: "Primary Fee", amount: data.primary_fee },
        { type: "Transport Fee", amount: data.transport_fee },
        { type: "Snacks Fee", amount: data.snacks_fee }
      ],
      registration: data.registration_fee
    },
    apply_button_text: data.apply_button_text,
    image: data.image_url
  };
};

export default function AdmissionsDashboard() {
  const [data, setData] = useState(defaultAdmissions);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const resData = await apiGet("/admissions");
        const normalized = normalizeAdmissionsData(resData);
        setData(normalized);
        if (normalized.image_url) {
          setImagePreview(buildImageUrl(normalized.image_url));
        }
      } catch (err) {
        console.error("Error fetching admissions data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result || "");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // If image file is selected, upload it as FormData
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("title", data.title);
        formData.append("subtitle", data.subtitle);
        formData.append("description", data.description);
        formData.append(
          "requirements",
          JSON.stringify(data.requirementsText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
        );
        formData.append(
          "steps",
          JSON.stringify(data.stepsText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
        );
        formData.append(
          "fees",
          JSON.stringify({
            items: [
              { type: "Nursery Fee", amount: data.nursery_fee },
              { type: "Primary Fee", amount: data.primary_fee },
              { type: "Transport Fee", amount: data.transport_fee },
              { type: "Snacks Fee", amount: data.snacks_fee }
            ],
            registration: data.registration_fee
          })
        );
        formData.append("apply_button_text", data.apply_button_text);

        const response = await apiPutForm("/admissions", formData);
        setData(normalizeAdmissionsData(response));
        setImageFile(null);
        setMessage("✅ Admissions updated successfully with image!");
      } else {
        // Regular JSON update without image
        const payload = buildPayload(data);
        const response = await apiPut("/admissions", payload);
        setData(normalizeAdmissionsData(response));
        setMessage("✅ Admissions updated successfully!");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Admissions save failed:", error);
      setMessage(`❌ Error occurred while saving: ${error?.message || 'Unknown error'}`);
    }
  };

  if (loading)
    return (
      <div className="admissions-dashboard loading-state">
        <p>Loading admissions dashboard...</p>
      </div>
    );

  const requirements = data.requirementsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const steps = data.stepsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="admissions-dashboard">
      <div className="admissions-head">
        <div>
          <h2>Admissions Dashboard</h2>
          <p className="admissions-intro">
            Manage admissions content, fees, requirements, and preview updates instantly.
          </p>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="admissions-layout">
        <form onSubmit={handleSubmit} className="admissions-form">
          <section className="form-card">
            <div className="card-heading">
              <h3>Header Section</h3>
              <p>Update the hero title and description seen on the admissions page.</p>
            </div>
            <label>Title</label>
            <input name="title" value={data.title} onChange={handleChange} />
            <label>Subtitle</label>
            <input name="subtitle" value={data.subtitle} onChange={handleChange} />
            <label>Description</label>
            <textarea name="description" value={data.description} onChange={handleChange} />
          </section>

          <section className="form-card">
            <div className="card-heading">
              <h3>Admission Requirements</h3>
              <p>Enter each requirement on a new line so it displays cleanly in the preview.</p>
            </div>
            <textarea name="requirementsText" value={data.requirementsText} onChange={handleChange} />
          </section>

          <section className="form-card">
            <div className="card-heading">
              <h3>Application Steps</h3>
              <p>Write step-by-step application instructions that families can follow.</p>
            </div>
            <textarea name="stepsText" value={data.stepsText} onChange={handleChange} />
          </section>

          <section className="form-card">
            <div className="card-heading">
              <h3>Fees & Extras</h3>
              <p>Organize fees and the application button text in one place.</p>
            </div>
            <div className="field-grid">
              <div>
                <label>Nursery Fee</label>
                <input name="nursery_fee" value={data.nursery_fee} onChange={handleChange} />
              </div>
              <div>
                <label>Primary Fee</label>
                <input name="primary_fee" value={data.primary_fee} onChange={handleChange} />
              </div>
              <div>
                <label>Transport Fee</label>
                <input name="transport_fee" value={data.transport_fee} onChange={handleChange} />
              </div>
              <div>
                <label>Snacks Fee</label>
                <input name="snacks_fee" value={data.snacks_fee} onChange={handleChange} />
              </div>
              <div>
                <label>Registration Fee</label>
                <input name="registration_fee" value={data.registration_fee} onChange={handleChange} />
              </div>
            </div>
            <label>Apply Button Text</label>
            <input name="apply_button_text" value={data.apply_button_text} onChange={handleChange} />
          </section>

          <section className="form-card">
            <div className="card-heading">
              <h3>Admissions Image</h3>
              <p>Upload an image or paste an image URL to display on the admissions page.</p>
            </div>
            <label>Upload Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="image-input"
            />
            {imageFile && <p className="file-name">Selected: {imageFile.name}</p>}
            
            <label style={{ marginTop: "1rem" }}>Or paste Image URL</label>
            <input
              name="image_url"
              value={data.image_url}
              onChange={handleChange}
              placeholder="e.g., https://example.com/image.jpg or /images/admissions.jpg"
            />
          </section>

          <button type="submit">Save Changes</button>
        </form>

        <aside className="admissions-preview">
          <div className="preview-card">
            <div className="preview-hero">
              <span className="badge">Preview</span>
              <h3>{data.title}</h3>
              <p>{data.subtitle}</p>
              <p>{data.description}</p>
            </div>

            <div className="preview-section">
              <h4>Requirements</h4>
              {requirements.length ? (
                <ul>
                  {requirements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No requirements added yet.</p>
              )}
            </div>

            <div className="preview-section">
              <h4>Application Steps</h4>
              {steps.length ? (
                <ol>
                  {steps.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              ) : (
                <p>No steps added yet.</p>
              )}
            </div>

            <div className="preview-section preview-fees">
              <h4>Fees</h4>
              <div className="fee-grid">
                <div className="fee-item">
                  <span>Nursery</span>
                  <strong>{data.nursery_fee}</strong>
                </div>
                <div className="fee-item">
                  <span>Primary</span>
                  <strong>{data.primary_fee}</strong>
                </div>
                <div className="fee-item">
                  <span>Transport</span>
                  <strong>{data.transport_fee}</strong>
                </div>
                <div className="fee-item">
                  <span>Snacks</span>
                  <strong>{data.snacks_fee}</strong>
                </div>
                <div className="fee-item full-width">
                  <span>Registration</span>
                  <strong>{data.registration_fee}</strong>
                </div>
              </div>
            </div>

            {data.image_url || imagePreview ? (
              <div className="preview-image">
                <img src={imagePreview || buildImageUrl(data.image_url)} alt="Admissions preview" />
              </div>
            ) : (
              <div className="preview-placeholder">No image uploaded yet</div>
            )}

            <div className="preview-footer">
              <button type="button" className="preview-cta">
                {data.apply_button_text}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

