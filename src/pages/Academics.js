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
          <h2>{data.title || "Programs and Highlights"}</h2>
          <h3 className="highlight">{data.subtitle || "Key programs offered at Hilltop Junior School"}</h3>
          <p>{data.description || "We provide a balanced curriculum aligned with the Uganda Primary syllabus, focusing on literacy, numeracy, critical thinking and character formation."}</p>
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

        <section className="programs-highlights-section">
          <div className="programs-column">
            <h3 className="section-title">Programs</h3>
            <div className="programs-grid">
              {(Array.isArray(data.cards) && data.cards.length > 0 ? data.cards : [
                {
                  title: "Early Childhood & Daycare",
                  content:
                    "Caring early years provision that supports social, emotional and foundational learning for pre-school children. Play-based activities prepare children for formal schooling."
                },
                {
                  title: "Kindergarten/Foundation",
                  content:
                    "Structured kindergarten that introduces literacy, numeracy and basic life skills. Focus on readiness for Primary 1 and building confidence."
                },
                {
                  title: "Primary Curriculum & PLE Preparation",
                  content:
                    "A curriculum aligned with the Uganda Ministry of Education focusing on English, Mathematics, Science, Social Studies and Religious Education. Pupils are prepared for the Primary Leaving Examinations (PLE) through continuous assessment and targeted revision."
                },
                {
                  title: "Co-curricular Activities",
                  content:
                    "Sports (football, netball), music, drama, and school clubs (STEM, reading, environment) that build teamwork, leadership and practical skills."
                },
                {
                  title: "Pastoral Care & Character Formation",
                  content:
                    "A strong pastoral program promoting discipline, good behavior, moral values and child protection. Emphasis on positive habits and community responsibility."
                },
                {
                  title: "ICT & Life Skills",
                  content:
                    "Introduction to basic ICT, practical subjects and vocational-minded activities to equip learners with modern skills and problem-solving ability."
                }
              ]).map((card, idx) => (
                <div key={idx} className="academic-card">
                  <h4>{card.title}</h4>
                  <p>{card.content}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="highlights-column">
            <h3 className="section-title">Highlights</h3>
            <div className="highlights-list">
              {(Array.isArray(data.highlights) && data.highlights.length > 0
                ? data.highlights
                : [
                    "Strong PLE preparation with a history of good results and continuous assessment.",
                    "Low teacher-to-pupil ratio enabling individual attention and mentoring.",
                    "Active sports and arts programs including football, netball, music and drama.",
                    "Regular community engagement and parental involvement in school activities.",
                    "Emphasis on values: discipline, respect, responsibility and kindness.",
                    "Practical ICT exposure and life skills to prepare pupils for modern learning."
                  ]).map((h, i) => (
                <div key={i} className="highlight-item">
                  <span className="bullet">•</span>
                  <p>{h}</p>
                </div>
              ))}
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
          </aside>
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

