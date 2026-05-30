import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBatchs, getSearchedBatchs } from "../../State/BatchsAndCoursesAndSubjects/Action";
import Pagination from "./Pagination";
import BatchCard from "./BatchCard";

function AllBatches() {
  const [key, setKey] = useState("");
  const dispatch = useDispatch();
  const { batchs } = useSelector((store) => store);
  const page = batchs.page;
  const totalPages = batchs.totalPages;

  useEffect(() => {
    if (key && key.trim() !== "") {
      dispatch(getSearchedBatchs(key, 1));
    } else {
      dispatch(getAllBatchs(1));
    }
  }, [key, dispatch]);

  const onPageChane = (num) => {
    return key && key.trim() !== ""
      ? dispatch(getSearchedBatchs(key, num, true))
      : dispatch(getAllBatchs(num, "", true));
  };

  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <span className="eyebrow">Course Catalog</span>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-5">
            <div className="max-w-3xl">
              <h1 className="section-title">Find the batch that matches your next step.</h1>
              <p className="section-subtitle mt-4">
                Browse current offerings, compare timing and duration, and choose
                the class that fits your study plan best.
              </p>
            </div>
            <div className="surface-panel p-2 w-full lg:w-[360px]">
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Search batch by name..."
                className="field-input border-0 bg-transparent shadow-none"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {batchs.allBatchs.length > 0 ? (
            batchs.allBatchs.map((batch) => <BatchCard key={batch.id} batch={batch} />)
          ) : (
            <div className="col-span-full empty-state">
              <div className="content-card empty-card">
                <h2 className="title-dark text-2xl">No batches found</h2>
                <p className="subtle-text mt-3">
                  Try a different search term or come back after new courses are published.
                </p>
              </div>
            </div>
          )}
        </section>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChane} loading={batchs.isloading} label="batches" />
      </div>
    </div>
  );
}

export default AllBatches;
