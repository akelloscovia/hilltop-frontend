import React, { useEffect, useState } from "react";
import "./academicsdashboard.css";
import { apiGet, apiPut } from "../utils/apiClient";

const LOCAL_ACADEMICS_KEY = "dashboard_academics_data";

const defaultAcademics = {
  title: "Programs and Highlights",
  subtitle: "Key programs offered at Hilltop Junior School",
  description:
    "We provide a balanced curriculum aligned with the Uganda Primary syllabus, focusing on literacy, numeracy, critical thinking and character formation.",
  excellence:
    "A strong academic culture built on excellence, discipline, continuous assessment and support for every learner.",
  approach:
    "A child-centered approach that blends academic rigor, creativity, values formation and practical life skills.",
  cards: [
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
  ],
  highlights: [
    "Strong PLE preparation with a history of good results and continuous assessment.",
    "Low teacher-to-pupil ratio enabling individual attention and mentoring.",
    "Active sports and arts programs including football, netball, music and drama.",
    "Regular community engagement and parental involvement in school activities.",
    "Emphasis on values: discipline, respect, responsibility and kindness.",
    "Practical ICT exposure and life skills to prepare pupils for modern learning."
  ],
  additional: {
    title: "",
    content: ""
  }
};

const normalizeAcademicsData = (data) => ({
  ...defaultAcademics,
  ...data,
  title: data?.title || defaultAcademics.title,
  subtitle: data?.subtitle || defaultAcademics.subtitle,
  description: data?.description || data?.about_text || defaultAcademics.description,
  excellence: data?.excellence || data?.academic_excellence || defaultAcademics.excellence,
  approach: data?.approach || data?.learning_approach || defaultAcademics.approach,
  cards: Array.isArray(data?.cards) && data.cards.length > 0 ? data.cards : defaultAcademics.cards,
  highlights: Array.isArray(data?.highlights) && data.highlights.length > 0 ? data.highlights : defaultAcademics.highlights,
  additional: data?.additional || defaultAcademics.additional
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

  const handleCardChange = (index, field, value) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, [field]: value } : card
      )
    }));
  };

  const handleHighlightChange = (index, value) => {
    setData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((highlight, highlightIndex) =>
        highlightIndex === index ? value : highlight
      )
    }));
  };

  const handleAdditionalChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      additional: { ...(prev.additional || {}), [field]: value }
    }));
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
        <label>Page Title</label>
        <input type="text" name="title" value={data.title} onChange={handleChange} />
        <label>Subtitle</label>
        <input type="text" name="subtitle" value={data.subtitle} onChange={handleChange} />
        <label>Description</label>
        <textarea name="description" value={data.description} onChange={handleChange} />
        <label>Academic Excellence</label>
        <textarea name="excellence" value={data.excellence} onChange={handleChange} />
        <label>Our Approach</label>
        <textarea name="approach" value={data.approach} onChange={handleChange} />

        <h3>Programs</h3>
        {(data.cards || []).map((card, index) => (
          <div key={index} style={{ marginBottom: "12px" }}>
            <label>Program {index + 1} Title</label>
            <input
              type="text"
              value={card.title || ""}
              onChange={(e) => handleCardChange(index, "title", e.target.value)}
            />
            <label>Program {index + 1} Content</label>
            <textarea
              value={card.content || ""}
              onChange={(e) => handleCardChange(index, "content", e.target.value)}
            />
          </div>
        ))}

        <h3>Highlights</h3>
        {(data.highlights || []).map((highlight, index) => (
          <div key={index} style={{ marginBottom: "12px" }}>
            <label>Highlight {index + 1}</label>
            <textarea
              value={highlight}
              onChange={(e) => handleHighlightChange(index, e.target.value)}
            />
          </div>
        ))}

        <h3>Additional Section</h3>
        <label>Section Title</label>
        <input
          type="text"
          value={data.additional?.title || ""}
          onChange={(e) => handleAdditionalChange("title", e.target.value)}
        />
        <label>Section Content</label>
        <textarea
          value={data.additional?.content || ""}
          onChange={(e) => handleAdditionalChange("content", e.target.value)}
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

