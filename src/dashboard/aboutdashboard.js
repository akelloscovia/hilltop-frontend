import React, { useEffect, useState } from "react";
import "./aboutdashboard.css";
import { apiGet, apiPut, apiPutForm } from "../utils/apiClient";

const LOCAL_ABOUT_KEY = "dashboard_about_data";

const defaultAboutData = {
  vision: "To nurture confident, creative, and responsible learners.",
  mission: "To provide accessible quality education in a safe, supportive environment.",
  director: "Mr. John Doe",
  head_teacher: "Mrs. Jane Smith",
  deputy_head_teacher: "Mr. Alex Johnson",
  achievements: "Award-winning school with excellent exam results.",
  director_image: "",
  head_teacher_image: "",
  deputy_head_teacher_image: ""
};

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

const normalizeAboutData = (data) => ({
  ...defaultAboutData,
  ...data,
  vision: data.vision || data.about_text || defaultAboutData.vision,
  mission: data.mission || defaultAboutData.mission,
  director: data.director || defaultAboutData.director,
  head_teacher: data.head_teacher || data.headTeacher || defaultAboutData.head_teacher,
  deputy_head_teacher:
    data.deputy_head_teacher || data.deputyHeadTeacher || defaultAboutData.deputy_head_teacher,
  director_image:
    data.director_image || data.director_photo || data.directorImage || "",
  head_teacher_image:
    data.head_teacher_image || data.headTeacherImage || data.head_teacher_photo || "",
  deputy_head_teacher_image:
    data.deputy_head_teacher_image || data.deputyHeadTeacherImage ||
    data.deputy_head_teacher_photo || "",
  achievements: data.achievements || data.achievement || defaultAboutData.achievements
});

