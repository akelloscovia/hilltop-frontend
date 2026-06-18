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

  // ---------------- SEO ----------------
  useEffect(() => {
    setSEOTags(
      "Applications - Admin Dashboard",
      "View and manage admission applications",
      "applications, admin"
    );
  }, []);

  // ---------------- FETCH APPLICATIONS ----------------
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);

        const data = await apiGet("/admissions/applications");

        setApplications(Array.isArray(data) ? data : []);
        setError(null);

        if (Array.isArray(data) && data.length > 0) {
          document.title = `${data.length} Applications - Admin`;
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(err.message || "Failed to load applications");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    const interval = setInterval(fetchApplications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- SAFE FILTERING ----------------
  const filteredApps = applications.filter((app) => {
    const name = app?.student_name?.toLowerCase() || "";
    const email = app?.parent_email?.toLowerCase() || "";
    const phone = app?.contact_number || "";

    const matchesGrade =
      filterGrade === "all" || app?.grade_applied === filterGrade;

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm);

    return matchesGrade && matchesSearch;
  });

  const grades = [
    ...new Set(applications.map((app) => app?.grade_applied).filter(Boolean))
  ].sort();

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <SkeletonLoading count={5} />
      </div>
    );
  }

  return (
    <div className="applications-viewer">

      {/* HEADER */}
      <div className="viewer-header">
        <div className="header-content">
          <h1>📋 Applications Management</h1>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{applications.length}</span>
              <span className="stat-label">Applications</span>
            </div>

            <div className="stat-card">
              <span className="stat-number">{grades.length}</span>
              <span className="stat-label">Grades</span>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="error-banner">⚠️ {error}</div>}

      {/* EMPTY STATE */}
      {!error && applications.length === 0 && (
        <div className="no-applications">
          <p>📭 No applications yet</p>
        </div>
      )}

      {/* TABLE SECTION */}
      {applications.length > 0 && (
        <>
          {/* FILTERS */}
          <div className="filter-section">
            <input
              type="text"
              placeholder="Search applications..."
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
              {grades.map((grade, i) => (
                <option key={i} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="results-info">
            Showing {filteredApps.length} of {applications.length}
          </div>

          {/* TABLE */}
          <div className="table-container">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Date</th>
                  <th>Msg</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredApps.map((app, index) => (
                  <tr key={app?.id || index}>
                    <td>{index + 1}</td>
                    <td>{app?.student_name || "-"}</td>
                    <td>{app?.grade_applied || "-"}</td>
                    <td>{app?.parent_email || "-"}</td>
                    <td>{app?.contact_number || "-"}</td>
                    <td>
                      {app?.date_of_birth
                        ? new Date(app.date_of_birth).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {app?.created_at || app?.submitted_at
                        ? new Date(
                            app.created_at || app.submitted_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{app?.message ? "✓" : "-"}</td>
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

      {/* MODAL */}
      {selectedApp && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Application Details</h2>
              <button onClick={() => setSelectedApp(null)}>✕</button>
            </div>

            <div className="modal-body">

              <h3>Student</h3>
              <p>{selectedApp?.student_name || "-"}</p>

              <h3>Parent</h3>
              <p>{selectedApp?.parent_name || "-"}</p>

              <h3>Contact</h3>
              <p>{selectedApp?.parent_email || "-"}</p>
              <p>{selectedApp?.contact_number || "-"}</p>

              <h3>Grade</h3>
              <p>{selectedApp?.grade_applied || "-"}</p>

              <h3>Date</h3>
              <p>
                {selectedApp?.created_at
                  ? new Date(selectedApp.created_at).toLocaleString()
                  : "-"}
              </p>

              <h3>Message</h3>
              <p style={{ whiteSpace: "pre-wrap", minHeight: 80 }}>
                {selectedApp?.message || "-"}
              </p>
              <div className="modal-actions">
                <button
                  onClick={() =>
                    window.open(
                      `mailto:${selectedApp?.parent_email || ""}`
                    )
                  }
                >
                  Email
                </button>

                <button
                  onClick={() =>
                    window.open(`tel:${selectedApp?.contact_number || ""}`)
                  }
                >
                  Call
                </button>

                <button onClick={() => setSelectedApp(null)}>
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