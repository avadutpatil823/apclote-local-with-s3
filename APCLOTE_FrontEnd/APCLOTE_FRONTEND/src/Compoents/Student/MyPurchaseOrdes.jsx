import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getmyPos } from "../../State/POAndPayment/Action";
import { Link } from "react-router-dom";

const MyPurchaseOrders = () => {
  const dispatch = useDispatch();
  const { poAndPa } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getmyPos());
  }, [dispatch]);

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Orders</span>
          <h1 className="title-dark mt-4">My Purchase Orders</h1>
        </section>

        {poAndPa.myPos.length === 0 ? (
          <div className="empty-state">
            <div className="content-card empty-card">
              <p className="text-lg font-medium subtle-text">No purchase orders created yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid-auto-fit">
            {poAndPa.myPos.map((order) => (
              <div key={order.id} className="dashboard-card p-6 space-y-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  Batch Name: <span className="font-normal">{order.batch?.name}</span>
                </h2>

                <p className="text-gray-700">
                  <span className="font-medium">Batch Fee:</span> Rs {order?.fee}
                </p>

                <p className="text-gray-700">
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>

                {order.status === "PENDING" && (
                  <Link to="/dopay" state={{ poId: order.id }} className="primary-btn w-fit">
                    Pay Now
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchaseOrders;
