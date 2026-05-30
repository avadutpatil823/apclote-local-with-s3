import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildApiUrl, buildUrl } from "../../config/api";
import { authHeaders, buildLoginAwareLink, canAdminDelete, DELETE_PHRASE, getCurrentUser, isFullAdmin } from "../User/deleteResourceUtils";
import Pagination from "../User/Pagination";

const DeleteRequests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser());
  const canViewDeleteRequestsFor = (currentUser) =>
    isFullAdmin(currentUser) || (currentUser?.role === "ROLE_ADMIN" && currentUser?.subAdmin && (currentUser?.adminAction === "DELETE" || currentUser?.adminAction === "FULL"));
  const canViewDeleteRequests = canViewDeleteRequestsFor(user);
  const canDelete = confirmation.trim().toLowerCase() === DELETE_PHRASE;

  const canHandleRequest = (request, currentUser = user) => canAdminDelete(String(request?.resourceType || "").toUpperCase(), currentUser);

  const toLoginAwareResourceLink = (resourceLink) => {
    try {
      const parsed = new URL(resourceLink);
      return buildLoginAwareLink(`${parsed.pathname}${parsed.search}`);
    } catch (error) {
      return buildLoginAwareLink(resourceLink || "/");
    }
  };

  const loadRequests = async (nextPage = page, nextStatus = status, currentUser = user, append = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        buildUrl(`/admin/deleteRequests?status=${nextStatus}&pageNumber=${nextPage - 1}&pageSize=10`),
        { headers: authHeaders() }
      );
      const content = response.data?.content || [];
      const visibleContent = isFullAdmin(currentUser) ? content : content.filter((item) => canHandleRequest(item, currentUser));
      setRequests((current) => (append ? [...current, ...visibleContent] : visibleContent));
      setPage((response.data?.number || 0) + 1);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load delete requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("JWT")) {
      navigate(`/login?redirect=${encodeURIComponent(`/deleteRequests${requestId ? `?requestId=${requestId}` : ""}`)}`);
      return;
    }

    const cachedUser = getCurrentUser();
    if (canViewDeleteRequestsFor(cachedUser)) {
      setUser(cachedUser);
      loadRequests(1, status, cachedUser);
      return;
    }

    const ensureUser = async () => {
      try {
        const response = await axios.get(buildApiUrl("/getUser"), { headers: authHeaders() });
        localStorage.setItem("USER", JSON.stringify(response.data));
        setUser(response.data);
        if (canViewDeleteRequestsFor(response.data)) {
          loadRequests(1, status, response.data);
        }
      } catch (error) {
        toast.error("Please sign in again");
        navigate(`/login?redirect=${encodeURIComponent(`/deleteRequests${requestId ? `?requestId=${requestId}` : ""}`)}`);
      }
    };

    ensureUser();
  }, [navigate, requestId]);

  useEffect(() => {
    if (!requestId || !canViewDeleteRequests) {
      return;
    }

    const matched = requests.find((item) => String(item.id) === String(requestId));
    if (matched && matched.status === "PENDING") {
      setSelectedRequest(matched);
      return;
    }

    const loadDirectRequest = async () => {
      try {
        const response = await axios.get(buildUrl(`/admin/deleteRequests/find?requestId=${requestId}`), { headers: authHeaders() });
        if (response.data?.status === "PENDING" && canHandleRequest(response.data)) {
          setSelectedRequest(response.data);
        } else if (response.data?.status === "PENDING") {
          toast.error("You do not have delete access for this resource");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Delete request not found");
      }
    };

    loadDirectRequest();
  }, [requestId, requests, canViewDeleteRequests]);

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setStatus(value);
    loadRequests(1, value, user, false);
  };

  const handleApprove = async () => {
    if (!selectedRequest) {
      return;
    }

    if (!canHandleRequest(selectedRequest)) {
      toast.error("You do not have delete access for this resource");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        buildUrl(`/admin/deleteRequests/approve?requestId=${selectedRequest.id}`),
        { headers: authHeaders() }
      );
      toast.success(response?.data || "Delete request completed");
      setSelectedRequest(null);
      setConfirmation("");
      loadRequests(1, status, user, false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to complete delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  if (localStorage.getItem("JWT") && !user?.role) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <section className="surface-panel p-8">
            <p className="subtle-text">Preparing admin workspace...</p>
          </section>
        </div>
      </div>
    );
  }

  if (!canViewDeleteRequests) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <section className="surface-panel p-8">
            <h1 className="title-dark">Admin Access Required</h1>
            <p className="subtle-text mt-3">Please sign in with a delete-enabled admin account to manage delete requests.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Admin</span>
              <h1 className="title-dark mt-3">Delete Requests</h1>
            </div>
            <select className="field-select md:max-w-xs" value={status} onChange={handleStatusChange}>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="ALL">All</option>
            </select>
          </div>
        </section>

        <section className="surface-panel p-6 md:p-8">
          {isLoading && requests.length === 0 ? (
            <p className="subtle-text">Loading requests...</p>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((item) => (
                <div key={item.id} className="content-card p-5 space-y-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{item.resourceName || item.resourceType}</h2>
                      <p className="subtle-text">Type: {item.resourceType} | Id: {item.resourceId} | Status: {item.status}</p>
                      <p className="subtle-text">Lecturer: {item.lecturerName || "N/A"} ({item.lecturerEmail || "N/A"})</p>
                    </div>
                    {item.status === "PENDING" && (
                      <button className="danger-btn !py-2 !px-4" onClick={() => setSelectedRequest(item)}>
                        Proceed
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{item.reason}</p>
                  {item.resourceLink && (
                    <a href={toLoginAwareResourceLink(item.resourceLink)} className="font-bold text-teal-700 hover:underline">
                      Open requested resource
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="subtle-text">No delete requests found.</p>
          )}

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(nextPage) => loadRequests(nextPage, status, user, true)} loading={isLoading} label="requests" />
        </section>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6">
            <span className="eyebrow !border-red-200 !bg-red-100 !text-red-700">Confirm Delete</span>
            <h2 className="mt-4 text-2xl font-bold text-slate-950">You are deleting this resource</h2>
            <p className="subtle-text mt-3">
              This will delete {selectedRequest.resourceType}: {selectedRequest.resourceName || selectedRequest.resourceId}.
            </p>
            <label className="field-label mt-5">Type delete me to enable delete</label>
            <input className="field-input" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="delete me" autoFocus />
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button className="ghost-btn" onClick={() => setSelectedRequest(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="danger-btn disabled:cursor-not-allowed disabled:opacity-50" onClick={handleApprove} disabled={!canDelete || isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteRequests;
