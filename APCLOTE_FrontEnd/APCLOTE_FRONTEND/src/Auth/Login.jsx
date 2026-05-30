import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../State/Auth/Action";
import { SyncLoader } from "react-spinners";
import { Link, useSearchParams } from "react-router-dom";
import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";
import { toast } from "react-toastify";
import { buildUrl } from "../config/api";

const Login = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { auth } = useSelector((store) => store);
  const redirectTo = searchParams.get("redirect");
  const inactiveAccount = searchParams.get("account") === "inactive";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login(formData, redirectTo));
  };

  useEffect(() => {
    if (inactiveAccount) {
      toast.error("Your account is deactivated or deleted. Please contact admin.");
    }
  }, [inactiveAccount]);

  return (
    <div className="auth-shell">
      <div className="auth-card surface-panel">
        <div className="auth-showcase">
          <span className="eyebrow">Welcome Back</span>
          <h1 className="section-title mt-6">Sign in and continue learning with momentum.</h1>
          <p className="section-subtitle mt-5">
            Access your enrolled batches, classes, notes, and progress from one calm, organized workspace.
          </p>
        </div>

        <div className="auth-form">
          {localStorage.getItem("JWT") && (
            <div className="rounded-2xl bg-emerald-50 py-3 px-4 font-bold text-emerald-800 mb-5 text-center border border-emerald-200">
              Your sign in is already active.
            </div>
          )}

          <h2 className="title-dark text-3xl mb-8">Sign In to APCLOTE</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={auth.isloading}
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                disabled={auth.isloading}
                className="field-input"
              />
            </div>

            <button
              type="submit"
              disabled={auth.isloading}
              className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-3">
                {auth.isloading ? <SyncLoader color="white" size={8} /> : null}
                <span>{auth.isloading ? "Signing In..." : "Sign In"}</span>
              </span>
            </button>

            {auth.isloading && (
              <p className="text-center text-sm text-slate-500">Checking your credentials and preparing your workspace.</p>
            )}

            <div className="flex justify-between text-sm mt-1 text-slate-700">
              <Link to="/forgot-password" className="hover:underline font-bold text-teal-700">
                Forgot Password?
              </Link>
              <Link to="/register" className="hover:underline font-bold text-teal-700">
                Create Account
              </Link>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-stone-200 flex-1"></div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">or</p>
              <div className="h-px bg-stone-200 flex-1"></div>
            </div>

            <div className="flex gap-4 items-center justify-center">
              <a href={buildUrl("/oauth2/authorization/google")} className="ghost-btn !rounded-2xl !px-5 !py-3">
                <FaGoogle size={22} />
              </a>
              <a href={buildUrl("/oauth2/authorization/github")} className="ghost-btn !rounded-2xl !px-5 !py-3">
                <FaGithub size={22} />
              </a>
              <a href={buildUrl("/oauth2/authorization/facebook")} className="ghost-btn !rounded-2xl !px-5 !py-3">
                <FaFacebook size={22} />
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
