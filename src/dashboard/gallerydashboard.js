import React, { useEffect, useState } from "react";
import "./gallerydashboard.css";
import { apiGet, apiDelete, apiPostForm } from "../utils/apiClient";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";
const LOCAL_GALLERY_KEY = "dashboard_gallery_images";

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

const normalizeGalleryData = (data) => {
  const rawImages = Array.isArray(data)
    ? data
    : Array.isArray(data.images)
    ? data.images
    : Array.isArray(data.gallery_images)
    ? data.gallery_images
    : [];

  return rawImages
    .map((img) => {
      if (typeof img === "string") {
        if (img.startsWith("http")) {
          return { id: null, url: img };
        }

        return {
          id: null,
          url: API_BASE_URL ? `${API_BASE_URL}/${img}` : img.startsWith("/") ? img : `/${img}`
        };
      }

      const imagePath = img?.image_url || img?.image || img?.url || img?.src;
      if (!imagePath) return null;

      if (
        imagePath.startsWith("http") ||
        imagePath.startsWith("data:") ||
        imagePath.startsWith("blob:")
      ) {
        return { id: img?.id ?? null, url: imagePath };
      }

      return {
        id: img?.id ?? null,
        url: API_BASE_URL
          ? `${API_BASE_URL}/${imagePath}`
          : imagePath.startsWith("/")
          ? imagePath
          : `/${imagePath}`
      };
    })
    .filter(Boolean);
};

export default function GalleryDashboard() {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const loadGalleryFromStorage = () => {
    try {
      const saved = localStorage.getItem(LOCAL_GALLERY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Could not read gallery fallback from localStorage", err);
      return [];
    }
  };

  const saveGalleryToStorage = (normalizedImages) => {
    try {
      localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(normalizedImages));
    } catch (err) {
      console.error("Could not save gallery fallback to localStorage", err);
    }
  };

  const fetchImages = async () => {
    try {
      const rawData = await apiGet("/gallery");
      const data = unwrapPayload(rawData) || {};
      const normalized = normalizeGalleryData(data);
      if (normalized.length > 0) {
        setImages(normalized);
        saveGalleryToStorage(normalized);
      } else {
        const fallback = loadGalleryFromStorage();
        setImages(fallback);
        if (fallback.length) {
          setMessage("⚠️ Using saved gallery data from local storage.");
        }
      }
    } catch (err) {
      console.error("Error fetching gallery images:", err);
      const fallback = loadGalleryFromStorage();
      if (fallback.length) {
        setImages(fallback);
        setMessage("⚠️ Using saved gallery data from local storage.");
      } else {
        setMessage("❌ Unable to load gallery images");
      }
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const fileListToDataUrls = async (files) => {
    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ id: null, url: reader.result, title: file.name });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(readers);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      setMessage("❌ Select one or more files first");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("gallery_images[]", file);
      formData.append("images[]", file);
      formData.append("file", file);
    });

    try {
      const response = await apiPostForm("/gallery", formData);
      const rawResponse = unwrapPayload(response) || {};
      const normalized = normalizeGalleryData(rawResponse);
      if (normalized.length > 0) {
        setImages(normalized);
        saveGalleryToStorage(normalized);
      } else {
        const dataUrls = await fileListToDataUrls(selectedFiles);
        const fallbackImages = [...loadGalleryFromStorage(), ...dataUrls];
        saveGalleryToStorage(fallbackImages);
        setImages(fallbackImages);
      }
      setSelectedFiles([]);
      setMessage("✅ Images uploaded successfully!");
      await fetchImages();
    } catch (err) {
      console.error(err);
      const dataUrls = await fileListToDataUrls(selectedFiles);
      const fallbackImages = [...loadGalleryFromStorage(), ...dataUrls];
      saveGalleryToStorage(fallbackImages);
      setImages(fallbackImages);
      setSelectedFiles([]);
      setMessage(`⚠️ Upload saved locally. ${err?.message ? err.message : "Backend failed."}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/gallery/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      setMessage("✅ Image removed");
    } catch (err) {
      console.error(err);
      setMessage("❌ Delete failed");
    }
  };

  return (
    <div className="gallery-dashboard">
      <h2>Gallery Dashboard</h2>
      {message && <p className="message">{message}</p>}
      <form className="upload-form" onSubmit={handleUpload}>
        <label className="upload-label">
          Upload gallery images
          <input
            type="file"
            name="images[]"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="upload-input"
          />
        </label>
        <button type="submit" disabled={!selectedFiles.length} className="upload-button">
          Upload Images
        </button>
        {selectedFiles.length > 0 && (
          <p className="file-count">{selectedFiles.length} file(s) selected</p>
        )}
      </form>
      <div className="gallery-grid">
        {images.length === 0 ? (
          <div className="empty-state">No images uploaded yet</div>
        ) : (
          images.map((img, index) => (
            <div key={`${img.id || index}-${img.url}`} className="image-card">
              <img src={img.url} alt={`gallery-${index}`} />
              {img.id ? (
                <button onClick={() => handleDelete(img.id)}>Delete</button>
              ) : (
                <span className="meta-note">Saved image</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

