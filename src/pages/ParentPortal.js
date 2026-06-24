import React, { useState } from "react";
import "./parent-portal.css";
import { apiGet } from "../utils/apiClient";
import { error as showError, success } from "../utils/toastNotification";

export default function ParentPortal() {
  const [parentEmail, setParentEmail] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA500";
      case "Approved":
        return "#4CAF50";
      case "Enrolled":
        return "#2196F3";
      case "Rejected":
        return "#f44336";
      default:
        return "#999";
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!parentEmail.trim()) {
      showError("Please enter your email address");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await apiGet(`/admissions/track/${parentEmail}`);
      setApplications(response.applications || []);

      if (response.applications.length === 0) {
        showError("No applications found for this email");
      } else {
        success("Applications loaded successfully");
      }
    } catch (err) {
      console.error(err);
      setApplications([]);
      showError(
        err.message || "Failed to retrieve applications. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-portal-container">
      <div className="portal-hero">
        <h1>Parent Portal</h1>
        <p>Track your child's admission status and access school information</p>
      </div>

      <div className="portal-content">
        <section className="search-section">
          <h2>Track Application Status</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="email"
              placeholder="Enter your email address"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search Applications"}
            </button>
          </form>
        </section>

        {searched && (
          <section className="applications-section">
            {applications.length > 0 ? (
              <div className="applications-list">
                <h2>Your Applications</h2>
                {applications.map((app) => (
                  <div key={app.id} className="application-card">
                    <div className="app-header">
                      <h3>{app.student_name}</h3>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="app-details">
                      <div className="detail-row">
                        <span className="label">Grade Applied:</span>
                        <span className="value">{app.grade_applied}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Date of Birth:</span>
                        <span className="value">{app.date_of_birth}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Submitted:</span>
                        <span className="value">{app.submitted_at}</span>
                      </div>

                      {app.status === "Approved" && (
                        <div className="approved-info">
                          <p>✓ Your application has been approved!</p>
                          <p>
                            Admission Number:{" "}
                            <strong>{app.mgnt_admission_number || "TBD"}</strong>
                          </p>
                          <p>Check your email for enrollment instructions.</p>
                        </div>
                      )}

                      {app.status === "Rejected" && (
                        <div className="rejected-info">
                          <p>✗ Application Status: Not Approved</p>
                          {app.rejection_reason && (
                            <p>Reason: {app.rejection_reason}</p>
                          )}
                          <p>
                            Please contact the school for more information or
                            to reapply.
                          </p>
                        </div>
                      )}

                      {app.status === "Enrolled" && (
                        <div className="enrolled-info">
                          <p>
                            ✓ Student is now enrolled! Access the Student
                            Portal to view school information.
                          </p>
                          <button className="student-portal-btn">
                            Go to Student Portal
                          </button>
                        </div>
                      )}

                      {app.status === "Pending" && (
                        <div className="pending-info">
                          <p>⏳ Your application is under review.</p>
                          <p>
                            We will notify you via email once a decision has
                            been made.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No applications found for {parentEmail}</p>
                <p>Please check your email and try again.</p>
              </div>
            )}
          </section>
        )}

        <section className="info-section">
          <h2>What Happens Next?</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-number">1</div>
              <h4>Application Submitted</h4>
              <p>Your application is received and logged into our system</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-number">2</div>
              <h4>Under Review</h4>
              <p>School administrators review your application (2-5 days)</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-number">3</div>
              <h4>Decision Made</h4>
              <p>You receive an approval or rejection email</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-number">4</div>
              <h4>Enrollment</h4>
              <p>Approved students access the portal and complete enrollment</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

