import axios from "axios";
import { buildApiUrl } from "../config/api";

export const getStoredToken = () => {
  const rawValue = localStorage.getItem("JWT");
  if (!rawValue) {
    return "";
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue;
  }
};

export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getStoredToken()}`
});

export const markResourceComplete = (resourceType, resourceId) => {
  if (!resourceId || !localStorage.getItem("JWT")) {
    return Promise.resolve(null);
  }

  return axios.post(buildApiUrl("/progress/complete"), null, {
    params: { resourceType, resourceId },
    headers: getAuthHeaders()
  });
};

export const fetchStudentDashboard = () => {
  if (!localStorage.getItem("JWT")) {
    return Promise.resolve(null);
  }

  return axios.get(buildApiUrl("/dashboard/student/me"), {
    headers: getAuthHeaders()
  });
};

export const clampProgress = (value) => Math.min(Math.max(Number(value) || 0, 0), 100);
