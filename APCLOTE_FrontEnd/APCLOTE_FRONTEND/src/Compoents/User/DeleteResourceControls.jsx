import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { SyncLoader } from "react-spinners";
import { buildUrl } from "../../config/api";
import { authHeaders, buildDeleteUrl, buildResourceLink, canAdminDelete, DELETE_PHRASE, getCurrentUser } from "./deleteResourceUtils";

const getDependencyMessage = (resource, error) => {
  const serverMessage = error?.response?.data?.message || error?.response?.data;

  if (serverMessage && typeof serverMessage === "string") {
    return serverMessage;
  }

  if (resource.type === "subject") {
    return "Subject is associated with a course. Remove this subject from the course before deleting it.";
  }

  if (resource.type === "course") {
    return "Course is attached with a batch. Remove or delete the batch before deleting this course.";
  }

  if (resource.type === "lecturer") {
    return "Lecturer is assigned to an active batch. First disassign the lecturer, then delete.";
  }

  return "Failed to delete resource";
};

const ConfirmDeleteModal = ({ resource, onCancel, onConfirm, isDeleting }) => {
  const [confirmation, setConfirmation] = useState("");
  const canDelete = confirmation.trim().toLowerCase() === DELETE_PHRASE;
  const blockers = resource.blockers || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="surface-panel w-full max-w-lg p-6">
        <span className="eyebrow !border-red-200 !bg-red-100 !text-red-700">Confirm Delete</span>
        <h2 className="mt-4 text-2xl font-bold text-slate-950">You are deleting this resource</h2>
        <p className="subtle-text mt-3">
          This will delete {resource.label || resource.type}
          {resource.name ? `: ${resource.name}` : ""}. {resource.type === "batch"
            ? "The course, students, and lecturers will be detached from this batch."
            : "Related content may also be removed."}
        </p>
        {blockers.length > 0 && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {resource.blockerMessage || "This resource is associated with another resource."}
            <div className="mt-2 text-slate-700">{blockers.join(", ")}</div>
          </div>
        )}
        {isDeleting && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <span className="flex items-center gap-3">
              <SyncLoader color="#dc2626" size={6} />
              <span>Delete is processing. Please wait...</span>
            </span>
          </div>
        )}
        <label className="field-label mt-5">Type delete me to enable delete</label>
        <input
          className="field-input"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="delete me"
          autoFocus
          disabled={isDeleting}
        />
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="ghost-btn" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button
            type="button"
            className="danger-btn disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={!canDelete || isDeleting || blockers.length > 0}
          >
            <span className="flex items-center gap-3">
              {isDeleting ? <SyncLoader color="white" size={6} /> : null}
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestDeleteModal = ({ resource, onCancel, onSubmit, isSending }) => {
  const [reason, setReason] = useState("");
  const canSend = reason.trim().length >= 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="surface-panel w-full max-w-lg p-6">
        <span className="eyebrow !border-amber-200 !bg-amber-100 !text-amber-700">Deletion Request</span>
        <h2 className="mt-4 text-2xl font-bold text-slate-950">Request admin deletion</h2>
        <p className="subtle-text mt-3">
          Admin will receive your lecturer details, reason, resource name, and a direct link to this place.
        </p>
        <label className="field-label mt-5">Reason to delete</label>
        <textarea
          className="field-textarea"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={`Why should ${resource.label || resource.type} be deleted?`}
          autoFocus
        />
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="ghost-btn" onClick={onCancel} disabled={isSending}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-btn disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onSubmit(reason.trim())}
            disabled={!canSend || isSending}
          >
            {isSending ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminDeleteButton = ({ resource, onDeleted, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const resourcePermissionMap = {
    subject: "SUBJECT",
    course: "COURSE",
    batch: "BATCH",
    lecturer: "LECTURER"
  };
  const canUseDelete = canAdminDelete(resourcePermissionMap[resource.type] || "ALL");

  const handleDelete = async () => {
    const deleteUrl = buildDeleteUrl(resource, buildUrl);
    const blockers = resource.blockers || [];

    if (!deleteUrl) {
      toast.error("Delete endpoint not configured");
      return;
    }

    if (blockers.length > 0) {
      toast.error(`${resource.blockerMessage || "This resource is associated with another resource."} ${blockers.join(", ")}`);
      return;
    }

    setIsDeleting(true);

    try {
      const response = await axios.delete(deleteUrl, { headers: authHeaders() });
      toast.success(response?.data?.message || response?.data || "Resource deleted successfully");
      setIsOpen(false);
      onDeleted?.();
    } catch (error) {
      toast.error(getDependencyMessage(resource, error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`danger-btn ${className}`}
        onClick={() => {
          if (!canUseDelete) {
            toast.error("You do not have delete access for this resource");
            return;
          }
          setIsOpen(true);
        }}
      >
        Delete
      </button>
      {isOpen && canUseDelete && (
        <ConfirmDeleteModal
          resource={resource}
          onCancel={() => setIsOpen(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export const LecturerDeleteRequestButton = ({ resource, target, onRequested, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const directLink = useMemo(() => buildResourceLink(target || {}), [target]);

  const handleSubmit = async (reason) => {
    const lecturer = getCurrentUser();

    setIsSending(true);

    try {
      await axios.post(
        buildUrl("/lecturer/requestDelete"),
        {
          resourceType: resource.type,
          resourceId: resource.id,
          resourceName: resource.name || resource.label || resource.type,
          reason,
          directLink,
          lecturer: {
            id: lecturer?.id,
            name: lecturer?.name,
            email: lecturer?.email
          }
        },
        { headers: authHeaders() }
      );
      toast.success("Delete request sent to admin");
      setIsOpen(false);
      onRequested?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send delete request");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button type="button" className={`ghost-btn ${className}`} onClick={() => setIsOpen(true)}>
        Request Delete
      </button>
      {isOpen && (
        <RequestDeleteModal
          resource={resource}
          onCancel={() => setIsOpen(false)}
          onSubmit={handleSubmit}
          isSending={isSending}
        />
      )}
    </>
  );
};
