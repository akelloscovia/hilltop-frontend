// API utility with timeout and error handling
import * as mockData from './mockData';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000').replace(/\/\/+$/, '');
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';
const REQUEST_TIMEOUT = 20000; // 20 seconds
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';

// Map endpoints to mock data
const mockDataMap = {
  '/home': mockData.mockHomeData,
  '/about': mockData.mockAboutData,
  '/academics': mockData.mockAcademicsData,
  '/admissions': mockData.mockAdmissionsData,
  '/contact': mockData.mockContactData,
  '/contact_info': mockData.mockContactInfoData,
  '/contact_message': mockData.mockContactMessagesData,
  '/gallery': mockData.mockGalleryData,
  '/footer': mockData.mockFooterData
};

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
  // Use mock data if enabled or if API is unavailable
  if (USE_MOCK_DATA && mockDataMap[endpoint]) {
    console.warn(`Using mock data for ${endpoint}`);

    // Allow mock updates to persist in-memory for development when using mock data.
    const method = (options.method || 'GET').toUpperCase();

    const getJsonBody = (body) => {
      if (!body) return {};
      if (body instanceof FormData) return null; // indicate FormData
      if (typeof body === 'string') {
        try {
          return JSON.parse(body);
        } catch (e) {
          return {};
        }
      }
      return body;
    };

    if (method === 'GET') {
      return mockDataMap[endpoint];
    }

    if (method === 'PUT' || method === 'POST') {
      // Handle FormData uploads (e.g., gallery images)
      if (options.body instanceof FormData) {
        const entries = [];
        for (const [key, value] of options.body.entries()) {
          if (
            value &&
            typeof value === 'object' &&
            (typeof value.name === 'string' || typeof value.size === 'number')
          ) {
            const fileName = value.name || 'uploaded_file';
            entries.push({ key, value, fileName, url: `/uploads/${fileName}` });
          } else {
            entries.push({ key, value });
          }
        }

        if (endpoint === '/gallery') {
          const gallery = mockDataMap['/gallery'] || { gallery_images: [] };
          const images = Array.isArray(gallery.gallery_images) ? gallery.gallery_images : [];
          let nextId = images.reduce((m, it) => Math.max(m, it.id || 0), 0) + 1;

          for (const entry of entries) {
            if (entry.url) {
              images.push({ id: nextId++, title: entry.fileName, image: entry.url });
            } else if (entry.key === 'image' && typeof entry.value === 'string') {
              images.push({ id: nextId++, title: entry.value, image: entry.value });
            }
          }

          mockDataMap['/gallery'] = { ...gallery, gallery_images: images };
          return mockDataMap['/gallery'];
        }

        const merged = {};
        for (const entry of entries) {
          if (entry.url) {
            merged[entry.key] = entry.url;
          } else {
            merged[entry.key] = entry.value;
          }
        }

        mockDataMap[endpoint] = { ...mockDataMap[endpoint], ...merged };
        return mockDataMap[endpoint];
      }

      // JSON body update: merge incoming object into mock data
      const incoming = getJsonBody(options.body) || {};
      mockDataMap[endpoint] = { ...mockDataMap[endpoint], ...incoming };
      return mockDataMap[endpoint];
    }

    if (method === 'DELETE') {
      // Support deleting gallery items: endpoint like '/gallery/3'
      if (endpoint.startsWith('/gallery/')) {
        const parts = endpoint.split('/');
        const id = parseInt(parts[parts.length - 1], 10);
        if (!Number.isNaN(id)) {
          const gallery = mockDataMap['/gallery'] || { gallery_images: [] };
          gallery.gallery_images = (gallery.gallery_images || []).filter((it) => it.id !== id);
          mockDataMap['/gallery'] = gallery;
          return { success: true };
        }
      }

      return { success: true };
    }
  }

  const url = API_BASE_URL
    ? `${API_BASE_URL}/api/${API_VERSION}${endpoint}`
    : `/api/${API_VERSION}${endpoint}`;

  const isFormData = options.body instanceof FormData;
  const hasBody = options.body != null;
  const headers = {
    ...options.headers
  };

  if (
    hasBody &&
    !isFormData &&
    !headers['Content-Type'] &&
    !headers['content-type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const body = !hasBody
    ? undefined
    : isFormData
    ? options.body
    : typeof options.body === 'string'
    ? options.body
    : JSON.stringify(options.body);


  const parseJsonSafe = async (response) => {
    const text = await response.text();
    if (!text) return { parsed: {}, text: '' };
    try {
      return { parsed: JSON.parse(text), text };
    } catch (parseError) {
      return { parsed: {}, text };
    }
  };

  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers,
      body
    });

    if (!response.ok) {
      const { parsed, text } = await parseJsonSafe(response);
      const message = (parsed && (parsed.error || parsed.message)) || text || `HTTP ${response.status}`;
      const apiError = new Error(message);
      apiError.status = response.status;
      apiError.body = text;
      apiError.parsed = parsed;
      console.error(`API response error ${response.status}:`, text || parsed);
      throw apiError;
    }

    const { parsed } = await parseJsonSafe(response);
    return parsed;
  } catch (error) {
    console.error('API Error:', error);

    if (USE_MOCK_DATA && mockDataMap[endpoint]) {
      console.warn(`API failed for ${endpoint}, using fallback mock data`);
      return mockDataMap[endpoint];
    }

    throw error;
  }
};

// GET request
export const apiGet = (endpoint) => apiCall(endpoint, { method: 'GET' });

// POST request
export const apiPost = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: data
});

// PUT request
export const apiPut = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: data
});

// POST form data
export const apiPostForm = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: data
});

// PUT form data
export const apiPutForm = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: data
});

// DELETE request
export const apiDelete = (endpoint) => apiCall(endpoint, { method: 'DELETE' });
