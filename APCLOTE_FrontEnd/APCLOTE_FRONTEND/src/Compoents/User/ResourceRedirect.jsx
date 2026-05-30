import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResourceRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target") || "/";

  useEffect(() => {
    if (!localStorage.getItem("JWT")) {
      navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true });
      return;
    }

    navigate(target, { replace: true });
  }, [navigate, target]);

  return (
    <div className="page-shell">
      <div className="page-content">
        <section className="surface-panel p-8">
          <p className="subtle-text">Opening requested resource...</p>
        </section>
      </div>
    </div>
  );
};

export default ResourceRedirect;
