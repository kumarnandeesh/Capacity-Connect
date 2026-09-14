const rawUrl = (import.meta.env.VITE_API_URL || "https://capacity-connect-8nlc.onrender.com").trim();
const cleanedUrl = rawUrl.replace(/\/+$/, "").replace(/\/api\/?$/, "");
const BASE_URL = `${cleanedUrl}/api`;

async function request(path, { method = "GET", body, token, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (path, token) => request(path, { method: "GET", token }),
  post: (path, body, token) => request(path, { method: "POST", body, token }),
  put: (path, body, token) => request(path, { method: "PUT", body, token }),
  del: (path, token) => request(path, { method: "DELETE", token }),
  postForm: (path, formData, token) => request(path, { method: "POST", body: formData, token, isForm: true }),
  fileUrl: (filename) => `${BASE_URL}/files/${filename}`,
  BASE_URL,
};
