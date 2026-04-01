import React, { useEffect, useState } from "react";
import "./contactdashboard.css";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function ContactDashboard() {
  const [contactInfo, setContactInfo] = useState({
    email: "info@hilltop.com",
    phone: "+256 123 456 789",
    location: "Kasangati, Uganda"
  });

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch contact info + messages
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/contact_info`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setContactInfo({
            email: data[0].email || contactInfo.email,
            phone: data[0].phone_number || contactInfo.phone,
            location: data[0].address || contactInfo.location
          });
        } else if (data && data.address) {
          setContactInfo({
            email: data.email || contactInfo.email,
            phone: data.phone_number || contactInfo.phone,
            location: data.address || contactInfo.location
          });
        }
      })
      .catch(err => {
        console.error("Error fetching contact info:", err);
      });

    fetch(`${API_BASE_URL}/api/v1/contact`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setMessages(data))
      .catch(err => {
        console.error("Error fetching messages:", err);
      });
  }, []);

  // Handle changes
  const handleChange = (e) => {
    setContactInfo({
      ...contactInfo,
      [e.target.name]: e.target.value
    });
  };

  // Save contact info
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contactInfo)
      });

      if (res.ok) {
        setMessage("✅ Contact info updated!");
      } else {
        setMessage("❌ Failed to update");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error occurred");
    }
  };

  return (
    <div className="contact-dashboard">
      <h2>Contact Dashboard</h2>

      {message && <p className="message">{message}</p>}

      {/* CONTACT INFO */}
      <form onSubmit={handleSubmit}>
        <h3>Edit Contact Info</h3>

        <label>Email</label>
        <input
          name="email"
          value={contactInfo.email}
          onChange={handleChange}
        />

        <label>Phone</label>
        <input
          name="phone"
          value={contactInfo.phone}
          onChange={handleChange}
        />

        <label>Location</label>
        <input
          name="location"
          value={contactInfo.location}
          onChange={handleChange}
        />

        <button type="submit">Save Changes</button>
      </form>

      {/* MESSAGES */}
      <div className="messages-section">
        <h3>Messages from Users</h3>

        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="message-card">
              <h4>{msg.fullName}</h4>
              <p><strong>Email:</strong> {msg.email}</p>
              <p><strong>Phone:</strong> {msg.phone}</p>
              <p><strong>Type:</strong> {msg.inquiryType}</p>
              <p>{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}