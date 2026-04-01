import React, { useEffect, useState } from "react";
import "./home.css";

export default function Home() {
  const [heroImage, setHeroImage] = useState("");
  const [content, setContent] = useState({
    welcomeText: "WELCOME TO",
    intro: "Hilltop Junior School is a warm and vibrant learning community offering Daycare, Kindergarten, and Primary education. We provide a safe, friendly, and inclusive environment where every child thrives.",
    vision: "To nurture confident, creative, and responsible learners.",
    mission: "To provide accessible quality education in a safe, supportive environment.",
    coreValues: [
      { title: "Respect", description: "We value diversity and dignity for all." },
      { title: "Excellence", description: "We strive for high standards in learning and behavior." },
      { title: "Community", description: "We build strong partnerships between pupils, staff and families." },
      { title: "Curiosity", description: "We encourage exploration, creativity and lifelong learning." }
    ]
  });
  const [loading, setLoading] = useState(true);

  // Fetch Home page content from backend
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/v1/home");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Set hero image
        if (data.hero_image) {
          setHeroImage(data.hero_image.startsWith("http") ? data.hero_image : `http://127.0.0.1:5000/${data.hero_image}`);
        } else if (data.gallery_images && data.gallery_images.length > 0) {
          const candidate = data.gallery_images[Math.floor(Math.random() * data.gallery_images.length)];
          setHeroImage(candidate.image.startsWith("http") ? candidate.image : `http://127.0.0.1:5000/${candidate.image}`);
        } else {
          setHeroImage("/images/students.jpg");
        }

        // Set text content from API model
        setContent({
          welcomeText: data.hero_title || "WELCOME TO",
          intro: data.about_text || content.intro,
          vision: data.vision || content.vision,
          mission: data.mission || content.mission,
          coreValues: data.core_values || content.coreValues
        });
      } catch (error) {
        console.error("Error fetching home content:", error);
        setHeroImage("/images/students.jpg");
        setContent({
          welcomeText: "WELCOME TO",
          intro: "Hilltop Junior School is a warm and vibrant learning community offering Daycare, Kindergarten, and Primary education. We provide a safe, friendly, and inclusive environment where every child thrives.",
          vision: "To nurture confident, creative, and responsible learners.",
          mission: "To provide accessible quality education in a safe, supportive environment.",
          coreValues: [
            { title: "Respect", description: "We value diversity and dignity for all." },
            { title: "Excellence", description: "We strive for high standards in learning and behavior." },
            { title: "Community", description: "We build strong partnerships between pupils, staff and families." },
            { title: "Curiosity", description: "We encourage exploration, creativity and lifelong learning." }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  if (loading) return <p>Loading home page...</p>;

  return (
    <div
      className="home-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.6s ease-in-out",
        color: "#fff"
      }}
    >
      <section className="hero-section">
        <img
          src={heroImage}
          alt="students"
          className="hero-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/placeholder.jpg";
          }}
        />
        <div className="hero-text">
          <h1>{content.welcomeText}</h1>
          <h2>Hilltop Junior School Kasangati</h2>
          <p>{content.intro}</p>
        </div>
      </section>

      <section className="about-preview">
        <div className="value-cards">
          <div className="card">
            <h4>Our Vision</h4>
            <p>{content.vision}</p>
          </div>
          <div className="card">
            <h4>Our Mission</h4>
            <p>{content.mission}</p>
          </div>
        </div>
      </section>

      <section className="values-section">
        <h3>OUR CORE VALUES</h3>
        <div className="value-cards">
          {content.coreValues.map((value, index) => (
            <div className="card" key={index}>
              <h4>{value.title}</h4>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}