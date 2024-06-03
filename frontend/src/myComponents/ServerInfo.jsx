import React from "react";
import "../componentsCss/serverInfo.css";
function ServerInfo() {
  const categories = {
    News: [
      { name: "TV9", id: "news1", type: "text" },
      { name: "Aaj tak", id: "news2", type: "text" },
      { name: "Republic TV", id: "news3", type: "text" },
    ],
    Dews: [
      { name: "TV9", id: "news1", type: "text" },
      { name: "Aaj tak", id: "news2", type: "text" },
      { name: "Republic TV", id: "news3", type: "text" },
    ],
    Mews: [
      { name: "TV9", id: "news1", type: "text" },
      { name: "Aaj tak", id: "news2", type: "text" },
      { name: "Republic TV", id: "news3", type: "text" },
    ],
    Aews: [
      { name: "TV9", id: "news1", type: "text" },
      { name: "Aaj tak", id: "news2", type: "text" },
      { name: "Republic TV", id: "news3", type: "text" },
    ],
    Jews: [
      { name: "TV9", id: "news1", type: "text" },
      { name: "Aaj tak", id: "news2", type: "text" },
      { name: "Republic TV", id: "news3", type: "text" },
    ],
    Kews: [
      { name: "TV9", id: "news1", type: "text" },
      { name: "Aaj tak", id: "news2", type: "text" },
      { name: "Republic TV", id: "news3", type: "text" },
    ],
    Sports: [
      { name: "ESPN", id: "sports1", type: "voice" },
      { name: "Fox Sports", id: "sports2", type: "text" },
      { name: "Sky Sports", id: "sports3", type: "voice" },
    ],
    Entertainment: [
      { name: "HBO", id: "entertainment1", type: "text" },
      { name: "Netflix", id: "entertainment2", type: "voice" },
      { name: "Hulu", id: "entertainment3", type: "text" },
    ],
    Music: [
      { name: "MTV", id: "music1", type: "voice" },
      { name: "VH1", id: "music2", type: "voice" },
      { name: "Spotify", id: "music3", type: "text" },
    ],
    Education: [
      { name: "Khan Academy", id: "education1", type: "text" },
      { name: "Coursera", id: "education2", type: "text" },
      { name: "edX", id: "education3", type: "voice" },
    ],
  };
  return (
    <div className="serverInfo">
      <div className="server-name">Server name</div>
      <div className="info">
        {Object.entries(categories).map(([category, channels]) => (
          <div key={category} className="channelCategory">
            <p className="categoryName">{category}</p>
            <ul className="channel-list">
              {channels.map((channel) => (
                <li className={`${channel.type} channelList`}>
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
