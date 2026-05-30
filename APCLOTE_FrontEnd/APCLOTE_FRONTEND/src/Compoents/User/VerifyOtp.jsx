import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../api/authService";
import { SyncLoader } from "react-spinners";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoader(true);
      await verifyOtp(email, otp);
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setMessage("Invalid OTP. Please try again.");
    }
    setLoader(false);
  };

  return (
    <div className="auth-shell">
      <div className="form-shell surface-panel">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Security Check</span>
        <h2 className="title-dark text-3xl mt-6 mb-4">Verify OTP</h2>
        <p className="subtle-text mb-6">Enter the code sent to your email to continue resetting your password.</p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input type="text" placeholder="Enter OTP" className="field-input" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={loader} />
          <button type="submit" disabled={loader} className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-70">
            {loader ? <SyncLoader color="white" /> : "Verify OTP"}
          </button>
        </form>
        {message && <p className="text-center mt-4 text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyOtp;
