import { useState } from "react";
import ServerContent from "./myComponents/ServerContent";
import ServerInfo from "./myComponents/ServerInfo";
import ServerName from "./myComponents/ServerName";

import "./App.css";

function App() {
  return (
    <>
      <div className="main">
        <ServerName />
        <ServerInfo />
        <ServerContent />
      </div>
    </>
  );
  //banado
}

export default App;