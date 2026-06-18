import React, { useState } from 'react';
import { apiPostForm, apiGet } from '../utils/apiClient';

const LOCAL_GALLERY_KEY = 'dashboard_gallery_images';

const getImageSource = (item) => {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.image || item.image_url || item.url || item.src || item.photo || null;
  }
  return null;
};

const normalizeGalleryImages = (gallery) => {
  if (!gallery) return [];
  const rawImages = Array.isArray(gallery)
    ? gallery
    : Array.isArray(gallery.gallery_images)
    ? gallery.gallery_images
    : Array.isArray(gallery.images)
    ? gallery.images
    : [];

  return rawImages
    .map(getImageSource)
    .filter(Boolean)
    .map((src) => (src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}`));
};

const saveGalleryImagesToStorage = (images) => {
  try {
    localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(images));
  } catch (err) {
    console.error('Could not save gallery fallback to localStorage', err);
  }
};

const loadGalleryFromStorage = () => {
  try {
    const saved = localStorage.getItem(LOCAL_GALLERY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Could not read gallery fallback from localStorage', err);
    return [];
  }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function GalleryUpload({ onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('gallery_images[]', file);
      fd.append('images[]', file);
      fd.append('image', file);
      fd.append('file', file);
      fd.append('title', file.name);

      const res = await apiPostForm('/gallery', fd);
      // Try to return the updated gallery list when possible
      let gallery = res;
      try {
        const g = await apiGet('/gallery');
        gallery = g;
      } catch (err) {
        console.warn('Could not refresh gallery after upload', err);
      }

      const images = normalizeGalleryImages(gallery);
      if (images.length > 0) {
        saveGalleryImagesToStorage(images);
      } else {
        const fallbackUrl = await fileToDataUrl(file);
        const fallbackImages = [...loadGalleryFromStorage(), fallbackUrl];
        saveGalleryImagesToStorage(fallbackImages);
        gallery = { gallery_images: fallbackImages };
      }

      if (onSaved) onSaved(gallery);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="gallery-upload">
      <label>Upload Wallpaper</label>
      <input type="file" accept="image/*" onChange={handleChange} />
      {preview && (
        <div style={{ marginTop: 8 }}>
          <img src={preview} alt="preview" style={{ maxWidth: 240 }} />
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
