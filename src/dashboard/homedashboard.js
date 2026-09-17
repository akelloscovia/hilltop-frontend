import React, { useEffect, useState } from "react";
import "./homedashboard.css";
import { apiGet, apiPut } from "../utils/apiClient";
import GalleryUpload from "../components/GalleryUpload";

import studentsImg from "../images/students.jpg";
import studentsImg2 from "../images/students2.jpg";
import studentsImg3 from "../images/students3.jpg";

const homeImages = [studentsImg, studentsImg2, studentsImg3];
const API_BASE_URL = process.env.REACT_APP_API_URL || "";

const buildImageUrl = (value) => {
  if (!value) return "";
  if (typeof value !== "string") return "";
  const cleanValue = value.trim();
  if (!cleanValue) return "";
  if (cleanValue.startsWith("http") || cleanValue.startsWith("data:") || cleanValue.startsWith("blob:") || cleanValue.startsWith("/images/")) return cleanValue;
  if (cleanValue.startsWith("/api/")) return cleanValue;
  if (API_BASE_URL) return `${API_BASE_URL}/${cleanValue.replace(/^\/+/, "")}`;
  return cleanValue.startsWith("/") ? cleanValue : `/${cleanValue}`;
};
const LOCAL_HOME_KEY = "dashboard_home_data";

const unwrapPayload = (payload) => {
  let current = payload;
  while (
    current &&
    typeof current === "object" &&
    (current.data || current.result)
  ) {
    current = current.data || current.result;
  }
  return current;
};

const normalizeCoreValueCandidate = (item) => {
  if (typeof item === "string") {
    return { title: item.trim(), description: "" };
  }
  if (item && typeof item === "object") {
    const title = item.title || item.name || item.label || item.value || "";
    const description = item.description || item.text || item.note || "";
    return { title: title.toString().trim(), description: description.toString().trim() };
  }
  return { title: "", description: "" };
};

const normalizeCoreValues = (values) => {
  if (!Array.isArray(values)) return [];
  return values.map(normalizeCoreValueCandidate);
};

