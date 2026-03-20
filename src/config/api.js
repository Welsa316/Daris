const BASE_URL = '';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request(url, options = {}) {
  const lang = localStorage.getItem('daris-locale') || 'en';

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': lang,
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let response = await fetch(`${BASE_URL}${url}`, config);

  // If 401 with TOKEN_EXPIRED, try refreshing
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.code === 'TOKEN_EXPIRED') {
      // Attempt token refresh
      const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept-Language': lang },
      });

      if (refreshResponse.ok) {
        // Retry original request
        response = await fetch(`${BASE_URL}${url}`, config);
      } else {
        throw new ApiError(data.error || 'Session expired', 401, data);
      }
    } else {
      throw new ApiError(data.error || 'Unauthorized', 401, data);
    }
  }

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      responseData.error || 'Request failed',
      response.status,
      responseData
    );
  }

  return responseData;
}

export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body }),
  put: (url, body) => request(url, { method: 'PUT', body }),
  delete: (url) => request(url, { method: 'DELETE' }),
};

export { ApiError };
