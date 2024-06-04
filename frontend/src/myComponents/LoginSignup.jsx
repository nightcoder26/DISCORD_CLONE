import React from "react";
import "../componentsCss/loginSignup.css";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/categorSlice";
import { useState } from "react";
const LoginSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const store_email = useSelector((state) => state.servers.email);
  const store_password = useSelector((state) => state.servers.password);
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  return (
    <>
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
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit">LOGIN</button>
          </form>
          {/* <div>
            {store_email} {store_password}
          </div> */}
          <div className="register">
            <p>
              Need an account ? <a href="#">Register</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSignup;
