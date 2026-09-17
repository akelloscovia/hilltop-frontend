import React, { useEffect, useState } from "react";
import "./gallery.css";
import { apiGet } from "../utils/apiClient";
import { groupGalleryByCategory } from "../data/galleryCategories";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";
const LOCAL_GALLERY_KEY = "dashboard_gallery_images";

const loadGalleryFromStorage = () => {
  try {
    const saved = localStorage.getItem(LOCAL_GALLERY_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    // Support entries cached by an older version of this page (plain src strings)
    return parsed.map((item) =>
      typeof item === "string" ? { src: item, category: undefined } : item
    );
  } catch (err) {
    console.error("Could not read gallery fallback from localStorage", err);
    return [];
  }
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

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (
    imagePath.startsWith("http") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("/images/")
  )
    return imagePath;
  if (API_BASE_URL) return `${API_BASE_URL}/${imagePath}`;
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
};

// Normalizes a raw gallery item (string or object) into { src, category }
const getImageEntry = (img) => {
  if (typeof img === "string") {
    const src = resolveImageUrl(img);
    return src ? { src, category: undefined } : null;
  }

  const imagePath = img?.image || img?.image_url || img?.url || img?.src;
  const src = resolveImageUrl(imagePath);
  return src ? { src, category: img?.category } : null;
};

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [bgImage, setBgImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const rawData = await apiGet("/gallery");
        const data = unwrapPayload(rawData) || {};

        const rawImages = Array.isArray(data)
          ? data
          : Array.isArray(data.images)
          ? data.images
          : Array.isArray(data.gallery_images)
          ? data.gallery_images
          : [];

        const formattedImages = rawImages
          .map(getImageEntry)
          .filter(Boolean);

        if (formattedImages.length > 0) {
          setGalleryImages(formattedImages);
          localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(formattedImages));
          setBgImage(
            formattedImages[Math.floor(Math.random() * formattedImages.length)].src
          );
        } else {
          const fallback = loadGalleryFromStorage();
          setGalleryImages(fallback);
          setBgImage(
            fallback.length > 0
              ? fallback[Math.floor(Math.random() * fallback.length)].src
              : ""
          );
        }
      } catch (err) {
        console.error("Gallery fetch error:", err);
        const fallback = loadGalleryFromStorage();
        setGalleryImages(fallback);
        setBgImage("");
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading gallery...
      </div>
    );
  }

  return (
    <div
      className="gallery-page"
      style={{
        backgroundImage: bgImage
          ? `linear-gradient(rgba(2,5,40,0.7), rgba(10,47,146,0.7)), url(${bgImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="gallery-content">
        <section className="gallery-section">
          <h2>School Gallery</h2>

          <p style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            Explore photos of our students, activities, and school events.
          </p>

          {galleryImages.length === 0 ? (
            <p style={{ textAlign: "center" }}>
              No images uploaded from the dashboard yet.
            </p>
          ) : (
            groupGalleryByCategory(galleryImages).map(({ category, items }) => (
              <div key={category} className="gallery-category-section">
                <h3>{category}</h3>

                {items.length > 0 ? (
                  <div className="gallery-grid">
                    {items.map((entry, index) => (
                      <img
                        key={`${entry.src}-${index}`}
                        src={entry.src}
                        alt={`${category} ${index + 1}`}
                        className="gallery-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: "center" }}>No photos in this section yet.</p>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

