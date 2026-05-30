import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, loading = false, label = "items" }) => {
  const sentinelRef = React.useRef(null);
  const [internalLoading, setInternalLoading] = React.useState(false);
  const hasMore = currentPage < totalPages;
  const isLoading = loading || internalLoading;

  React.useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || isLoading) {
          return;
        }

        setInternalLoading(true);
        try {
          await onPageChange(currentPage + 1);
        } finally {
          window.setTimeout(() => setInternalLoading(false), 350);
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [currentPage, hasMore, isLoading, onPageChange]);

  return (
    <div ref={sentinelRef} className="mt-8">
      {hasMore || isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(isLoading ? [0, 1, 2] : [0]).map((item) => (
            <div key={item} className="content-card h-24 animate-pulse bg-slate-100 p-5">
              <div className="h-4 w-2/3 rounded bg-slate-200"></div>
              <div className="mt-4 h-3 w-1/2 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      ) : (
        totalPages > 1 && <p className="text-center subtle-text">All {label} loaded.</p>
      )}
    </div>
  );
};

export default Pagination;
