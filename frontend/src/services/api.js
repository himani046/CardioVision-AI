import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

export async function analyzeImage(file) {
  const form = new FormData();
  form.append("file", file);
  const response = await apiClient.post("/api/analysis/image", form);
  return response.data;
}

export function getAssetUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}
