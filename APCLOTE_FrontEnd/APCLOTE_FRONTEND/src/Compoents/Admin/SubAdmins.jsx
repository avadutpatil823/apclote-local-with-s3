import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { buildUrl } from "../../config/api";
import { authHeaders, isRootAdmin } from "../User/deleteResourceUtils";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phono: "",
  address: "",
  adminAction: "READ",
  adminResourceTypes: ["ALL"]
};

const resourceOptions = ["ALL", "SUBJECT", "COURSE", "BATCH", "LECTURER"];

const SubAdmins = () => {
  const [form, setForm] = React.useState(emptyForm);
  const [subAdmins, setSubAdmins] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [editingSubAdmin, setEditingSubAdmin] = React.useState(null);

  const loadSubAdmins = async () => {
    try {
      const response = await axios.get(buildUrl("/admin/subAdmins"), { headers: authHeaders() });
      setSubAdmins(response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data || "Failed to load sub admins");
    }
  };

  React.useEffect(() => {
    if (isRootAdmin()) {
      loadSubAdmins();
    }
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const toggleResourceType = (resourceType) => {
    setForm((current) => {
      if (resourceType === "ALL") {
        return {
          ...current,
          adminResourceTypes: current.adminResourceTypes.includes("ALL") ? [] : ["ALL"]
        };
      }

      const currentTypes = current.adminResourceTypes.filter((item) => item !== "ALL");
      const nextTypes = currentTypes.includes(resourceType)
        ? currentTypes.filter((item) => item !== resourceType)
        : [...currentTypes, resourceType];

      return {
        ...current,
        adminResourceTypes: nextTypes
      };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSubAdmin(null);
  };

  const startEdit = (subAdmin) => {
    setEditingSubAdmin(subAdmin);
    setForm({
      name: subAdmin.name || "",
      email: subAdmin.email || "",
      password: "",
      phono: subAdmin.phono || subAdmin.phone || "",
      address: subAdmin.address || "",
      adminAction: subAdmin.adminAction || "READ",
      adminResourceTypes: String(subAdmin.adminResourceType || "ALL")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSubAdmin = async (event) => {
    event.preventDefault();

    if (form.adminResourceTypes.length === 0) {
      toast.error("Select at least one resource type");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phono: form.phono,
        address: form.address,
        adminAction: form.adminAction,
        id: editingSubAdmin?.id,
        adminResourceType: form.adminResourceTypes.join(",")
      };

      if (!payload.password) {
        delete payload.password;
      }

      if (editingSubAdmin) {
        await axios.put(buildUrl("/admin/subAdmins"), payload, { headers: authHeaders() });
        toast.success("Sub admin updated");
      } else {
        await axios.post(buildUrl("/admin/subAdmins"), payload, { headers: authHeaders() });
        toast.success(
          <div>
            <strong>Sub admin created</strong>
            <div className="text-sm">Login details will be sent to {form.email} if email is enabled.</div>
          </div>
        );
      }

      resetForm();
      loadSubAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data || `Failed to ${editingSubAdmin ? "update" : "create"} sub admin`);
    } finally {
      setBusy(false);
    }
  };

  const deleteSubAdmin = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    try {
      const response = await axios.delete(buildUrl(`/admin/subAdmins?userId=${deleteTarget.id}`), { headers: authHeaders() });
      toast.success(response.data || "Sub admin deleted");
      setDeleteTarget(null);
      loadSubAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data || "Failed to delete sub admin");
    }
  };

  if (!isRootAdmin()) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <section className="surface-panel p-8">
            <h1 className="title-dark">Root Admin Required</h1>
            <p className="subtle-text mt-3">Only the root admin can create or delete sub admins.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Root Admin</span>
          <h1 className="title-dark mt-3">Sub Admins</h1>
        </section>

        <form onSubmit={saveSubAdmin} className="surface-panel p-6 md:p-8 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-slate-950">{editingSubAdmin ? "Update Sub Admin" : "Create Sub Admin"}</h2>
          </div>
          <input className="field-input" name="name" value={form.name} onChange={updateField} placeholder="Name" required />
          <input className="field-input" name="email" type="email" value={form.email} onChange={updateField} placeholder="Email" required disabled={Boolean(editingSubAdmin)} />
          <input className="field-input" name="password" type="password" value={form.password} onChange={updateField} placeholder={editingSubAdmin ? "New password (optional)" : "Password"} required={!editingSubAdmin} />
          <input className="field-input" name="phono" value={form.phono} onChange={updateField} placeholder="Phone" />
          <input className="field-input md:col-span-2" name="address" value={form.address} onChange={updateField} placeholder="Address" />
          <select className="field-select" name="adminAction" value={form.adminAction} onChange={updateField}>
            <option value="READ">Read Only</option>
            <option value="FULL">Full Access</option>
            <option value="CREATE">Create Only</option>
            <option value="DELETE">Delete Only + Read</option>
          </select>
          <div className="md:col-span-2">
            <p className="field-label">Resource Access</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {resourceOptions.map((item) => (
                <label key={item} className="content-card flex cursor-pointer items-center gap-3 p-4 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={form.adminResourceTypes.includes(item)}
                    onChange={() => toggleResourceType(item)}
                    className="h-4 w-4 accent-teal-600"
                  />
                  {item === "ALL" ? "All Resources" : item}
                </label>
              ))}
            </div>
          </div>
          <button className="primary-btn md:col-span-2" disabled={busy} type="submit">
            {busy ? "Saving..." : editingSubAdmin ? "Update Sub Admin" : "Create Sub Admin"}
          </button>
          {editingSubAdmin && (
            <button className="ghost-btn md:col-span-2" disabled={busy} type="button" onClick={resetForm}>
              Cancel Update
            </button>
          )}
        </form>

        <section className="surface-panel p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-950">Existing Sub Admins</h2>
          <div className="mt-5 space-y-3">
            {subAdmins.length > 0 ? subAdmins.map((item) => (
              <div key={item.id} className="content-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold text-slate-950">{item.name} ({item.email})</p>
                  <p className="subtle-text">{item.adminAction} access for {item.adminResourceType}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="ghost-btn !py-2 !px-4" onClick={() => startEdit(item)} type="button">
                    Update
                  </button>
                  <button className="danger-btn !py-2 !px-4" onClick={() => setDeleteTarget(item)} type="button">
                    Delete
                  </button>
                </div>
              </div>
            )) : <p className="subtle-text">No sub admins found.</p>}
          </div>
        </section>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6">
            <span className="eyebrow !border-red-200 !bg-red-100 !text-red-700">Confirm</span>
            <h2 className="mt-4 text-2xl font-bold text-slate-950">Delete sub admin?</h2>
            <p className="subtle-text mt-3">
              {deleteTarget.name} will lose admin access immediately.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="ghost-btn" type="button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="danger-btn" type="button" onClick={deleteSubAdmin}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdmins;
