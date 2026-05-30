import React, { useState } from "react";
import { sendOtp } from "../../api/authService";
import { useNavigate } from "react-router-dom";
import { SyncLoader } from "react-spinners";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoader(true);
      await sendOtp(email);
      setMessage("OTP sent to your email!");
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setMessage("Error sending OTP. Please check your email.");
    }
    setLoader(false);
  };

  return (
    <div className="auth-shell">
      <div className="form-shell surface-panel">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Password Recovery</span>
        <h2 className="title-dark text-3xl mt-6 mb-4">Forgot Password</h2>
        <p className="subtle-text mb-6">Enter your email and we will send a one-time code to continue resetting your password.</p>
        <form onSubmit={handleSendOtp} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loader}
          />
          <button type="submit" disabled={loader} className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-70">
            {loader ? <SyncLoader color="white" /> : "Send OTP"}
          </button>
        </form>
        {message && <p className="text-center mt-4 subtle-text">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
