import React, { useEffect, useState } from "react";
import "./about.css";
import { apiGet } from "../utils/apiClient";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";
const LOCAL_ABOUT_KEY = "dashboard_about_data";

const loadAboutFallback = () => {
  try {
    const saved = localStorage.getItem(LOCAL_ABOUT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("Could not read about fallback from localStorage", err);
    return null;
  }
};

const getImageUrl = (value) => {
  if (!value) return "";
  if (
    value.startsWith("http") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  if (API_BASE_URL) return `${API_BASE_URL}/${value}`;
  return value.startsWith("/") ? value : `/${value}`;
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

const resolveLeadership = (data) => {
  if (Array.isArray(data.leadership) && data.leadership.length > 0) {
    return data.leadership.map((leader) =>
      typeof leader === "string" ? { position: "", name: leader } : leader
    );
  }

  if (typeof data.leadership === "string") {
    return data.leadership
      .split(/\n|\r|,|\u2022|\*|\-/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ position: "", name }));
  }

  return [
    {
      position: "Director",
      name: data.director || data.director_name || data.headmaster || "",
      photo: data.director_image || data.director_photo || data.director_avatar
    },
    {
      position: "Head Teacher",
      name: data.head_teacher || data.headTeacher || "",
      photo: data.head_teacher_image || data.headTeacherImage || data.head_teacher_photo
    },
    {
      position: "Deputy Head Teacher",
      name: data.deputy_head_teacher || data.deputyHeadTeacher || "",
      photo: data.deputy_head_teacher_image || data.deputyHeadTeacherImage || data.deputy_head_teacher_photo
    }
  ].filter((item) => item.name);
};

const getLeaderPhoto = (leader) => {
  const imageSource =
    leader.image ||
    leader.photo ||
    leader.avatar ||
    leader.image_url ||
    leader.imageUrl ||
    leader.photo_url ||
    leader.photoUrl ||
    leader.avatar_url ||
    leader.avatarUrl ||
    leader.photo;

  return getImageUrl(imageSource);
};

const normalizeAboutData = (data) => ({
  ...data,
  leadership: resolveLeadership(data),
  achievements:
    Array.isArray(data.achievements)
      ? data.achievements
      : typeof data.achievements === "string"
      ? data.achievements
          .split(/\n|\r|\u2022|\*|\-/)
          .map((item) => item.trim())
          .filter(Boolean)
      : typeof data.achievement === "string"
      ? data.achievement
          .split(/\n|\r|\u2022|\*|\-/)
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  hero_images:
    Array.isArray(data.hero_images)
      ? data.hero_images
      : Array.isArray(data.images)
      ? data.images
      : []
});

export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
      let fallback = loadAboutFallback();

      try {
        let data = await apiGet("/about");
        data = unwrapPayload(data) || {};
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }
        const normalized = normalizeAboutData(data || {});
        const normalizedFallback = normalizeAboutData(fallback || {});
        const merged = {
          ...normalizedFallback,
          ...normalized,
          leadership:
            Array.isArray(normalized.leadership) && normalized.leadership.length > 0
              ? normalized.leadership
              : normalizedFallback.leadership,
          hero_images:
            Array.isArray(normalized.hero_images) && normalized.hero_images.length > 0
              ? normalized.hero_images
              : normalizedFallback.hero_images,
          achievements:
            Array.isArray(normalized.achievements) && normalized.achievements.length > 0
              ? normalized.achievements
              : normalizedFallback.achievements
        };

        // Preserve image fields from localStorage if API doesn't return them
        const imageFields = [
          'director_image',
          'head_teacher_image',
          'deputy_head_teacher_image'
        ];
        imageFields.forEach((field) => {
          if ((!merged[field] || merged[field] === '') && normalizedFallback[field]) {
            merged[field] = normalizedFallback[field];
          }
        });

        // If the server returned leadership entries but omitted photos,
        // prefer photos from the local fallback so uploaded images still show.
        const mergedWithPhotos = { ...merged };
        if (Array.isArray(merged.leadership) && Array.isArray(normalizedFallback.leadership)) {
          mergedWithPhotos.leadership = merged.leadership.map((leader) => {
            if (leader.photo) return leader;
            // try to find matching leader in fallback by name or position
            const match = normalizedFallback.leadership.find((f) => {
              if (!f) return false;
              if (f.name && leader.name && f.name === leader.name) return true;
              if (f.position && leader.position && f.position === leader.position) return true;
              return false;
            });
            if (match && (match.photo || match.image || match.avatar)) {
              return { ...leader, photo: match.photo || match.image || match.avatar };
            }
            return leader;
          });
        }

        setAboutData(mergedWithPhotos);

        let image = "";
        if (merged.hero_images.length > 0) {
          const random =
            merged.hero_images[
              Math.floor(Math.random() * merged.hero_images.length)
            ];
          image = getImageUrl(random);
        }

        setHeroImage(image);
        setError(null);
        setLoading(false);
        return;
      } catch (err) {
        console.error("About fetch error:", err);
        setError(err.message);
      }

      if (fallback) {
        const normalizedFallback = normalizeAboutData(fallback);
        setAboutData(normalizedFallback);
        if (normalizedFallback.hero_images.length > 0) {
          const random =
            normalizedFallback.hero_images[
              Math.floor(Math.random() * normalizedFallback.hero_images.length)
            ];
          setHeroImage(getImageUrl(random));
        }
      } else {
        setAboutData(normalizeAboutData({}));
        setHeroImage("");
      }

      setLoading(false);
    };

    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading About Page...
      </div>
    );
  }

  const data = aboutData || {};

  return (
    <div
      className="about-page"
      style={{
        backgroundImage: heroImage
          ? `linear-gradient(rgba(4,9,47,0.8), rgba(10,47,92,0.8)), url(${heroImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#fff"
      }}
    >
      <section className="about-hero">
        {heroImage && (
          <img
            src={heroImage}
            alt="School"
            onError={(e) => {
              if (e.target.src !== "/images/placeholder.jpg") {
                e.target.src = "/images/placeholder.jpg";
              }
            }}
          />
        )}

        <h1>{data.hero_title || "Not set in dashboard"}</h1>
        {(data.subtitle || data.about_text || data.description) && (
          <p>{data.subtitle || data.about_text || data.description}</p>
        )}
      </section>

      <section className="section foundation">
        <h2 className="section-title">Our Foundation</h2>
        <div className="foundation-grid">
          <div className="foundation-card">
            <div className="card-header">
              <span className="foundation-icon vision-icon" aria-hidden="true" />
              <h4>VISION</h4>
            </div>
            <p>{data.vision || "Vision text is not set yet."}</p>
          </div>
          <div className="foundation-card">
            <div className="card-header">
              <span className="foundation-icon mission-icon" aria-hidden="true" />
              <h4>MISSION</h4>
            </div>
            <p>{data.mission || "Mission text is not set yet."}</p>
          </div>
        </div>
      </section>

      <section className="section leadership">
        <h2 className="section-title">Our Leadership</h2>
        <div className="leaders">
          {data.leadership.map((leader, index) => {
            const leaderPhoto = getLeaderPhoto(leader);
            return (
              <div key={index} className="leader-card">
                <div className="leader-photo">
                  {leaderPhoto ? (
                    <img
                      src={leaderPhoto}
                      alt={leader.name ? `${leader.name} photo` : "Leader photo"}
                      onError={(e) => {
                        if (e.target.src !== "/images/placeholder.jpg") {
                          e.target.src = "/images/placeholder.jpg";
                        }
                      }}
                    />
                  ) : (
                    <span className="leader-photo-label">Photo</span>
                  )}
                </div>
                <div className="leader-info">
                  <strong>{leader.position || "Leader"}</strong>
                  <p>{leader.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section achievements">
        <h2 className="section-title">Our Achievements</h2>
        {Array.isArray(data.achievements) && data.achievements.length > 0 ? (
          <div className="achievements-list">
            {data.achievements.map((item, index) => (
              <div key={index} className="achievement-box">
                <p>{item}</p>
              </div>
            ))}
          </div>
        ) : typeof data.achievements === "string" && data.achievements.trim() ? (
          <div className="achievement-box">
            <p>{data.achievements}</p>
          </div>
        ) : (
          <p>No achievements set in dashboard.</p>
        )}
      </section>

      {error && (
        <div style={{ textAlign: "center", color: "yellow", marginTop: "1rem" }}>
          Using empty CMS data (not set in dashboard)
        </div>
      )}
    </div>
  );
}
