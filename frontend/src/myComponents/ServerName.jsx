import React from "react";
import "../componentsCss/serverName.css";
import discord_logo from "../assets/discord_icon.png";
const ServerName = () => {
  const servers = ["Server1", "Server2", "Server3", "Server4", "Server5"];
  return (
    <>
      <div className="mainList">
        <div className="dmList">
          <img
            src={discord_logo}
            alt="discord icon"
            width={50}
            height={50}
            className="discord_logo"
          />
        </div>
        <hr width={40}></hr>
        <div className="serverList">
          <ul>
            {servers.map((server, index) => (
              <div className="servers">
                <li key={index}>{server}</li>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ServerName;
