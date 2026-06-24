import React, { useEffect, useState } from "react";
import "./contactdashboard.css";
import { apiGet, apiPut, apiPost } from "../utils/apiClient";

const defaultContactInfo = {
  email: "info@hilltop.com",
  phone: "+256 123 456 789",
  location: "Kasangati, Uganda",
  mapLink: ""
};

export default function ContactDashboard() {
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [messages, setMessages] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchContactInfo();
    fetchMessages();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const data = await apiGet("/contact_info");

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        setContactInfo({
          email: item.email || defaultContactInfo.email,
          phone: item.phone_number || defaultContactInfo.phone,
          location: item.address || defaultContactInfo.location,
          mapLink: item.map_link || defaultContactInfo.mapLink
        });
      } else if (data && data.address) {
        setContactInfo({
          email: data.email || defaultContactInfo.email,
          phone: data.phone_number || defaultContactInfo.phone,
          location: data.address || defaultContactInfo.location,
          mapLink: data.map_link || defaultContactInfo.mapLink
        });
      }
    } catch (err) {
      console.error("Error fetching contact info:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiGet("/contact_message");
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        email: contactInfo.email,
        phone_number: contactInfo.phone,
        address: contactInfo.location,
        map_embed_url: contactInfo.mapLink
      };

      try {
        await apiPut("/contact_info/1", payload);
        setStatusMessage("Contact info updated!");
      } catch {
        await apiPost("/contact_info", payload);
        setStatusMessage("Contact info created!");
      }

      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage("Error occurred");
    }
  };

  const getMapSrc = () => {
    if (contactInfo.mapLink && contactInfo.mapLink.trim() !== "") {
      return contactInfo.mapLink;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(contactInfo.location)}&output=embed`;
  };

  return (
    <div className="contact-dashboard">
      <h2>Contact Dashboard</h2>
      {statusMessage && <p className="message">{statusMessage}</p>}
      <form onSubmit={handleSubmit}>
        <h3>Edit Contact Info</h3>
        <label>Email</label>
        <input name="email" value={contactInfo.email} onChange={handleChange} />
        <label>Phone</label>
        <input name="phone" value={contactInfo.phone} onChange={handleChange} />
        <label>Location</label>
        <input name="location" value={contactInfo.location} onChange={handleChange} />
        <label>Google Map Embed Link (optional)</label>
        <input name="mapLink" value={contactInfo.mapLink} onChange={handleChange} placeholder="Paste Google Maps embed link" />
        <button type="submit">Save Changes</button>
      </form>
      <div className="map-section">
        <h3>Location Preview</h3>
        <iframe src={getMapSrc()} loading="lazy" allowFullScreen title="map"></iframe>
      </div>
      <div className="messages-section">
        <h3>Messages from Users</h3>
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="message-card">
              <h4>{msg.first_name} {msg.last_name}</h4>
              <p><strong>Email:</strong> {msg.email}</p>
              <p><strong>Phone:</strong> {msg.phone}</p>
              <p><strong>Message:</strong> {msg.message}</p>
              {msg.reply && <p><strong>Reply:</strong> {msg.reply}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

