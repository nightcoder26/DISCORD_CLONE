import { useEffect, useState } from "react";
import ServerContent from "./myComponents/ServerContent";
import ServerInfo from "./myComponents/ServerInfo";
import ServerName from "./myComponents/ServerName";
import "./App.css";
import { useSelector } from "react-redux";
import LoginSignup from "./myComponents/LoginSignup";
import { Link } from "react-router-dom";
import ErrorComp from "./myComponents/ErrorComp";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const username = useSelector((state) => state.servers.loggedUser);
  useEffect(() => {
    if (username !== "SamayRaina") {
      setAuthenticated(true);
    } else {
      // thik h na
      setAuthenticated(false);
    }
  }, [authenticated]);

  return (
    <>
      {authenticated ? (
        <div className="main">
          <ServerName />
          <ServerInfo />
          <ServerContent />
        </div>
      ) : (
        <ErrorComp />
      )}
    </>
  );
  //banado
}

export default App;
