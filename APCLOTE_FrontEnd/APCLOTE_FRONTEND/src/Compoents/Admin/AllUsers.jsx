import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { SyncLoader } from "react-spinners";
import { getUsers } from "../../State/LecturerAndUsers/Action";
import { buildUrl } from "../../config/api";
import { askYesNo } from "../User/YesNoModal";
import { authHeaders } from "../User/deleteResourceUtils";
import Pagination from "../User/Pagination";
import { formatDateTime12Hour } from "../../utils/timeFormat";

const isUserActive = (user) => {
  const status = String(user?.status || user?.accountStatus || "").toUpperCase();
  if (status) {
    return !["DEACTIVATED", "INACTIVE", "DISABLED", "DELETED"].includes(status);
  }

  if (typeof user?.active === "boolean") {
    return user.active;
  }

  if (typeof user?.enabled === "boolean") {
    return user.enabled;
  }

  return true;
};

const requestFirstAvailable = async (requests) => {
  let lastError;

  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (![404, 405].includes(error.response?.status)) {
        throw error;
      }
    }
  }

  throw lastError;
};

const AllUsers = () => {
  const dispatch = useDispatch();
  const { lecturesAndUsers } = useSelector((store) => store);
  const [busyAction, setBusyAction] = React.useState(null);
  const page = lecturesAndUsers.page;
  const totalPages = lecturesAndUsers.totalPages;

  useEffect(() => {
    dispatch(getUsers(1));
  }, [dispatch]);

  const refreshUsers = () => dispatch(getUsers(1));

  const updateUserStatus = async (user, active) => {
    const confirmed = await askYesNo(`${active ? "Activate" : "Deactivate"} ${user?.name || "this user"}?`);
    if (!confirmed) {
      return;
    }

    setBusyAction(`${user.id}-status`);
    try {
      const response = await requestFirstAvailable([
        () => axios.post(buildUrl(`/admin/userStatus?userId=${user.id}&active=${active}`), null, { headers: authHeaders() }),
        () => axios.post(buildUrl(`/admin/updateUserStatus?userId=${user.id}&active=${active}`), null, { headers: authHeaders() }),
      ]);
      toast.success(response.data?.message || response.data || "User status updated");
      refreshUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    } finally {
      setBusyAction(null);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = await askYesNo(`Delete ${user?.name || "this user"}? This action may remove or deactivate the account.`);
    if (!confirmed) {
      return;
    }

    setBusyAction(`${user.id}-delete`);
    try {
      const response = await requestFirstAvailable([
        () => axios.delete(buildUrl(`/admin/deleteUser?userId=${user.id}`), { headers: authHeaders() }),
        () => axios.delete(buildUrl(`/admin/softDeleteUser?userId=${user.id}`), { headers: authHeaders() }),
      ]);
      toast.success(response.data?.message || response.data || "User deleted");
      refreshUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Admin</span>
              <h1 className="title-dark mt-4">All Users</h1>
              <p className="subtle-text mt-2">Latest registered users are shown first.</p>
            </div>
            <Link className="primary-btn w-fit" to="/createLecturer">
              Create Lecturer
            </Link>
          </div>
        </section>

        {lecturesAndUsers?.users?.length > 0 ? (
          <div className="table-shell responsive-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lecturesAndUsers.users.map((user) => {
                  const active = isUserActive(user);
                  const statusBusy = busyAction === `${user.id}-status`;
                  const deleteBusy = busyAction === `${user.id}-delete`;

                  return (
                    <tr key={user.id}>
                      <td data-label="ID">{user.id}</td>
                      <td data-label="Name">{user.name || "N/A"}</td>
                      <td data-label="Email">{user.email || "N/A"}</td>
                      <td data-label="Phone">{user.phono || user.phone || "N/A"}</td>
                      <td data-label="Role">{user.role || "N/A"}</td>
                      <td className="table-status-cell" data-label="Status">
                        <span className={active ? "pill-tag" : "rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600"}>
                          {active ? "ACTIVE" : "DEACTIVATED"}
                        </span>
                      </td>
                      <td data-label="Created">{formatDateTime12Hour(user.createdAt, "N/A")}</td>
                      <td className="table-action-cell" data-label="Action">
                        <div className="admin-action-group flex flex-wrap justify-end gap-2">
                          <button
                            className="secondary-btn !py-2 !px-4 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={Boolean(busyAction)}
                            onClick={() => updateUserStatus(user, !active)}
                            type="button"
                          >
                            {statusBusy ? <SyncLoader color="white" size={6} /> : null}
                            {active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            className="danger-btn !py-2 !px-4 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={Boolean(busyAction)}
                            onClick={() => deleteUser(user)}
                            type="button"
                          >
                            {deleteBusy ? <SyncLoader color="white" size={6} /> : null}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="content-card empty-card">
              <p className="subtle-text text-lg">No users found.</p>
            </div>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(nextPage) => dispatch(getUsers(nextPage, true))} loading={lecturesAndUsers.isloading} label="users" />
      </div>
    </div>
  );
};

export default AllUsers;
