import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { makePayment } from "../../State/POAndPayment/Action";
import { SyncLoader } from "react-spinners";

const Payment = () => {
  const [selectedUpi, setSelectedUpi] = useState("");
  const [upiId, setUpiId] = useState("");
  const location = useLocation();
  const { orderId } = location.state || null;
  const dispatch = useDispatch();
  const { poAndPa } = useSelector((store) => store);

  const upiOptions = ["PhonePe", "Google Pay", "Paytm", "BHIM"];

  const handlePay = async () => {
    await dispatch(makePayment(orderId, upiId));
  };

  return (
    <div className="page-shell">
      <div className="page-content">
        <div className="form-shell surface-panel space-y-6">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Payment</span>
          <h2 className="title-dark text-3xl">Make Payment</h2>

          <div className="space-y-3">
            <p className="font-medium text-slate-700">Select UPI Option</p>
            {upiOptions.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition ${
                  selectedUpi === option
                    ? "border-teal-500 bg-teal-50"
                    : "border-stone-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="upi"
                  value={option}
                  checked={selectedUpi === option}
                  onChange={(e) => setSelectedUpi(e.target.value)}
                  disabled={poAndPa?.isloading}
                />
                <span className="text-gray-800">{option}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="field-label">Enter UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@upi"
              className="field-input"
              disabled={poAndPa?.isloading}
            />
          </div>

          <button onClick={handlePay} disabled={poAndPa?.isloading} className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed">
            <span className="flex items-center justify-center gap-3">
              {poAndPa?.isloading ? <SyncLoader color="white" size={8} /> : null}
              <span>{poAndPa?.isloading ? "Processing Payment..." : "Pay Now"}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
