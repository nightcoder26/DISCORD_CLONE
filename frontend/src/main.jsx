import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import store from "./app/store";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./myComponents/LoginSignup.jsx";
import SignUp from "./myComponents/SignUp.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/app" element={<App />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  </Provider>
);
