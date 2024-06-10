import React, { useState, useEffect } from "react";
import "../componentsCss/loginSignup.css";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/categorSlice";
import { Link, useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loggedUser = useSelector((state) => state.servers.loggedUser);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  useEffect(() => {
    if (loggedUser) {
      if (loggedUser === "SamayRaina") {
        setError("Invalid Credentials!");
      } else {
        setError("");
        navigate("/app");
      }
    }
  }, [loggedUser, navigate]); //yha bhejri  ig login baad hee

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className="loginSignup">
      <div className="login-form">
        <h1>Welcome Back!</h1>
        <form onSubmit={handleLogin} className="actual-form">
          <label>EMAIL OR PHONE NUMBER</label>
          <input
            type="text"
            placeholder="Username"
            value={email}
            onChange={handleEmailChange}
          />
          <label>PASSWORD</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
          <div className="forgot-password">
            <Link to="/">Forgot Password?</Link>
          </div>
          <button type="submit">LOGIN</button>
        </form>
        {error && <div className="error-message">{error}</div>}
        <div className="register">
          <p>
            Need an account? <Link to="/signup">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
