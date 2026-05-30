import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createPo } from "../../State/POAndPayment/Action";
import { toast } from "react-toastify";
import { SyncLoader } from "react-spinners";

const CreateOrder = () => {
  const [orderDate, setOrderDate] = useState("");
  const location = useLocation();
  const { batch } = location.state || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { poAndPa } = useSelector((store) => store);

  useEffect(() => {
    const today = new Date();
    setOrderDate(today.toLocaleDateString("en-GB"));
  }, []);

  const handleCreateOrder = async () => {
    const success = await dispatch(createPo(batch.id));
    if (success) {
      toast.success("Order created");
      navigate("/myPOs");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content">
        <div className="form-shell surface-panel space-y-6">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Purchase Flow</span>
          <h2 className="title-dark text-3xl">Create Purchase Order</h2>

          <div className="content-card p-6 space-y-4">
            <div className="flex justify-between gap-4">
              <span className="font-medium text-gray-600">Batch Name</span>
              <span className="text-gray-900 font-semibold">{batch?.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium text-gray-600">Batch Price</span>
              <span className="text-emerald-700 font-semibold">Rs {batch?.course?.fee}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium text-gray-600">Order Date</span>
              <span className="text-gray-900">{orderDate}</span>
            </div>
          </div>

          <button onClick={handleCreateOrder} disabled={poAndPa?.isloading} className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed">
            <span className="flex items-center justify-center gap-3">
              {poAndPa?.isloading ? <SyncLoader color="white" size={8} /> : null}
              <span>{poAndPa?.isloading ? "Creating Order..." : "Create Order"}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
