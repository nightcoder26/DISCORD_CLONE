import React from "react";
import "../componentsCss/loginSignup.css";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/categorSlice";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const LoginSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const store_email = useSelector((state) => state.servers.email);
  const store_password = useSelector((state) => state.servers.password);
  const loggedUser = useSelector((state) => state.servers.loggedUser);
  const navigate = useNavigate();
  // const handleLogin  = async(e) => {
  //   e.preventDefault();
  //    const user =  dispatch(login({ email, password }));
  //   if (loggedUser === "SamayRaina") {
  //     console.log(loggedUser);
  //     console.log("Invalid Credentials!");
  //   } else {
  //     console.log(loggedUser);
  //   }
  // };
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
    //kaise krte h
  };

  useEffect(() => {
    if (loggedUser) {
      if (loggedUser === "SamayRaina") {
        console.log(loggedUser);
        console.log("Invalid Credentials!");
      } else {
        console.log(loggedUser);
        navigate("/app");
        //ye kaam nhi krra ig
      }
    }
  }, [loggedUser]);
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
          {/* <div>{loggedUser}</div> */}
          <div className="register">
            <p>
              Need an account ? <Link to="/signup">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSignup;