export default function AboutDashboard() {
  const [aboutData, setAboutData] = useState(defaultAboutData);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [leadershipFiles, setLeadershipFiles] = useState({
    director: null,
    head_teacher: null,
    deputy_head_teacher: null
  });
  const [leadershipPreviews, setLeadershipPreviews] = useState({
    director: "",
    head_teacher: "",
    deputy_head_teacher: ""
  });

  const loadAboutDataFromStorage = () => {
    try {
      const saved = localStorage.getItem(LOCAL_ABOUT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("Could not read about fallback from localStorage", err);
      return null;
    }
  };

  const saveAboutDataToStorage = (payload) => {
    try {
      localStorage.setItem(LOCAL_ABOUT_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Could not save about fallback to localStorage", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        let data = await apiGet("/about");
        data = unwrapPayload(data) || {};
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }
        const normalized = normalizeAboutData(data);
        setAboutData(normalized);
        saveAboutDataToStorage(normalized);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Error fetching about data:", err);
      }

      const fallback = loadAboutDataFromStorage();
      if (fallback) {
        setAboutData(normalizeAboutData(fallback));
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeadershipFileChange = async (key, file) => {
    if (!file) return;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setLeadershipFiles((prev) => ({ ...prev, [key]: file }));
    setLeadershipPreviews((prev) => ({
      ...prev,
      [key]: dataUrl
    }));
    setAboutData((prev) => ({
      ...prev,
      [`${key}_image`]: dataUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const hasFiles = Object.values(leadershipFiles).some(Boolean);
      const currentData = normalizeAboutData(aboutData);
      saveAboutDataToStorage(currentData);

      let response;
      if (hasFiles) {
        const formData = new FormData();
        Object.entries(currentData).forEach(([key, value]) => {
          if (value == null) return;
          if (
            [
              "director_image",
              "head_teacher_image",
              "deputy_head_teacher_image"
            ].includes(key) &&
            leadershipFiles[key.replace("_image", "")]
          ) {
            return;
          }
          formData.append(key, value);
        });

        if (leadershipFiles.director) {
          formData.append("director_image", leadershipFiles.director);
        }
        if (leadershipFiles.head_teacher) {
          formData.append("head_teacher_image", leadershipFiles.head_teacher);
        }
        if (leadershipFiles.deputy_head_teacher) {
          formData.append(
            "deputy_head_teacher_image",
            leadershipFiles.deputy_head_teacher
          );
        }

        // Log outgoing FormData for debugging
        try {
          const entries = [];
          for (const pair of formData.entries()) {
            const [k, v] = pair;
            if (v && v.name) entries.push({ key: k, fileName: v.name, size: v.size });
            else entries.push({ key: k, value: v });
          }
          console.log("PUT /about (FormData) ->", entries);
        } catch (logErr) {
          console.warn("Could not serialize FormData for logging", logErr);
        }

        response = await apiPutForm("/about", formData);
      } else {
        console.log("PUT /about (JSON) ->", currentData);
        response = await apiPut("/about", currentData);
      }

      console.log("/about response ->", response);

      const data = unwrapPayload(response) || {};
      let savedData = normalizeAboutData(data);

      // Merge image previews persisted locally into server response when server omits them
      const fields = [
        "director_image",
        "head_teacher_image",
        "deputy_head_teacher_image"
      ];
      fields.forEach((f) => {
        // Prefer server URL if available, otherwise use local preview
        if ((!savedData[f] || savedData[f] === "") && currentData[f]) {
          savedData[f] = currentData[f];
        }
      });

      // If leadership array exists, ensure photos from previews are preserved
      if (Array.isArray(savedData.leadership) && Array.isArray(currentData.leadership)) {
        savedData.leadership = savedData.leadership.map((l, idx) => ({
          ...l,
          photo:
            l.photo || (currentData.leadership[idx] && currentData.leadership[idx].photo) || l.photo
        }));
      }

      setAboutData(savedData);
      saveAboutDataToStorage(savedData);
      setLeadershipFiles({
        director: null,
        head_teacher: null,
        deputy_head_teacher: null
      });
      setLeadershipPreviews({
        director: "",
        head_teacher: "",
        deputy_head_teacher: ""
      });
      setMessage("✅ Updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      saveAboutDataToStorage(normalizeAboutData(aboutData));
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
        <textarea name="vision" value={aboutData.vision} onChange={handleChange} />
        <label>Mission</label>
        <textarea name="mission" value={aboutData.mission} onChange={handleChange} />
        <h3>Leadership</h3>
        <label>Director</label>
        <input type="text" name="director" value={aboutData.director} onChange={handleChange} />
        <label>Director Photo URL</label>
        <input type="text" name="director_image" value={aboutData.director_image || ""} onChange={handleChange} />
        <label>Upload Director Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleLeadershipFileChange("director", e.target.files?.[0])}
        />
        {leadershipPreviews.director && (
          <img src={leadershipPreviews.director} alt="Director preview" className="preview-image" />
        )}

        <label>Head Teacher</label>
        <input type="text" name="head_teacher" value={aboutData.head_teacher} onChange={handleChange} />
        <label>Head Teacher Photo URL</label>
        <input type="text" name="head_teacher_image" value={aboutData.head_teacher_image || ""} onChange={handleChange} />
        <label>Upload Head Teacher Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleLeadershipFileChange("head_teacher", e.target.files?.[0])}
        />
        {leadershipPreviews.head_teacher && (
          <img src={leadershipPreviews.head_teacher} alt="Head teacher preview" className="preview-image" />
        )}

        <label>Deputy Head Teacher</label>
        <input type="text" name="deputy_head_teacher" value={aboutData.deputy_head_teacher} onChange={handleChange} />
        <label>Deputy Head Teacher Photo URL</label>
        <input type="text" name="deputy_head_teacher_image" value={aboutData.deputy_head_teacher_image || ""} onChange={handleChange} />
        <label>Upload Deputy Head Teacher Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleLeadershipFileChange("deputy_head_teacher", e.target.files?.[0])}
        />
        {leadershipPreviews.deputy_head_teacher && (
          <img src={leadershipPreviews.deputy_head_teacher} alt="Deputy head preview" className="preview-image" />
        )}
        <h3>Achievements</h3>
        <textarea name="achievements" value={aboutData.achievements} onChange={handleChange} />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
