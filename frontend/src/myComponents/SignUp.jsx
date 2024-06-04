import React from "react";
import "../componentsCss/loginSignup.css";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../features/categorSlice";
import { useState } from "react";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const store_users = useSelector((state) => state.servers.users);

  const dispatch = useDispatch();
  const handleSignUp = (e) => {
    e.preventDefault();
    dispatch(signup({ email, password, displayName, username }));
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleDisplayChange = (e) => {
    setDisplayName(e.target.value);
  };
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  return (
    <>
      <div className="loginSignup">
        <div className="login-form">
          <h1 className="create">Create an Account </h1>
          <form onSubmit={handleSignUp} className="actual-form">
            <label>EMAIL</label>
            <input type="text" value={email} onChange={handleEmailChange} />
            <label>DISPLAY NAME</label>
            <input
              type="text"
              value={displayName}
              onChange={handleDisplayChange}
            ></input>
            <label>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
            ></input>
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />

            <button type="submit">Continue</button>
          </form>
          <div>
            {/* <ul>
              {store_users.map((user, index) => (
                <li key={index}>
                  <p>Email: {user.email}</p>
                  <p>Password: {user.password}</p>
                  <p>Display Name: {user.displayName}</p>
                  <p>Username: {user.username}</p>
                </li>
              ))}
            </ul> */}
          </div>

          <div className="register">
            <p>
              <a href="#">Already have an account? </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
