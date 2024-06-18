import React from "react";
import "../componentsCss/loginSignup.css";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../features/categorSlice";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//dekho :sob:
const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const store_users = useSelector((state) => state.servers.users);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Check if email or username is already in use
    const isEmailTaken = store_users.some((user) => user.email === email);
    const isUsernameTaken = store_users.some(
      (user) => user.username === username
    );

    if (isEmailTaken) {
      setEmailError("Email is already in use. Please choose another.");
    } else {
      setEmailError("");
    }

    if (isUsernameTaken) {
      setUsernameError("Username is already in use. Please choose another.");
    } else {
      setUsernameError("");
    }

    if (!isEmailTaken && !isUsernameTaken) {
      await dispatch(signup({ email, password, displayName, username }));
      navigate("/");
    }
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }; // charge itni jaldi drain hogyi
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
            {emailError && (
              <p className="error" style={{ color: "#FF0000" }}>
                {emailError}
              </p>
            )}
            <label>DISPLAY NAME</label>
            <input
              type="text"
              value={displayName}
              onChange={handleDisplayChange}
            ></input>
            <label>USERNAME(USERNAME SHOULD BE UNIQUE)</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
            ></input>
            {usernameError && (
              <p className="error" style={{ color: "#FF0000" }}>
                {usernameError}
              </p>
            )}
            {/* <p className="username" style={{ color: "#FFF" }}>
              USERNAME SHOULD BE UNIQUE
            </p> */}
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
            {/* {store_userServerList.map((user) => {
              return (
                <div>
                  {user.username}
                  {user.servers.map((server) => {
                    return <div>{server}</div>;
                  })}
                </div>
              );
            })} */}
          </div>

          <div className="register">
            <p>
              <Link to="/">Already have an account? </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
