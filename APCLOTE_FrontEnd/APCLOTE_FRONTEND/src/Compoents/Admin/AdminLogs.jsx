import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { buildUrl } from "../../config/api";
import { authHeaders, isRootAdmin } from "../User/deleteResourceUtils";
import Pagination from "../User/Pagination";
import { formatDateTime12Hour } from "../../utils/timeFormat";

const AdminLogs = () => {
  const [logs, setLogs] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const [isLoading, setIsLoading] = React.useState(false);

  const loadLogs = async (nextPage = page, append = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get(buildUrl(`/admin/adminLogs?pageNumber=${nextPage - 1}&pageSize=20`), { headers: authHeaders() });
      setLogs((current) => (append ? [...current, ...(response.data?.content || [])] : response.data?.content || []));
      setPage((response.data?.number || 0) + 1);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data || "Failed to load admin logs");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isRootAdmin()) {
      loadLogs(1);
    }
  }, []);

  if (!isRootAdmin()) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <section className="surface-panel p-8">
            <h1 className="title-dark">Root Admin Required</h1>
            <p className="subtle-text mt-3">Only the root admin can view admin logs.</p>
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
          <h1 className="title-dark mt-3">Admin Logs</h1>
        </section>

        <section className="surface-panel p-6 md:p-8">
          <div className="space-y-3">
            {logs.length > 0 ? logs.map((log) => (
              <article key={log.id} className="content-card p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">{log.action} {log.resourceType}</p>
                    <p className="subtle-text">{log.actorName || "Unknown"} ({log.actorEmail || "N/A"})</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">{formatDateTime12Hour(log.createdAt, "N/A")}</span>
                </div>
                <p className="mt-3 text-sm text-slate-700">{log.details || log.resourceName || "No details"}</p>
              </article>
            )) : <p className="subtle-text">No logs found.</p>}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(nextPage) => loadLogs(nextPage, true)} loading={isLoading} label="logs" />
        </section>
      </div>
    </div>
  );
};

export default AdminLogs;
