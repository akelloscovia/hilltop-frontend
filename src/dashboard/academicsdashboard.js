import React, { useEffect, useState } from "react";
import "./academicsdashboard.css";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function AcademicsDashboard() {
  const [data, setData] = useState({
    title: "Academic Excellence",
    subtitle: "Nurturing Bright Minds",
    description: "Our curriculum is designed to challenge and inspire students.",
    excellence: "100% pass rate in national exams.",
    approach: "Holistic education with focus on STEM and arts."
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/academics`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching academics data:", err);
        setLoading(false);
      });
  }, []);

  // Handle changes
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  // Submit updates
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/academics`, {
        method: "POST", // or PUT
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setMessage("✅ Academics updated successfully!");
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
    <div className="academics-dashboard">
      <h2>Academics Dashboard</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={handleChange}
        />

        <label>Subtitle</label>
        <input
          type="text"
          name="subtitle"
          value={data.subtitle}
          onChange={handleChange}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={data.description}
          onChange={handleChange}
        />

        <label>Academic Excellence</label>
        <textarea
          name="excellence"
          value={data.excellence}
          onChange={handleChange}
        />

        <label>Our Approach</label>
        <textarea
          name="approach"
          value={data.approach}
          onChange={handleChange}
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}