import React, { useEffect, useState } from "react";
import "./applicationsviewer.css";
import { apiGet } from "../utils/apiClient";
import { setSEOTags } from "../utils/seoUtils";
import { SkeletonLoading } from "../components/Skeleton";

export default function ApplicationsViewer() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterGrade, setFilterGrade] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Set SEO tags
  useEffect(() => {
    setSEOTags(
      "Applications - Admin Dashboard",
      "View and manage admission applications",
      "applications, admin"
    );
  }, []);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await apiGet('/admissions/applications');
        setApplications(data || []);
        setError(null);

        // Show notification badge
        if (data && data.length > 0) {
          document.title = `${data.length} New Applications - Admin`;
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchApplications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesGrade = filterGrade === "all" || app.grade_applied === filterGrade;
    const matchesSearch = 
      app.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parent_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contact_number?.includes(searchTerm);
    return matchesGrade && matchesSearch;
  });

  const grades = [...new Set(applications.map(app => app.grade_applied))].sort();

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <SkeletonLoading count={5} />
      </div>
    );
  }

  return (
    <div className="applications-viewer">
      {/* Header Section */}
      <div className="viewer-header">
        <div className="header-content">
          <h1>📋 Applications Management</h1>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{applications.length}</span>
              <span className="stat-label">Total Applications</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{grades.length}</span>
              <span className="stat-label">Grades Applied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* No Applications */}
      {applications.length === 0 && !error && (
        <div className="no-applications">
          <p>📭 No applications submitted yet</p>
        </div>
      )}

      {/* Applications List */}
      {applications.length > 0 && (
        <>
          {/* Filters and Search */}
          <div className="filter-section">
            <input
              type="text"
              placeholder="🔍 Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="results-info">
            Showing {filteredApps.length} of {applications.length} applications
          </div>

          {/* Applications Table */}
          <div className="table-container">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Grade Applied</th>
                  <th>Parent Email</th>
                  <th>Contact Number</th>
                  <th>Date of Birth</th>
                  <th>Applied On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app, index) => (
                  <tr key={app.id || index}>
                    <td>{index + 1}</td>
                    <td className="student-name">{app.student_name}</td>
                    <td>
                      <span className="grade-badge">{app.grade_applied}</span>
                    </td>
                    <td>{app.parent_email}</td>
                    <td>{app.contact_number}</td>
                    <td>{new Date(app.date_of_birth).toLocaleDateString()}</td>
                    <td>{new Date(app.created_at || app.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedApp(app)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>👤 Student Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Student Name:</span>
                  <span className="detail-value">{selectedApp.student_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date of Birth:</span>
                  <span className="detail-value">
                    {new Date(selectedApp.date_of_birth).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>👨‍👩‍👧 Parent/Guardian Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Parent Name:</span>
                  <span className="detail-value">{selectedApp.parent_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Parent Email:</span>
                  <span className="detail-value">
                    <a href={`mailto:${selectedApp.parent_email}`}>
                      {selectedApp.parent_email}
                    </a>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Contact Number:</span>
                  <span className="detail-value">
                    <a href={`tel:${selectedApp.contact_number}`}>
                      {selectedApp.contact_number}
                    </a>
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>🎓 Application Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Grade Applied For:</span>
                  <span className="detail-value grade-badge">
                    {selectedApp.grade_applied}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Applied On:</span>
                  <span className="detail-value">
                    {new Date(selectedApp.created_at || selectedApp.submitted_at).toLocaleString()}
                  </span>
                </div>
                {selectedApp.status && (
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedApp.status}`}>
                      {selectedApp.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => window.location.href = `mailto:${selectedApp.parent_email}`}
                >
                  📧 Email Parent
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => window.location.href = `tel:${selectedApp.contact_number}`}
                >
                  📞 Call Parent
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
