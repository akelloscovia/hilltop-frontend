import React, { useEffect, useState } from "react";
import "./gallerydashboard.css";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function GalleryDashboard() {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");

  // FETCH IMAGES FROM BACKEND
  const fetchImages = () => {
    fetch(`${API_BASE_URL}/api/v1/gallery`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setImages(data))
      .catch(err => console.error("Error fetching gallery images:", err));
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // UPLOAD IMAGE
  const handleUpload = async (e) => {
    const files = e.target.files;

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setMessage("✅ Images uploaded!");
        fetchImages(); // refresh
      } else {
        setMessage("❌ Upload failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error uploading");
    }
  };

  // DELETE IMAGE
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setImages(images.filter(img => img.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="gallery-dashboard">
      <h2>Gallery Dashboard</h2>

      {message && <p className="message">{message}</p>}

      {/* Upload */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        className="upload-input"
      />

      {/* Images */}
      <div className="gallery-grid">
        {images.length === 0 ? (
          <p>No images uploaded yet</p>
        ) : (
          images.map((img) => (
            <div key={img.id} className="image-card">
              <img
                src={`${API_BASE_URL}/${img.image_url}`}
                alt="gallery"
              />
              <button onClick={() => handleDelete(img.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}