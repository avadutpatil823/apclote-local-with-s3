import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUser } from "../State/Auth/Action";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const dispatch=useDispatch()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("JWT", JSON.stringify(token));
      dispatch(getUser())
      navigate("/"); // your main page
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
}
