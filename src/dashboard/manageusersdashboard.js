import React, { useEffect, useState } from "react";
import "./manageusers.css";

const USER_STORAGE_KEY = "manageUsersList";

export default function ManageUsersDashboard() {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn("Could not load saved users:", error);
      return [];
    }
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add user
  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.warn("Could not save users:", error);
    }
  }, [users]);

  const handleAddUser = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role) {
      alert("Please fill all fields");
      return;
    }

    const newUser = {
      id: Date.now(),
      ...formData,
    };

    setUsers([...users, newUser]);

    // Reset form
    setFormData({
      name: "",
      email: "",
      role: "",
    });
  };

  // Delete user
  const handleDeleteUser = (id) => {
    const filteredUsers = users.filter((user) => user.id !== id);
    setUsers(filteredUsers);
  };

  return (
    <div className="manage-users-container">
      <h2>Manage Users</h2>

      {/* Add User Form */}
      <form className="user-form" onSubmit={handleAddUser}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="role"
          placeholder="Role (Admin/User)"
          value={formData.role}
          onChange={handleChange}
        />

        <button type="submit">Add User</button>
      </form>

      {/* Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-users">
                No users added yet
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
