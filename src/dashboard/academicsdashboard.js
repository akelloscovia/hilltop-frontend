import React, { useEffect, useState } from "react";
import "./academicsdashboard.css";
import { apiGet, apiPut } from "../utils/apiClient";

const LOCAL_ACADEMICS_KEY = "dashboard_academics_data";

const defaultAcademics = {
  title: "Academic Excellence",
  subtitle: "Nurturing Bright Minds",
  description: "Our curriculum is designed to challenge and inspire students.",
  excellence: "100% pass rate in national exams.",
  approach: "Holistic education with focus on STEM and arts."
};

const normalizeAcademicsData = (data) => ({
  ...defaultAcademics,
  title: data.title || defaultAcademics.title,
  subtitle: data.subtitle || defaultAcademics.subtitle,
  description: data.description || data.about_text || defaultAcademics.description,
  excellence: data.excellence || data.academic_excellence || defaultAcademics.excellence,
  approach: data.approach || data.learning_approach || defaultAcademics.approach
});

const loadAcademicsFromStorage = () => {
  try {
    const saved = localStorage.getItem(LOCAL_ACADEMICS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("Could not read academics fallback from localStorage", err);
    return null;
  }
};

const saveAcademicsToStorage = (payload) => {
  try {
    localStorage.setItem(LOCAL_ACADEMICS_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Could not save academics fallback to localStorage", err);
  }
};

export default function AcademicsDashboard() {
  const [data, setData] = useState(defaultAcademics);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resData = await apiGet("/academics");
        const normalized = normalizeAcademicsData(resData);
        setData(normalized);
        saveAcademicsToStorage(normalized);
      } catch (err) {
        console.error("Error fetching academics data:", err);
        const fallback = loadAcademicsFromStorage();
        if (fallback) {
          setData(normalizeAcademicsData(fallback));
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiPut("/academics", data);
      const normalized = normalizeAcademicsData(response);
      setData(normalized);
      saveAcademicsToStorage(normalized);
      setMessage("✅ Academics updated successfully!");
      setTimeout(() => setMessage(""), 3000);
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
        <input type="text" name="title" value={data.title} onChange={handleChange} />
        <label>Subtitle</label>
        <input type="text" name="subtitle" value={data.subtitle} onChange={handleChange} />
        <label>Description</label>
        <textarea name="description" value={data.description} onChange={handleChange} />
        <label>Academic Excellence</label>
        <textarea name="excellence" value={data.excellence} onChange={handleChange} />
        <label>Our Approach</label>
        <textarea name="approach" value={data.approach} onChange={handleChange} />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