const loadHomeDataFromStorage = () => {
  try {
    const stored = localStorage.getItem(LOCAL_HOME_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error("Could not read home fallback from localStorage", err);
    return null;
  }
};

const saveHomeDataToStorage = (payload) => {
  try {
    localStorage.setItem(LOCAL_HOME_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Could not save home fallback to localStorage", err);
  }
};

export default function Home() {
  const [, setHeroImage] = useState(homeImages[0]);
  const [content, setContent] = useState({
    title: "Hilltop Junior School Kasangati",
    subtitle: "Welcome to our school",
    description:
      "Hilltop Junior School is a warm and vibrant learning community offering Daycare, Kindergarten, and Primary education. We provide a safe, friendly, and inclusive environment where every child thrives.",
    coreValues: [
      {
        title: "Community",
        description:
          "We build connections between students, staffs and families for mutual support."
      },
      {
        title: "Respect",
        description:
          "We value diversity, kindness and dignity for all."
      },
      {
        title: "Excellence",
        description:
          "We strive to high standards in learning and behavior."
      },
      {
        title: "Curiosity",
        description:
          "We encourage exploration, creativity and love of learning."
      }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const randomImage = homeImages[Math.floor(Math.random() * homeImages.length)];
    setHeroImage(randomImage);

    const loadHome = async () => {
      try {
        const rawData = await apiGet("/home");
        const data = unwrapPayload(rawData) || {};

        const fallback = loadHomeDataFromStorage();
        const hasCoreValues = Array.isArray(data.core_values) && data.core_values.length > 0;

        if (data.hero_image) {
          setHeroImage(buildImageUrl(data.hero_image));
        } else if (fallback?.hero_image) {
          setHeroImage(buildImageUrl(fallback.hero_image));
        }

        setContent({
          title: data.hero_title || fallback?.hero_title || content.title,
          subtitle: data.hero_subtitle || fallback?.hero_subtitle || content.subtitle,
          description: data.about_text || fallback?.about_text || content.description,
          coreValues:
            hasCoreValues
              ? normalizeCoreValues(data.core_values).slice(0, 4)
              : Array.isArray(fallback?.core_values)
              ? normalizeCoreValues(fallback.core_values).slice(0, 4)
              : content.coreValues
        });
      } catch (err) {
        console.error("Error loading home dashboard content:", err);
        const fallback = loadHomeDataFromStorage();
        if (fallback) {
          setContent({
            title: fallback.hero_title || content.title,
            subtitle: fallback.hero_subtitle || content.subtitle,
            description: fallback.about_text || content.description,
            coreValues:
              Array.isArray(fallback.core_values) && fallback.core_values.length > 0
                ? fallback.core_values.slice(0, 4)
                : content.coreValues
          });
          if (fallback.hero_image) {
            setHeroImage(buildImageUrl(fallback.hero_image));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoreValueChange = (index, field, value) => {
    setContent((prev) => {
      const coreValues = [...(prev.coreValues || [])];
      const existing = normalizeCoreValueCandidate(coreValues[index] || "");
      coreValues[index] = { ...existing, [field]: value };
      return { ...prev, coreValues };
    });
  };

  const handleGallerySaved = (gallery) => {
    (async () => {
      const extractFirstImageUrl = (g) => {
        if (!g) return null;

        const arr = Array.isArray(g)
          ? g
          : Array.isArray(g.gallery_images)
          ? g.gallery_images
          : Array.isArray(g.images)
          ? g.images
          : [];

        if (!arr.length) return null;
        const first = arr[0];
        if (!first) return null;
        if (typeof first === 'string') return first;
        return first.image || first.image_url || first.url || first.src || first.filename || null;
      };

      const count = Array.isArray(gallery)
        ? gallery.length
        : Array.isArray(gallery?.gallery_images)
        ? gallery.gallery_images.length
        : Array.isArray(gallery?.images)
        ? gallery.images.length
        : 0;

      const first = extractFirstImageUrl(gallery);
      if (first) {
        const url = buildImageUrl(first);
        setHeroImage(url);

        try {
          await apiPut('/home', { hero_image: first });
          const existing = loadHomeDataFromStorage() || {};
          saveHomeDataToStorage({ ...existing, hero_image: first });
          setMessage(`✅ Wallpaper uploaded and saved. ${count} image${count === 1 ? '' : 's'}.`);
        } catch (err) {
          console.warn('Could not save hero_image to backend, saved locally', err);
          const existing = loadHomeDataFromStorage() || {};
          saveHomeDataToStorage({ ...existing, hero_image: first });
          setMessage(`⚠️ Wallpaper uploaded locally. ${count} image${count === 1 ? '' : 's'}.`);
        }
      } else {
        setMessage(`✅ Wallpaper uploaded. ${count} image${count === 1 ? '' : 's'}.`);
      }

      setTimeout(() => setMessage(''), 4000);
    })();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        hero_title: content.title,
        hero_subtitle: content.subtitle,
        about_text: content.description,
        core_values: content.coreValues
      };
      await apiPut("/home", payload);
      saveHomeDataToStorage(payload);

      setMessage("✅ Home page updated successfully");
      setTimeout(() => setMessage(""), 3000);
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
        <div className="core-value-section">
          <label>Core Value 1 Title</label>
          <input
            value={content.coreValues[0]?.title || ""}
            onChange={(e) => handleCoreValueChange(0, "title", e.target.value)}
          />
          <label>Core Value 1 Description</label>
          <textarea
            value={content.coreValues[0]?.description || ""}
            onChange={(e) => handleCoreValueChange(0, "description", e.target.value)}
          />
        </div>
        <div className="core-value-section">
          <label>Core Value 2 Title</label>
          <input
            value={content.coreValues[1]?.title || ""}
            onChange={(e) => handleCoreValueChange(1, "title", e.target.value)}
          />
          <label>Core Value 2 Description</label>
          <textarea
            value={content.coreValues[1]?.description || ""}
            onChange={(e) => handleCoreValueChange(1, "description", e.target.value)}
          />
        </div>
        <div className="core-value-section">
          <label>Core Value 3 Title</label>
          <input
            value={content.coreValues[2]?.title || ""}
            onChange={(e) => handleCoreValueChange(2, "title", e.target.value)}
          />
          <label>Core Value 3 Description</label>
          <textarea
            value={content.coreValues[2]?.description || ""}
            onChange={(e) => handleCoreValueChange(2, "description", e.target.value)}
          />
        </div>
        <div className="core-value-section">
          <label>Core Value 4 Title</label>
          <input
            value={content.coreValues[3]?.title || ""}
            onChange={(e) => handleCoreValueChange(3, "title", e.target.value)}
          />
          <label>Core Value 4 Description</label>
          <textarea
            value={content.coreValues[3]?.description || ""}
            onChange={(e) => handleCoreValueChange(3, "description", e.target.value)}
          />
        </div>
        <button type="submit">Save Home Content</button>
      </form>

      <div className="upload-section">
        <h3>Upload Wallpaper for Home Background</h3>
        <GalleryUpload onSaved={handleGallerySaved} />
      </div>

      <div className="home-preview">
        <h3>Live Preview</h3>
        <p><strong>Hero:</strong> {content.title} / {content.subtitle}</p>
        <p><strong>About:</strong> {content.description}</p>
        <div>
          <strong>Core Values:</strong>
          <ul>
            {content.coreValues?.map((value, idx) => (
              <li key={idx}>
                <strong>{value.title || value}</strong>
                {value.description ? ` — ${value.description}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

