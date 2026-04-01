import React, { useEffect, useState } from "react";
import "./admissionsdashboard.css";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function AdmissionsDashboard() {
  const [data, setData] = useState({
    title: "Join Our Community",
    subtitle: "Admissions Open",
    description: "We welcome students from all backgrounds.",
    requirements: "Birth certificate, medical report, previous school records.",
    steps: "1. Submit application. 2. Attend interview. 3. Pay fees.",
    nursery_fee: "500,000 UGX",
    primary_fee: "600,000 UGX",
    transport_fee: "200,000 UGX",
    snacks_fee: "100,000 UGX",
    registration_fee: "50,000 UGX"
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/admissions`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admissions data:", err);
        setLoading(false);
      });
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admissions`, {
        method: "POST", // or PUT
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setMessage("✅ Admissions updated successfully!");
      } else {
        setMessage("❌ Failed to update");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error occurred");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admissions-dashboard">
      <h2>Admissions Dashboard</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <h3>Header Section</h3>

        <label>Title</label>
        <input name="title" value={data.title} onChange={handleChange} />

        <label>Subtitle</label>
        <input name="subtitle" value={data.subtitle} onChange={handleChange} />

        <label>Description</label>
        <textarea name="description" value={data.description} onChange={handleChange} />

        <h3>Admission Requirements</h3>
        <textarea name="requirements" value={data.requirements} onChange={handleChange} />

        <h3>Application Steps</h3>
        <textarea name="steps" value={data.steps} onChange={handleChange} />

        <h3>Fees</h3>

        <label>Nursery Fee</label>
        <input name="nursery_fee" value={data.nursery_fee} onChange={handleChange} />

        <label>Primary Fee</label>
        <input name="primary_fee" value={data.primary_fee} onChange={handleChange} />

        <label>Transport Fee</label>
        <input name="transport_fee" value={data.transport_fee} onChange={handleChange} />

        <label>Snacks Fee</label>
        <input name="snacks_fee" value={data.snacks_fee} onChange={handleChange} />

        <label>Registration Fee</label>
        <input name="registration_fee" value={data.registration_fee} onChange={handleChange} />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}