import React from "react";
import "../componentsCss/serverContent.css";
import logo from "../assets/discord_icon.png";
function ServerContent() {
  return (
    <div className="serverContent">
      <div className="channelName">
        Channel name |<div className="channelDesc">Channel Description</div>
      </div>
      <div className="channelContent">
        <div className="welcome">
          <img src={logo} width={60} height={60} className="channelLogo" />
          {/** channel ka logo yaha ayega yess kya hogyaaa kaha closing */}
          Welcome to the channel! Start by sending a message or a file!
        </div>
        <div className="chats"></div>
      </div>
      <div className="messageInput">
        <input type="text"></input>
      </div>
    </div>
  );
}

export default ServerContent;
