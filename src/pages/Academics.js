import React, { useEffect, useState } from "react";
import "./academics.css";

export default function Academics() {
  const [academicData, setAcademicData] = useState(null);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default fallback data
  const defaultData = {
    title: "Our Academic Programs",
    subtitle: "Excellence in Education",
    description: "We offer comprehensive academic programs designed to nurture young minds.",
    cards: [
      { title: "Daycare", content: "Early childhood development programs for ages 2-3." },
      { title: "Kindergarten", content: "Foundation learning for ages 4-5." },
      { title: "Primary", content: "Structured education for grades 1-6." }
    ],
    additional: {
      title: "Why Choose Our Academics?",
      content: "Our holistic approach combines traditional teaching with modern learning methods."
    }
  };

  useEffect(() => {
    const fetchAcademics = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/v1/academics");
        if (!res.ok) throw new Error("Failed to fetch Academics data");
        const data = await res.json();
        setAcademicData(data);

        if (data.hero_images && data.hero_images.length > 0) {
          const randomImage = data.hero_images[Math.floor(Math.random() * data.hero_images.length)];
          setHeroImage(`http://127.0.0.1:5000/${randomImage}`);
        }
      } catch (err) {
        console.error("Error fetching Academics data:", err);
        setError(err.message);
        setAcademicData(defaultData);
        setHeroImage("/images/placeholder.jpg");
      } finally {
        setLoading(false);
      }
    };

    fetchAcademics();
  }, []);

  const data = academicData || defaultData;

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading Academics Page...</div>;
  }

  return (
    <div
      className="academics-page"
      style={{
        backgroundImage: `linear-gradient(rgba(2, 5, 40, 0.75), rgba(10, 47, 146, 0.7)), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        transition: "background-image 0.6s ease-in-out"
      }}
    >
      <div className="academics-content">
        {/* Hero Section */}
        <section className="academics-hero">
          <h2>{data.title}</h2>
          <h3 className="highlight">{data.subtitle}</h3>
          <p>{data.description}</p>
        </section>

        {/* Academic Excellence Cards */}
        <section className="academic-card-section">
          {data.cards && data.cards.map((card, index) => (
            <div key={index} className="academic-card">
              <h4>{card.title}</h4>
              <p>{card.content}</p>
            </div>
          ))}

          {/* Image Section */}
          <div className="academic-image">
            <img
              src={heroImage || "/images/placeholder.jpg"}
              alt="students"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/placeholder.jpg";
              }}
            />
          </div>
        </section>

        {/* Additional Info */}
        <section className="academic-additional">
          <h3>{data.additional?.title}</h3>
          <p>{data.additional?.content}</p>
        </section>
        {error && <div style={{ textAlign: "center", color: "yellow", marginTop: "1rem" }}>Note: Showing default content. Real data unavailable.</div>}
      </div>
    </div>
  );
}