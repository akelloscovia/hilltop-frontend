import React, { useEffect, useState } from "react";
import "./home.css";
import { apiGet } from "../utils/apiClient";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";
const LOCAL_HOME_KEY = "dashboard_home_data";
const LOCAL_GALLERY_KEY = "dashboard_gallery_images";

const loadHomeFallback = () => {
  try {
    const saved = localStorage.getItem(LOCAL_HOME_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("Could not read home fallback from localStorage", err);
    return null;
  }
};

const getImageUrl = (value) => {
  if (!value) return "";
  if (typeof value !== "string") {
    return "";
  }

  const cleanValue = value.trim();
  if (!cleanValue) return "";
  if (
    cleanValue.startsWith("http") ||
    cleanValue.startsWith("data:") ||
    cleanValue.startsWith("blob:")
  ) {
    return cleanValue;
  }
  if (cleanValue.startsWith("/api/")) return cleanValue;
  if (API_BASE_URL) return `${API_BASE_URL}/${cleanValue.replace(/^\/+/, "")}`;
  return cleanValue.startsWith("/") ? cleanValue : `/${cleanValue}`;
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

const resolveGalleryImages = (data) => {
  if (!data) return [];

  const normalizeCandidate = (item) => {
    if (typeof item === "string") return item.trim();
    if (item && typeof item === "object") {
      return item.image || item.image_url || item.url || item.src || item.filename || "";
    }
    return "";
  };

  if (Array.isArray(data)) {
    return data
      .map(normalizeCandidate)
      .filter(Boolean);
  }

  const candidates = Array.isArray(data.gallery_images)
    ? data.gallery_images
    : Array.isArray(data.images)
    ? data.images
    : Array.isArray(data.gallery)
    ? data.gallery
    : [];

  if (candidates.length > 0) {
    return candidates
      .map(normalizeCandidate)
      .filter(Boolean);
  }

  const raw = data.gallery_images || data.images || data.gallery;
  if (typeof raw === "string") {
    return raw
      .split(/\n|\r|,/) 
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeCoreValue = (value) => {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    return value.title || value.name || value.label || value.value || "";
  }
  return "";
};

const normalizeCoreValues = (data) => {
  const raw = Array.isArray(data?.core_values)
    ? data.core_values
    : Array.isArray(data?.coreValues)
    ? data.coreValues
    : data?.core_values || data?.coreValues;

  if (Array.isArray(raw)) {
    return raw
      .map(normalizeCoreValue)
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    return raw
      .split(/\n|\r|,|•/) 
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const deduplicateCoreValues = (values) => {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  return values.reduce((acc, value) => {
    const normalizedValue = normalizeCoreValue(value);
    if (!normalizedValue) return acc;

    const key = normalizedValue.toLowerCase().trim();
    if (seen.has(key)) return acc;

    seen.add(key);
    acc.push(normalizedValue);
    return acc;
  }, []);
};

const loadGalleryFallback = () => {
  try {
    const saved = localStorage.getItem(LOCAL_GALLERY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Could not read gallery fallback from localStorage", err);
    return [];
  }
};

const firstNonEmpty = (...vals) => {
  for (const v of vals) {
    if (v == null) continue;
    if (Array.isArray(v) && v.length > 0) return v;
    if (typeof v === 'string' && v.trim() !== '') return v;
    if (typeof v === 'object' && Object.keys(v).length > 0) return v;
  }
  return null;
};

export default function Home() {
  const [heroImage, setHeroImage] = useState("");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const rawData = await apiGet("/home");
        console.debug('Home rawData:', rawData);
        let data = unwrapPayload(rawData) || {};
        console.debug('Home unwrapped data:', data);
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }
        const fallback = loadHomeFallback();
        console.debug('Home fallback from localStorage:', fallback);

        let image = "";
        const heroSource =
          data.hero_image ||
          data.image_url ||
          data.image ||
          data.heroImage ||
          data.hero_image_url ||
          fallback?.hero_image;

        const rawGallery = resolveGalleryImages(data);
        let galleryCandidates = rawGallery;

        if (!galleryCandidates.length) {
          try {
            const galleryRawData = await apiGet("/gallery");
            let galleryData = unwrapPayload(galleryRawData) || {};
            if (Array.isArray(galleryData) && galleryData.length > 0) {
              galleryData = galleryData[0];
            }
            galleryCandidates = resolveGalleryImages(galleryData);
            if (!galleryCandidates.length) {
              galleryCandidates = loadGalleryFallback();
            }
          } catch (err) {
            console.warn("Gallery fallback fetch failed:", err);
            galleryCandidates = loadGalleryFallback();
          }
        }

        if (heroSource) {
          image = getImageUrl(heroSource);
        } else if (galleryCandidates.length > 0) {
          const random = galleryCandidates[Math.floor(Math.random() * galleryCandidates.length)];
          image = getImageUrl(random?.image || random?.image_url || random?.url || random?.src || random);
        }

        setHeroImage(image);
        const introText =
          firstNonEmpty(
            data.about_text,
            data.description,
            data.intro,
            data.home_text,
            data.home_intro,
            data.body,
            data.text,
            fallback?.about_text,
            fallback?.description,
            fallback?.intro,
            fallback?.home_text,
            fallback?.home_intro
          ) ||
          "Hilltop Junior School is a warm and vibrant learning community offering Daycare, Kindergarten, and Primary education. We provide a safe, friendly, and inclusive environment where every child thrives.";

        setContent({
          welcomeText: data.hero_title || data.title || data.heading || fallback?.hero_title || "",
          subtitle: data.hero_subtitle || data.subtitle || data.tagline || fallback?.hero_subtitle || "",
          intro: introText,
          vision: data.vision || fallback?.vision || "",
          mission: data.mission || fallback?.mission || "",
          coreValues: (() => {
            const normalized = deduplicateCoreValues([
              ...normalizeCoreValues(data),
              ...normalizeCoreValues(fallback || {})
            ]);
            return normalized;
          })()
        });

        // Try to merge additional fields from /about if available
        try {
          const aboutRaw = await apiGet("/about");
          let aboutData = unwrapPayload(aboutRaw) || {};
          if (Array.isArray(aboutData) && aboutData.length > 0) aboutData = aboutData[0];

          setContent((prev) => {
            const mergedCore = deduplicateCoreValues([
              ...normalizeCoreValues(data),
              ...normalizeCoreValues(aboutData || {})
            ]);

            return {
              ...prev,
              vision: prev.vision || aboutData.vision || aboutData.about_text || "",
              mission: prev.mission || aboutData.mission || "",
              coreValues: (Array.isArray(mergedCore) && mergedCore.length > 0) ? mergedCore : prev.coreValues,
              leadership: aboutData.leadership || aboutData.team || aboutData.staff || fallback?.leadership || undefined,
              achievements: aboutData.achievements || aboutData.achievement || fallback?.achievements || ""
            };
          });
        } catch (err) {
          // ignore about merge errors
        }
      } catch (err) {
        console.error("Home fetch error:", err);
        const fallback = loadHomeFallback();
        setHeroImage("");
        const introFallback =
          firstNonEmpty(
            fallback?.about_text,
            fallback?.description,
            fallback?.intro,
            fallback?.home_text,
            fallback?.home_intro,
            fallback?.body,
            fallback?.text
          ) ||
          "Hilltop Junior School is a warm and vibrant learning community offering Daycare, Kindergarten, and Primary education. We provide a safe, friendly, and inclusive environment where every child thrives.";

        setContent({
          welcomeText: fallback?.hero_title || "",
          subtitle: fallback?.hero_subtitle || "",
          intro: introFallback,
          vision: fallback?.vision || "",
          mission: fallback?.mission || "",
          coreValues: (() => {
            const normalized = deduplicateCoreValues(normalizeCoreValues(fallback || {}));
            return normalized;
          })()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  if (loading) return <p>Loading home page...</p>;
  if (!content) return <p>No content found</p>;

  return (
    <div
      className="home-page"
      style={{
        backgroundImage: heroImage
          ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${heroImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#fff"
      }}
    >
      <section className="hero-section">
        {heroImage && (
          <img
            src={heroImage}
            alt="hero"
            className="hero-img"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/images/placeholder.jpg";
            }}
          />
        )}

        <div className="hero-text">
          <h1>{content.welcomeText}</h1>
          <h2>{content.subtitle || "Hilltop Junior School Kasangati"}</h2>
          <p>{content.intro}</p>
        </div>
      </section>

      <section className="values-section">
        <h3>OUR CORE VALUES</h3>

        <div className="value-cards">
          {Array.isArray(content.coreValues) &&
          content.coreValues.length > 0 ? (
            content.coreValues.map((value, index) => (
              <div className="card" key={index}>
                <h4>{typeof value === 'object' ? value.title || value.name : value}</h4>
                <p>{typeof value === 'object' ? value.description || value.text : value}</p>
              </div>
            ))
          ) : (
            <p>No core values set in dashboard yet.</p>
          )}
        </div>
      </section>

      <section className="achievements-section">
        <h3>We strive for high standards in learning and behavior.</h3>
        <p>
          Hilltop Junior School is a warm and vibrant learning community offering Day care, Kindergarten, and Primary education. The school provides a safe and nurturing environment where children grow academically, socially, and morally. With dedicated teachers, engaging learning experiences, and supportive care at every stage, Hilltop ensures learners build a strong foundation and develop the confidence and skills they need to succeed.
        </p>
      </section>

      {((Array.isArray(content.leadership) && content.leadership.length > 0) || content.director || content.head_teacher || content.deputy_head_teacher) && (
        <section className="leadership-section">
          <h3>Leadership</h3>
          <div className="leadership-cards">
            {Array.isArray(content.leadership) && content.leadership.length > 0
              ? content.leadership.map((l, i) => (
                  <div className="leader" key={i}>
                    {l.photo && <img src={getImageUrl(l.photo)} alt={l.name || l.title || `leader-${i}`} />}
                    <h4>{l.name || l.title || l.position}</h4>
                    {l.role && <p>{l.role}</p>}
                  </div>
                ))
              : [
                  { name: content.director, role: 'Director', photo: content.director_image },
                  { name: content.head_teacher, role: 'Head Teacher', photo: content.head_teacher_image },
                  { name: content.deputy_head_teacher, role: 'Deputy Head Teacher', photo: content.deputy_head_teacher_image }
                ].filter(item => item.name || item.photo).map((l, i) => (
                  <div className="leader" key={i}>
                    {l.photo && <img src={getImageUrl(l.photo)} alt={l.name || `leader-${i}`} />}
                    <h4>{l.name}</h4>
                    <p>{l.role}</p>
                  </div>
                ))}
          </div>
        </section>
      )}
    </div>
  );
}

