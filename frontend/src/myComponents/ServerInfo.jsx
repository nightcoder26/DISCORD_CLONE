import React from "react";
import "../componentsCss/serverInfo.css";
import { useSelector } from "react-redux";
function ServerInfo() {
  const servers = useSelector((state) => state.servers.servers);
  const selectedServer = useSelector((state) => state.servers.selectedServer);
  console.log(selectedServer);
  const selectedServerInfo = servers[selectedServer];
  console.log(selectedServerInfo);
  // const serverList = useSelector((state) => state.servers.serverList);
  return (
    <div className="serverInfo">
      <div className="server-name">Server name</div>
      <div className="info">
        {/* {Object.entries(servers).map(([server, categories]) => (
          <div className="channelCategories">
            {Object.entries(categories).map(([category, channels]) => (
              <div key={category} className="channelCategory">
                <p className="categoryName">{category}</p>
                <ul className="channel-list">
                  {channels.map((channel) => (
                    <li
                      key={channel.id}
                      className={`${channel.type} channelList`}
                    >
                      {channel.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))} */}
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
      <div className="userInfo"> User info</div>
    </div>
  );
}
export default ServerInfo;
