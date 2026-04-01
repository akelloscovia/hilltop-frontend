import React, { useEffect, useState } from "react";
import "./aboutdashboard.css";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function AboutDashboard() {
  const [aboutData, setAboutData] = useState({
    vision: "To nurture confident, creative, and responsible learners.",
    mission: "To provide accessible quality education in a safe, supportive environment.",
    director: "Mr. John Doe",
    head_teacher: "Mrs. Jane Smith",
    deputy_head_teacher: "Mr. Alex Johnson",
    achievements: "Award-winning school with excellent exam results."
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch existing data
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/about`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setAboutData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching about data:", err);
        setLoading(false);
      });
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setAboutData({
      ...aboutData,
      [e.target.name]: e.target.value
    });
  };

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/about`, {
        method: "POST", // or PUT depending on your backend
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(aboutData)
      });

      if (res.ok) {
        setMessage("✅ Updated successfully!");
      } else {
        setMessage("❌ Failed to update");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error occurred");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="about-dashboard">
      <h2>About Page Dashboard</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <h3>Foundation</h3>

        <label>Vision</label>
        <textarea
          name="vision"
          value={aboutData.vision}
          onChange={handleChange}
        />

        <label>Mission</label>
        <textarea
          name="mission"
          value={aboutData.mission}
          onChange={handleChange}
        />

        <h3>Leadership</h3>

        <label>Director</label>
        <input
          type="text"
          name="director"
          value={aboutData.director}
          onChange={handleChange}
        />

        <label>Head Teacher</label>
        <input
          type="text"
          name="head_teacher"
          value={aboutData.head_teacher}
          onChange={handleChange}
        />

        <label>Deputy Head Teacher</label>
        <input
          type="text"
          name="deputy_head_teacher"
          value={aboutData.deputy_head_teacher}
          onChange={handleChange}
        />

        <h3>Achievements</h3>

        <textarea
          name="achievements"
          value={aboutData.achievements}
          onChange={handleChange}
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}