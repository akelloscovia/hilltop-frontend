import React, { useEffect, useState } from "react";
import "./gallery.css";

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [bgImage, setBgImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback images
  const fallbackImages = [
    "/images/students.jpg",
    "/images/students2.jpg",
    "/images/students3.jpg"
  ];

  // Fetch gallery images from backend
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/v1/gallery");
        if (!response.ok) throw new Error("Failed to fetch gallery");
        const data = await response.json();

        if (data.images && data.images.length > 0) {
          setGalleryImages(data.images);
          setBgImage(data.images[Math.floor(Math.random() * data.images.length)]);
        } else {
          setGalleryImages(fallbackImages);
          setBgImage(fallbackImages[0]);
        }
      } catch (err) {
        console.error("Error fetching gallery images:", err);
        setError(err.message);
        setGalleryImages(fallbackImages);
        setBgImage(fallbackImages[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Handle file uploads locally
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setGalleryImages((prev) => [...prev, ...imageUrls]);
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading gallery...</div>;
  }

  return (
    <div
      className="gallery-page"
      style={{
        backgroundImage: `linear-gradient(rgba(2,5,40,0.7), rgba(10,47,146,0.7)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.6s ease-in-out"
      }}
    >
      <div className="gallery-content">
        <section className="gallery-section">
          <h2>School Gallery</h2>
          <p style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            Explore photos of our students, activities, and school events.
          </p>

          {/* Upload Input */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="upload-input"
          />

          {/* Display Images */}
          <div className="gallery-grid">
            {galleryImages.length === 0 && <p>No images available.</p>}
            {galleryImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Gallery ${index + 1}`}
                className="gallery-img"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.jpg";
                }}
              />
            ))}
          </div>
          {error && <div style={{ textAlign: "center", color: "yellow", marginTop: "1rem" }}>Note: Showing default images. Real data unavailable.</div>}
        </section>
      </div>
    </div>
  );
}