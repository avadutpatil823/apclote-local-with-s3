export const DELETE_PHRASE = "delete me";

export const getToken = () => {
  try {
    const storedToken = localStorage.getItem("JWT");
    return storedToken ? JSON.parse(storedToken) : "";
  } catch (error) {
    return "";
  }
};

export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem("USER");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    return null;
  }
};

const normalizeFrontendBaseUrl = (value) => String(value || "").replace(/\/+$/, "");

export const getFrontendBaseUrl = () => {
  const configuredUrl = normalizeFrontendBaseUrl(import.meta.env.VITE_FRONTEND_BASE_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return import.meta.env.PROD ? "https://apclote.in" : "http://localhost:5173";
};

export const buildLoginAwareLink = (targetPath) => {
  const normalizedTarget = targetPath?.startsWith("/") ? targetPath : `/${targetPath || ""}`;
  return `${getFrontendBaseUrl()}/resourceRedirect?target=${encodeURIComponent(normalizedTarget)}`;
};

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

export const isRootAdmin = (user = getCurrentUser()) =>
  user?.role === "ROLE_ADMIN" && !user?.subAdmin;

export const getAdminResourceTypes = (user = getCurrentUser()) => {
  const rawValue = user?.adminResourceTypes || user?.adminResourceType;

  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => String(item).trim().toUpperCase()).filter(Boolean);
  }

  return String(rawValue || "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
};

export const canAdminUseResource = (resourceType, user = getCurrentUser()) => {
  const normalizedType = String(resourceType || "").toUpperCase();
  const resourceTypes = getAdminResourceTypes(user);
  return resourceTypes.includes("ALL") || resourceTypes.includes(normalizedType);
};

export const isFullAdmin = (user = getCurrentUser()) =>
  isRootAdmin(user) || (user?.role === "ROLE_ADMIN" && user?.subAdmin && user?.adminAction === "FULL" && canAdminUseResource("ALL", user));

export const canAdminRead = (resourceType, user = getCurrentUser()) =>
  isRootAdmin(user) ||
  (user?.role === "ROLE_ADMIN" &&
    user?.subAdmin &&
    (user?.adminAction === "READ" || user?.adminAction === "DELETE" || user?.adminAction === "CREATE" || user?.adminAction === "FULL") &&
    canAdminUseResource(resourceType, user));

export const canAdminCreate = (resourceType, user = getCurrentUser()) =>
  isRootAdmin(user) ||
  (user?.role === "ROLE_ADMIN" &&
    user?.subAdmin &&
    (user?.adminAction === "CREATE" || user?.adminAction === "FULL") &&
    canAdminUseResource(resourceType, user));

export const canAdminUpdate = (resourceType, user = getCurrentUser()) =>
  isRootAdmin(user) ||
  (user?.role === "ROLE_ADMIN" &&
    user?.subAdmin &&
    (user?.adminAction === "CREATE" || user?.adminAction === "FULL") &&
    canAdminUseResource(resourceType, user));

export const canAdminDelete = (resourceType, user = getCurrentUser()) =>
  isRootAdmin(user) ||
  (user?.role === "ROLE_ADMIN" &&
    user?.subAdmin &&
    (user?.adminAction === "DELETE" || user?.adminAction === "FULL") &&
    canAdminUseResource(resourceType, user));

export const canViewAdminPeople = (user = getCurrentUser()) => isFullAdmin(user);

export const resourceEndpoints = {
  subject: (id) => `/admin/deleteSubject?subjectId=${id}`,
  course: (id) => `/admin/deleteCourse?courseId=${id}`,
  batch: (id) => `/admin/deleteBatch?batchId=${id}`,
  classRoom: (id) => `/admin/deleteClassRoom?classRoomId=${id}`,
  class: (id) => `/admin/deleteClass?classId=${id}`,
  video: (id) => `/admin/deleteVideo?videoId=${id}`,
  notes: (id) => `/admin/deleteNotes?notesId=${id}`,
  test: (id) => `/admin/deleteTest?testId=${id}`
};

export const buildResourceLink = ({ batchId, classRoomId, classId, resourceType, resourceId }) => {
  const params = new URLSearchParams();

  if (batchId) params.set("batchId", batchId);
  if (classRoomId) params.set("classRoomId", classRoomId);
  if (classId) params.set("classId", classId);
  if (resourceType) params.set("resourceType", resourceType);
  if (resourceId) params.set("resourceId", resourceId);

  if (classId) {
    return buildLoginAwareLink(`/streamClass?${params.toString()}`);
  }

  if (classRoomId) {
    return buildLoginAwareLink(`/streamClassRoom?${params.toString()}`);
  }

  if (batchId) {
    return buildLoginAwareLink(`/streamBatch?${params.toString()}`);
  }

  return buildLoginAwareLink("/");
};

export const buildDeleteUrl = (resource, buildUrl) => {
  const endpointBuilder = resourceEndpoints[resource.type];
  return endpointBuilder ? buildUrl(endpointBuilder(resource.id)) : "";
};
