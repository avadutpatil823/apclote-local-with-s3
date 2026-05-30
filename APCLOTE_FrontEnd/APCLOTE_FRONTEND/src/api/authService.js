import axios from "axios";
import { buildApiUrl } from "../config/api";

export const sendOtp = async (email) => {
  return await axios.post(buildApiUrl("/send-otp"), { email });
};

export const verifyOtp = async (email, otp) => {
  return await axios.post(buildApiUrl("/verify-otp"), { email, otp });
};

export const resetPassword = async (email, newPassword) => {
  return await axios.post(buildApiUrl("/reset-password"), { email, newPassword });
};
