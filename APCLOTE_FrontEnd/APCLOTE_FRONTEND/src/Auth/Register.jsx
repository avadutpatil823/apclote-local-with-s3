import React, { useState } from "react";
import { register } from "../State/Auth/Action";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { SyncLoader } from "react-spinners";

const Register = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector((store) => store);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "ROLE_USER",
    password: "",
    phono: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  return (
    <div className="auth-shell">
      <div className="auth-card surface-panel">
        <div className="auth-showcase">
          <span className="eyebrow">Join APCLOTE</span>
          <h1 className="section-title mt-6">Create your account and step into a clearer learning journey.</h1>
          <p className="section-subtitle mt-5">
            Sign up once to access batches, classroom resources, notes, and progress tools from one place.
          </p>
        </div>

        <div className="auth-form">
          <h2 className="title-dark text-3xl mb-8">Register</h2>

          {auth?.user?.name && (
            <div className="rounded-2xl bg-emerald-50 py-3 px-4 font-bold text-emerald-800 mb-5 text-center border border-emerald-200">
              Registration successful!
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="field-label">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required disabled={auth.isloading} className="field-input" />
            </div>

            <div>
              <label className="field-label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required disabled={auth.isloading} className="field-input" />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required disabled={auth.isloading} className="field-input" />
            </div>

            <div>
              <label className="field-label">Phone</label>
              <input type="text" name="phono" value={formData.phono} onChange={handleChange} placeholder="Enter phone number" required disabled={auth.isloading} className="field-input" />
            </div>

            <div>
              <label className="field-label">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter your address" required disabled={auth.isloading} className="field-input" />
            </div>

            <button
              type="submit"
              disabled={auth.isloading}
              className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-3">
                {auth.isloading ? <SyncLoader color="white" size={8} /> : null}
                <span>{auth.isloading ? "Creating Account..." : "Sign Up"}</span>
              </span>
            </button>

            {auth.isloading && (
              <p className="text-center text-sm text-slate-500">Creating your account and setting things up.</p>
            )}

            <div className="text-slate-700 text-center mt-2">
              <Link to="/login" className="hover:underline text-teal-700 font-bold">
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
