import React from "react";
import "../componentsCss/serverInfo.css";
import { useSelector } from "react-redux";
import { FaMicrophoneSlash } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { TbHeadphonesOff } from "react-icons/tb";
import discord_logo from "../assets/discord_icon.png";
function ServerInfo() {
  const servers = useSelector((state) => state.servers.servers);
  const selectedServer = useSelector((state) => state.servers.selectedServer);
  console.log(selectedServer);
  const selectedServerInfo = servers[selectedServer];
  const username = useSelector((state) => state.servers.loggedUser);
  console.log(selectedServerInfo);
  // const serverList = useSelector((state) => state.servers.serverList);
  return (
    <div className="serverInfo">
      <div className="server-name">Server name</div>
      <div className="info">
        {Object.entries(selectedServerInfo).map(([category, channels]) => (
          <div key={category} className="channelCategory">
            <p className="categoryName">{category}</p>
            <ul className="channel-list">
              {channels.map((channel) => (
                <li key={channel.id} className={`${channel.type} channelList`}>
                  {channel.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="userInfo">
        <img src={discord_logo} className="user-pfp" />
        <div className="user-name">{username}</div>
        <div className="user-icons">
          <FaMicrophoneSlash className="icon" />
          <TbHeadphonesOff className="icon" />
          <IoMdSettings className="icon" />
        </div>
      </div>
    </div>
  );
}
export default ServerInfo;
