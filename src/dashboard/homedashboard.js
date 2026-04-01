import React, { useEffect, useState } from "react";
import "./homedashboard.css";

// dynamic hero images
import studentsImg from "../images/students.jpg";
import studentsImg2 from "../images/students2.jpg";
import studentsImg3 from "../images/students3.jpg";

const API_BASE_URL = "http://127.0.0.1:5000";
const homeImages = [studentsImg, studentsImg2, studentsImg3];

export default function Home() {
  const [heroImage, setHeroImage] = useState(homeImages[0]);
  const [content, setContent] = useState({
    title: "Hilltop Junior School Kasangati",
    subtitle: "Welcome to our school",
    description: "Hilltop Junior School is a warm and vibrant learning community offering Daycare, Kindergarten, and Primary education. We provide a safe, friendly, and inclusive environment where every child thrives.",
    vision: "To nurture confident, creative, and responsible learners.",
    mission: "To provide accessible quality education in a safe, supportive environment."
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const randomImage = homeImages[Math.floor(Math.random() * homeImages.length)];
    setHeroImage(randomImage);

    const loadHome = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/v1/home");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.hero_image) {
          setHeroImage(data.hero_image.startsWith("http") ? data.hero_image : `${API_BASE_URL}/${data.hero_image}`);
        }

        setContent({
          title: data.hero_title || content.title,
          subtitle: data.hero_subtitle || content.subtitle,
          description: data.about_text || content.description,
          vision: data.vision || content.vision,
          mission: data.mission || content.mission
        });
      } catch (err) {
        console.error("Error loading home dashboard content:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/v1/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_title: content.title,
          hero_subtitle: content.subtitle,
          about_text: content.description,
          vision: content.vision,
          mission: content.mission
        })
      });

      if (res.ok) {
        setMessage("✅ Home page updated successfully");
      } else {
        setMessage("❌ Failed to update Home page");
      }
    } catch (err) {
      console.error("Home dashboard save error:", err);
      setMessage("❌ Error while saving Home page");
    }
  };

  if (loading) return <p>Loading home dashboard...</p>;

  return (
    <div className="home-dashboard">
      <h2>Home Dashboard</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="home-dashboard-form">
        <label>Hero Title</label>
        <input name="title" value={content.title} onChange={handleChange} />

        <label>Hero Subtitle</label>
        <input name="subtitle" value={content.subtitle} onChange={handleChange} />

        <label>Intro / About Text</label>
        <textarea name="description" value={content.description} onChange={handleChange} />

        <label>Vision</label>
        <textarea name="vision" value={content.vision} onChange={handleChange} />

        <label>Mission</label>
        <textarea name="mission" value={content.mission} onChange={handleChange} />

        <button type="submit">Save Home Content</button>
      </form>

      <div className="home-preview">
        <h3>Live Preview</h3>
        <p><strong>Hero:</strong> {content.title} / {content.subtitle}</p>
        <p><strong>About:</strong> {content.description}</p>
        <p><strong>Vision:</strong> {content.vision}</p>
        <p><strong>Mission:</strong> {content.mission}</p>
      </div>
    </div>
  );
}