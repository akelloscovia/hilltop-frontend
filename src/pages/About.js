import React, { useEffect, useState } from "react";
import "./about.css";

export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default fallback data
  const defaultData = {
    hero_title: "About Hilltop Junior School",
    vision: "To nurture confident, creative, and responsible learners.",
    mission: "To provide accessible quality education in a safe, supportive environment.",
    leadership: [
      { position: "Principal", name: "Dr. Jane Smith" },
      { position: "Vice Principal", name: "Mr. John Doe" }
    ],
    achievements: [
      "100% Pass Rate in National Exams",
      "Best School Infrastructure Award 2023",
      "Innovation in Digital Learning"
    ]
  };

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/v1/about");
        if (!res.ok) throw new Error("Failed to fetch About data");
        const data = await res.json();
        setAboutData(data);

        if (data.hero_images && data.hero_images.length > 0) {
          const randomImage = data.hero_images[Math.floor(Math.random() * data.hero_images.length)];
          setHeroImage(`http://127.0.0.1:5000/${randomImage}`);
        }
      } catch (err) {
        console.error("Error fetching About data:", err);
        setError(err.message);
        setAboutData(defaultData);
        setHeroImage("/images/placeholder.jpg");
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const data = aboutData || defaultData;

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading About Page...</div>;
  }

  return (
    <div
      className="about-page"
      style={{
        backgroundImage: `linear-gradient(rgba(4, 9, 47, 0.8), rgba(10, 47, 92, 0.8)), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.6s ease-in-out",
        color: "#fff"
      }}
    >
      {/* TOP HERO IMAGE */}
      <section className="about-hero">
        <img
          src={heroImage || "/images/placeholder.jpg"}
          alt="School building"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/placeholder.jpg";
          }}
        />
        <h1>{data.hero_title}</h1>
      </section>

      {/* FOUNDATION SECTION */}
      <section className="section foundation">
        <h3 className="section-title">Our Foundation</h3>
        <div className="cards">
          <div className="card">
            <h4>VISION</h4>
            <p>{data.vision}</p>
          </div>
          <div className="card">
            <h4>MISSION</h4>
            <p>{data.mission}</p>
          </div>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section className="section leadership">
        <h3 className="section-title">Our Leadership</h3>
        <div className="leaders">
          {data.leadership && data.leadership.map((leader, index) => (
            <div key={index} className="leader-box">
              {leader.position} <br />
              {leader.name}
            </div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS SECTION */}
      <section className="section achievements">
        <h3 className="section-title">Our Achievements</h3>
        {data.achievements && data.achievements.map((achieve, index) => (
          <div key={index} className="achievement-box">
            <p>{achieve}</p>
          </div>
        ))}
      </section>
      {error && <div style={{ textAlign: "center", color: "yellow", marginTop: "1rem" }}>Note: Showing default content. Real data unavailable.</div>}
    </div>
  );
}