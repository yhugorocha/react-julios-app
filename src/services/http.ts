import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useFeedbackStore } from "../store/feedbackStore";
import { getFriendlyErrorMessage } from "../utils/error";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://hg.vps-kinghost.net:8080";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.config?.skipGlobalError) {
      useFeedbackStore.getState().pushError(getFriendlyErrorMessage(error));
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

