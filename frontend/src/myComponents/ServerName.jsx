import React from "react";
import "../componentsCss/serverName.css";
import discord_logo from "../assets/discord_icon.png";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setSelectedServer } from "../features/categorSlice";

const ServerName = () => {
  const dispatch = useDispatch();
  const loggedUser = useSelector((state) => state.servers.loggedUser);
  const serverList = useSelector((state) => {
    return state.servers.userServerList.filter(
      (user) => user.username === loggedUser
    );
  });

  //apka dikha

  //hm
  //ill try
  //just display ke lie thi ye
  //servers bas haa sory
  const handleServerClick = (server) => {
    console.log(server);
    dispatch(setSelectedServer(server));
  };
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
            {Object.keys(serverList).map((server) => (
              <li
                key={server}
                className="servers"
                onClick={() => {
                  handleServerClick(serverList[server]);
                }}
              >
                {serverList[server]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ServerName;
