# Password Protection Guide for Admin Dashboard

This guide walks you through implementing JWT-based password protection for your admin dashboard.

## Overview

Your backend already has JWT (JSON Web Tokens) configured with **Flask-JWT-Extended**. We'll:
1. Create a login page
2. Store JWT tokens securely
3. Protect routes with authentication
4. Add logout functionality

---

## Step 1: Create Login Page Component

Create a new file: `src/pages/AdminLogin.js`

```javascript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminlogin.css";
import { apiPost } from "../utils/apiClient";
import { success, error as showError } from "../utils/toastNotification";
import { setSEOTags } from "../utils/seoUtils";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Set SEO (noindex since it's admin only)
  React.useEffect(() => {
    setSEOTags(
      "Admin Login - Hilltop Junior School",
      "Administrator login page",
      "admin"
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!credentials.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!credentials.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Call login endpoint
      const response = await apiPost('/users/login', {
        username: credentials.username,
        password: credentials.password
      });

      // Store JWT token in localStorage
      localStorage.setItem('adminToken', response.access_token);
      localStorage.setItem('adminUser', response.username);

      success("✅ Login successful! Redirecting to dashboard...");
      
      // Redirect after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      showError(`❌ ${err.message || "Invalid credentials"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>🔐 Admin Dashboard</h1>
          <p className="subtitle">Enter your credentials to access the admin panel</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter username"
                className={errors.username ? "input-error" : ""}
                autoComplete="username"
              />
              {errors.username && (
                <span className="error-text">⚠️ {errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={errors.password ? "input-error" : ""}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="error-text">⚠️ {errors.password}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="login-btn" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="security-note">
            <p>🛡️ <strong>Security Note:</strong> This login uses HTTPS in production. Never share your credentials.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 2: Create Styling for Login Page

Create `src/pages/adminlogin.css`:

```css
.admin-login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1f6e 0%, #1956c3 100%);
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  padding: 2.5rem;
}

.login-card h1 {
  text-align: center;
  color: #0a1f6e;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #1956c3;
  box-shadow: 0 0 0 3px rgba(25, 86, 195, 0.1);
}

.input-error {
  border-color: #ff6b6b !important;
  background-color: #fff5f5 !important;
}

.error-text {
  display: block;
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 4px;
  font-weight: 500;
}

.login-btn {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #0a1f6e 0%, #1956c3 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(25, 86, 195, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.security-note {
  background: #f0f8ff;
  border-left: 4px solid #1956c3;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #333;
}

.security-note p {
  margin: 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  .login-card h1 {
    font-size: 1.5rem;
  }
}
```

---

## Step 3: Create Protected Route Component

Create `src/components/ProtectedRoute.js`:

```javascript
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute - Wrapper for routes that require admin authentication
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');

  // If no token exists, redirect to login
  if (!adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  // Token exists, render the protected component
  return children;
}
```

---

## Step 4: Update Your Router in App.js

Update `src/App.js` to add the login and dashboard routes:

```javascript
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/ToastContainer";
import GoogleAnalytics from "./components/GoogleAnalytics";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { SkeletonPage } from "./components/Skeleton";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Academics = lazy(() => import("./pages/Academics"));
const Admissions = lazy(() => import("./pages/Admissions"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
// const Dashboard = lazy(() => import("./pages/Dashboard")); // Uncomment when dashboard exists

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <GoogleAnalytics />
        <ToastContainer />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div>
                <Navbar />
                <Suspense fallback={<SkeletonPage />}>
                  <Home />
                </Suspense>
                <Footer />
              </div>
            }
          />

          <Route
            path="/about"
            element={
              <div>
                <Navbar />
                <Suspense fallback={<SkeletonPage />}>
                  <About />
                </Suspense>
                <Footer />
              </div>
            }
          />

          <Route
            path="/academics"
            element={
              <div>
                <Navbar />
                <Suspense fallback={<SkeletonPage />}>
                  <Academics />
                </Suspense>
                <Footer />
              </div>
            }
          />

          <Route
            path="/admissions"
            element={
              <div>
                <Navbar />
                <Suspense fallback={<SkeletonPage />}>
                  <Admissions />
                </Suspense>
                <Footer />
              </div>
            }
          />

          <Route
            path="/gallery"
            element={
              <div>
                <Navbar />
                <Suspense fallback={<SkeletonPage />}>
                  <Gallery />
                </Suspense>
                <Footer />
              </div>
            }
          />

          <Route
            path="/contact"
            element={
              <div>
                <Navbar />
                <Suspense fallback={<SkeletonPage />}>
                  <Contact />
                </Suspense>
                <Footer />
              </div>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin-login"
            element={
              <Suspense fallback={<SkeletonPage />}>
                <AdminLogin />
              </Suspense>
            }
          />

          {/* 
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<SkeletonPage />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          */}

          {/* Catch-all: Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
```

---

## Step 5: Update API Client for Authentication

Update `src/utils/apiClient.js` to include auth headers:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
const API_VERSION = process.env.REACT_APP_API_VERSION || "v1";

/**
 * Fetch with timeout
 */
function fetchWithTimeout(url, options = {}, timeout = 8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    )
  ]);
}

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Make API call with standardized error handling
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  };

  try {
    const response = await fetchWithTimeout(url, config);

    // Handle 401 - Token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Redirect to login
      window.location.href = '/admin-login';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error:`, err);
    throw err;
  }
}

export function apiGet(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

export function apiPost(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export function apiPut(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

export function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}
```

---

## Step 6: Add Logout Functionality

Update `src/components/Navbar.js` to add a logout button:

```javascript
// In the Navbar component, add this function:
const handleLogout = () => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin-login';
  }
};

// Add this button to your navbar JSX:
{/* In your navbar JSX, add: */}
{localStorage.getItem('adminToken') && (
  <button onClick={handleLogout} className="logout-btn">
    Logout ({localStorage.getItem('adminUser')})
  </button>
)}
```

---

## Step 7: Backend Setup (Already Done)

Your backend already has JWT configured. Here's what's running:

**In `app/controllers/users_controller.py`:**
```python
@users_bp.route('/login', methods=['POST'])
def login():
    """Admin login endpoint"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password, password):
        return {'error': 'Invalid credentials'}, 401
    
    access_token = create_access_token(identity=user.id)
    return {
        'access_token': access_token,
        'username': user.username,
        'message': 'Login successful'
    }, 200
```

---

## How It Works

### Authentication Flow:

1. **User enters credentials** → AdminLogin page
2. **Frontend sends POST** to `/api/v1/users/login`
3. **Backend validates** username & password
4. **Backend returns JWT token** if credentials valid
5. **Frontend stores token** in localStorage
6. **Frontend includes token** in Authorization header for future requests
7. **Backend validates token** on protected endpoints
8. **If token invalid/expired** → Backend returns 401 → Frontend redirects to login

### Token Storage:

```javascript
// Stored in localStorage:
localStorage.getItem('adminToken')  // JWT token
localStorage.getItem('adminUser')   // Username for display
```

### Making Protected API Calls:

All calls through `apiClient.js` automatically include the token:

```javascript
// This automatically adds Authorization header:
const data = await apiPost('/admin/dashboard-data', {});
```

---

## Security Best Practices

✅ **What we're doing right:**
- JWT tokens stored in localStorage (accessible to React only, not cookies)
- Tokens included in Authorization header
- 401 response triggers auto-logout and redirect to login
- Password hashed on backend (Flask-Security)
- HTTPS recommended in production

⚠️ **Additional Security:**
- Use HTTPS in production (no HTTP)
- Set short token expiration (15-30 minutes)
- Use refresh tokens for longer sessions
- Rate limit login attempts
- Add CSRF protection

---

## Testing the Login

1. **Start your backend**: `python run.py`
2. **Start React**: `npm start`
3. **Create admin user** (backend):
   ```python
   from app import db, create_app
   from app.models import User
   from werkzeug.security import generate_password_hash
   
   app = create_app()
   with app.app_context():
       user = User(username='admin', password=generate_password_hash('password123'))
       db.session.add(user)
       db.session.commit()
   ```
4. **Visit**: `http://localhost:3000/admin-login`
5. **Enter credentials**: username: `admin`, password: `password123`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid credentials" message | Double-check username/password in backend database |
| Token not stored | Check browser localStorage (DevTools → Application → Storage) |
| Auto-logout happening | Token may be expired, check backend token lifetime |
| CORS errors | Ensure `/api/v1/users/login` is in backend CORS allowed |
| "Request timeout" | Backend may not be running, check `http://127.0.0.1:5000` |

---

## File Summary

Files you need to create/modify:

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/AdminLogin.js` | ✅ Create | Login page with form |
| `src/pages/adminlogin.css` | ✅ Create | Login page styling |
| `src/components/ProtectedRoute.js` | ✅ Create | Route protection wrapper |
| `src/App.js` | 📝 Update | Add login route & ProtectedRoute |
| `src/utils/apiClient.js` | 📝 Update | Add auth headers & 401 handling |
| `src/components/Navbar.js` | 📝 Update | Add logout button |

---

## Next Steps

1. ✅ Create AdminLogin page
2. ✅ Create ProtectedRoute wrapper
3. ✅ Update App.js routes
4. ✅ Update API client with auth
5. Create admin Dashboard page (with protected route)
6. Test login/logout workflow
7. Add token refresh mechanism (optional)
8. Deploy with HTTPS (production)

Ready to implement? Let me know if you need help with any step!
