import React, { useEffect, useState } from "react";
import "./academics.css";
import { apiGet } from "../utils/apiClient";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";
const LOCAL_ACADEMICS_KEY = "dashboard_academics_data";

const loadAcademicsFallback = () => {
  try {
    const saved = localStorage.getItem(LOCAL_ACADEMICS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("Could not read academics fallback from localStorage", err);
    return null;
  }
};

const getImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (API_BASE_URL) return `${API_BASE_URL}/${value}`;
  return value.startsWith("/") ? value : `/${value}`;
};

export default function Academics() {
  const [academicData, setAcademicData] = useState(null);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAcademics = async () => {
      try {
        const data = await apiGet("/academics");
        const fallback = loadAcademicsFallback() || {};
        const merged = {
          ...fallback,
          ...(data || {})
        };

        setAcademicData(merged);

        let image = "";

        if (Array.isArray(data?.hero_images) && data.hero_images.length > 0) {
          const random =
            data.hero_images[
              Math.floor(Math.random() * data.hero_images.length)
            ];

          image = getImageUrl(random);
        }

        setHeroImage(image);
        setError(null);
      } catch (err) {
        console.error("Academics fetch error:", err);
        setError(err.message);
        const fallback = loadAcademicsFallback() || {};
        setAcademicData(fallback);

        let image = "";
        if (Array.isArray(fallback?.hero_images) && fallback.hero_images.length > 0) {
          const random =
            fallback.hero_images[
              Math.floor(Math.random() * fallback.hero_images.length)
            ];
          image = getImageUrl(random);
        }

        setHeroImage(image);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademics();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading Academics Page...
      </div>
    );
  }

  const data = academicData || {};

  return (
    <div
      className="academics-page"
      style={{
        backgroundImage: heroImage
          ? `linear-gradient(rgba(2,5,40,0.75), rgba(10,47,146,0.7)), url(${heroImage})`
          : "none",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
      }}
    >
      <div className="academics-content">
        <section className="academics-hero">
          <h2>{data.title || "Not set in dashboard"}</h2>
          <h3 className="highlight">{data.subtitle || ""}</h3>
          <p>{data.description || ""}</p>
        </section>

        {(data.excellence || data.approach) && (
          <section className="academic-summary-section">
            <div className="academic-summary-grid horizontal">
              {data.excellence && (
                <div className="academic-summary-block">
                  <h4>Academic Excellence</h4>
                  <p>{data.excellence}</p>
                </div>
              )}
              {data.approach && (
                <div className="academic-summary-block">
                  <h4>Our Approach</h4>
                  <p>{data.approach}</p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="academic-card-section">
          <div className="academic-card-list">
            <h3 className="section-title">Programs & Highlights</h3>
            {Array.isArray(data.cards) && data.cards.length > 0 ? (
              <div className="academic-card-grid">
                {data.cards.map((card, index) => (
                  <div key={index} className="academic-card">
                    <h4>{card?.title || ""}</h4>
                    <p>{card?.content || ""}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No academic programs set in dashboard yet.</p>
            )}
          </div>

          {heroImage && (
            <div className="academic-image">
              <img
                src={heroImage}
                alt="students"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/images/placeholder.jpg";
                }}
              />
            </div>
          )}
        </section>

        <section className="academic-additional">
          <h3>{data.additional?.title || ""}</h3>
          <p>{data.additional?.content || ""}</p>
        </section>

        {error && (
          <div style={{ textAlign: "center", color: "yellow" }}>
            Using empty CMS data (not set in dashboard)
          </div>
        )}
      </div>
    </div>
  );
}
