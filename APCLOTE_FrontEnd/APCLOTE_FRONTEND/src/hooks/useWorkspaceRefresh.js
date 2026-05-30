import { useCallback, useEffect } from "react";
import { getAllBatchs, getLecturerBatchs, getMyBatchs } from "../State/BatchsAndCoursesAndSubjects/Action";

const WORKSPACE_REFRESH_INTERVAL = 60000;

const refreshForRole = (dispatch, userRole, options = {}) => {
  if (userRole === "ROLE_ADMIN") {
    dispatch(getAllBatchs(1, "", false, options));
    return;
  }

  if (userRole === "ROLE_LECTURER") {
    dispatch(getLecturerBatchs(options));
    return;
  }

  if (userRole === "ROLE_USER") {
    dispatch(getMyBatchs(options));
  }
};

export const useWorkspaceRefresh = (dispatch, userRole, { enabled = true, poll = true } = {}) => {
  const refreshWorkspace = useCallback(
    (options = {}) => {
      if (!enabled || !userRole) {
        return;
      }

      refreshForRole(dispatch, userRole, options);
    },
    [dispatch, enabled, userRole]
  );

  useEffect(() => {
    refreshWorkspace();
  }, [refreshWorkspace]);

  useEffect(() => {
    if (!enabled || !poll || !userRole) {
      return undefined;
    }

    const handleVisibilityRefresh = () => {
      if (!document.hidden) {
        refreshWorkspace({ silent: true });
      }
    };

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        refreshWorkspace({ silent: true });
      }
    }, WORKSPACE_REFRESH_INTERVAL);

    window.addEventListener("focus", handleVisibilityRefresh);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
    };
  }, [enabled, poll, refreshWorkspace, userRole]);

  return refreshWorkspace;
};
