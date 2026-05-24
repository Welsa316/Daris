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
  const lang = localStorage.getItem('daris-locale') || 'ar';

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': lang,
      ...options.headers,
    },
    ...options,
  };

  if (options.body instanceof FormData) {
    // Multipart upload — keep the FormData instance as-is and let the
    // browser set Content-Type with the boundary parameter. Hand-setting
    // application/json would break the multipart parse on the server.
    delete config.headers['Content-Type'];
  } else if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let response = await fetch(`${BASE_URL}${url}`, config);

  // On any 401, try a one-shot token refresh and replay the request.
  // An access token lapses two ways: still-present-but-stale (the server
  // tags it TOKEN_EXPIRED) OR the cookie expires outright and is simply
  // absent (a plain 401, no code). Both are recoverable while the
  // refresh token holds, so the refresh isn't gated on the code —
  // gating on it left the user with hard "must log in" errors once the
  // access-token cookie aged out mid-session.
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': lang },
    });

    if (refreshResponse.ok) {
      // Retry the original request once with the refreshed session.
      response = await fetch(`${BASE_URL}${url}`, config);
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

// `opts` is merged into the fetch init. Its main use is `keepalive: true`
// for a request that must survive the page unloading (see useUndoToast).
export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body, opts = {}) => request(url, { method: 'POST', body, ...opts }),
  put: (url, body) => request(url, { method: 'PUT', body }),
  delete: (url, opts = {}) => request(url, { method: 'DELETE', ...opts }),
};

export { ApiError };
