// API utility with timeout and error handling
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';
const REQUEST_TIMEOUT = 8000; // 8 seconds

export const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${REQUEST_TIMEOUT}ms`);
    }
    throw error;
  }
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// GET request
export const apiGet = (endpoint) => apiCall(endpoint, { method: 'GET' });

// POST request
export const apiPost = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: JSON.stringify(data)
});

// PUT request
export const apiPut = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
});

// DELETE request
export const apiDelete = (endpoint) => apiCall(endpoint, { method: 'DELETE' });
