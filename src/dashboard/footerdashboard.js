import React, { useEffect, useState } from "react";
import "./footerdashboard.css";
import { apiGet, apiPut } from "../utils/apiClient";

const USE_FOOTER_API = process.env.REACT_APP_FOOTER_API_ENABLED === "true";
const LOCAL_FOOTER_KEY = "footerDashboardData";

const defaultFooterData = {
  schoolName: "Hilltop Junior School",
  location: "Kasangati, Wakiso District",
  phone1: "+256 771 234 567",
  phone2: "+256 705 987 654",
  email: "info@hilltopjunior.ug",
  address: "P.O. Box 12345, Kampala, Uganda",
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  instagram: "https://instagram.com"
};

export default function FooterDashboard() {
  const [footerData, setFooterData] = useState(defaultFooterData);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [footerApiAvailable, setFooterApiAvailable] = useState(USE_FOOTER_API);

  useEffect(() => {
    const loadFooter = async () => {
      const savedFooter = localStorage.getItem(LOCAL_FOOTER_KEY);
      if (savedFooter) {
        try {
          setFooterData({ ...defaultFooterData, ...JSON.parse(savedFooter) });
        } catch (parseError) {
          console.warn("Could not parse saved footer data", parseError);
        }
      }

      if (!USE_FOOTER_API) {
        setFooterApiAvailable(false);
        setLoading(false);
        return;
      }

      try {
        const data = await apiGet("/footer");
        if (data && typeof data === "object") {
          setFooterData({ ...defaultFooterData, ...data });
        }
      } catch (err) {
        if (err.status === 404) {
          console.warn("Footer API unavailable, switching to local footer storage.");
          setFooterApiAvailable(false);
        } else {
          console.error("Error loading footer data:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadFooter();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFooterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!footerApiAvailable) {
      localStorage.setItem(LOCAL_FOOTER_KEY, JSON.stringify(footerData));
      setMessage("✅ Footer saved locally (backend disabled or unavailable)");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const response = await apiPut("/footer", footerData);
      setFooterData({ ...defaultFooterData, ...response });
      localStorage.removeItem(LOCAL_FOOTER_KEY);
      setMessage("✅ Footer content saved");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      if (err.status === 404) {
        console.warn("Footer endpoint not found, saving footer data locally.");
        setFooterApiAvailable(false);
        localStorage.setItem(LOCAL_FOOTER_KEY, JSON.stringify(footerData));
        setMessage("✅ Footer saved locally (backend unavailable)");
      } else {
        console.error("Footer save error:", err);
        setMessage("❌ Could not save footer data");
      }
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="footer-dashboard">
      <h2>Footer Dashboard</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="footer-form">
        <input name="schoolName" value={footerData.schoolName} onChange={handleChange} placeholder="School Name" />
        <input name="location" value={footerData.location} onChange={handleChange} placeholder="Location" />
        <input name="phone1" value={footerData.phone1} onChange={handleChange} placeholder="Phone 1" />
        <input name="phone2" value={footerData.phone2} onChange={handleChange} placeholder="Phone 2" />
        <input name="email" value={footerData.email} onChange={handleChange} placeholder="Email" />
        <input name="address" value={footerData.address} onChange={handleChange} placeholder="Address" />
        <input name="facebook" value={footerData.facebook} onChange={handleChange} placeholder="Facebook Link" />
        <input name="twitter" value={footerData.twitter} onChange={handleChange} placeholder="Twitter Link" />
        <input name="instagram" value={footerData.instagram} onChange={handleChange} placeholder="Instagram Link" />
        <button type="submit">Save Footer</button>
      </form>
      <div className="footer-preview">
        <h3>Live Preview</h3>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-column brand-column">
              <h4>{footerData.schoolName}</h4>
              <p>
                {footerData.location}<br />
                {footerData.phone1} | {footerData.phone2}<br />
                {footerData.email}
              </p>
              <p className="address">{footerData.address}</p>
            </div>
            <div className="footer-column socials-column">
              <h4>Connect With Us</h4>
              <div className="social-icons">
                <a href={footerData.facebook} target="_blank" rel="noreferrer">f</a>
                <a href={footerData.twitter} target="_blank" rel="noreferrer">𝕏</a>
                <a href={footerData.instagram} target="_blank" rel="noreferrer">📷</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

