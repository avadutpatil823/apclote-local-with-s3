import axios from "axios";
import { buildApiUrl } from "./api";

const SESSION_LOGOUT_EVENT = "apclote:session-logout";
const SESSION_LOGOUT_MESSAGE = "Your account was deactivated or deleted. Please contact admin.";

let installed = false;
let handlingLogout = false;

const getToken = () => {
  try {
    const storedToken = localStorage.getItem("JWT");
    return storedToken ? JSON.parse(storedToken) : "";
  } catch (error) {
    return "";
  }
};

const isInactiveAccountResponse = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data || {};
  const message = String(data.message || data.error || "").toLowerCase();

  return (
    status === 401 &&
    (data.error === "ACCOUNT_INACTIVE" ||
      message.includes("deactivated") ||
      message.includes("deleted") ||
      message.includes("inactive"))
  );
};

const logoutInactiveSession = () => {
  if (handlingLogout || !localStorage.getItem("JWT")) {
    return;
  }

  handlingLogout = true;
  localStorage.removeItem("JWT");
  localStorage.removeItem("USER");
  sessionStorage.setItem("SESSION_LOGOUT_MESSAGE", SESSION_LOGOUT_MESSAGE);
  window.dispatchEvent(new CustomEvent(SESSION_LOGOUT_EVENT));
  window.location.replace("/login");
};

const checkCurrentSession = async () => {
  const token = getToken();
  if (!token || document.visibilityState === "hidden") {
    return;
  }

  try {
    const response = await axios.get(buildApiUrl("/getUser"), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const user = response.data;
    if (user && (user.active === false || user.deleted === true)) {
      logoutInactiveSession();
    }
  } catch (error) {
    if (isInactiveAccountResponse(error)) {
      logoutInactiveSession();
    }
  }
};

export const installSessionGuard = () => {
  if (installed || typeof window === "undefined") {
    return;
  }

  installed = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isInactiveAccountResponse(error)) {
        logoutInactiveSession();
      }

      return Promise.reject(error);
    }
  );

  window.addEventListener("focus", checkCurrentSession);
  window.addEventListener("storage", (event) => {
    if (event.key === "JWT" && !event.newValue) {
      localStorage.removeItem("USER");
    }
  });

  window.setInterval(checkCurrentSession, 30000);
  window.setTimeout(checkCurrentSession, 1500);
};

export const consumeSessionLogoutMessage = () => {
  const message = sessionStorage.getItem("SESSION_LOGOUT_MESSAGE");
  sessionStorage.removeItem("SESSION_LOGOUT_MESSAGE");
  return message;
};

