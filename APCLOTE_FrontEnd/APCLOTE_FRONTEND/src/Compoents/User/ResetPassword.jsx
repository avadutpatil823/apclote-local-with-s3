import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { resetPassword } from "../../api/authService";
import { SyncLoader } from "react-spinners";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const location = useLocation();
  const email = location.state?.email;

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      setLoader(true);
      await resetPassword(email, password);
      setMessage("Password reset successfully!");
    } catch (err) {
      setMessage("Error resetting password.");
    }
    setLoader(false);
  };

  return (
    <div className="auth-shell">
      <div className="form-shell surface-panel">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">New Password</span>
        <h2 className="title-dark text-3xl mt-6 mb-4">Reset Password</h2>
        <p className="subtle-text mb-6">Choose a new password for your account and confirm it once to finish recovery.</p>
        <form onSubmit={handleReset} className="space-y-4">
          <input type="password" placeholder="New Password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loader} />
          <input type="password" placeholder="Confirm Password" className="field-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loader} />
          <button type="submit" disabled={loader} className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-70">
            {loader ? <SyncLoader color="white" /> : "Reset Password"}
          </button>
        </form>
        {message && <p className="text-center mt-4 subtle-text">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
