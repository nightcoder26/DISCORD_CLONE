import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../serverSlice";
import "../componentsCss/serverContent.css";
import logo from "../assets/discord_icon.png";

function ServerContent() {
  const dispatch = useDispatch();
  const selectedServer = useSelector((state) => state.servers.selectedServer);
  const selectedChannel = useSelector((state) => state.servers.selectedChannel);
  const channels = useSelector(
    (state) => state.servers.servers[selectedServer]
  );
  const [newMessage, setNewMessage] = useState("");

  const currentChannel = Object.values(channels)
    .flat()
    .find((channel) => channel.id === selectedChannel);
  const messages = currentChannel ? currentChannel.messages : [];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      dispatch(
        addMessage({
          serverName: selectedServer,
          channelId: selectedChannel,
          message: newMessage,
        })
      );
      setNewMessage("");
    }
  };

  return (
    <div className="serverContent">
      <div className="channelName">
        {currentChannel?.name || "Channel name"} |
        <div className="channelDesc">Channel Description</div>
      </div>
      <div className="channelContent">
        <div className="welcome">
          <img
            src={logo}
            width={60}
            height={60}
            className="channelLogo"
            alt="Channel Logo"
          />
          Welcome to the channel! Start by sending a message or a file!
        </div>
        <div className="chats">
          {messages.map((message, index) => (
            <div key={index} className="chatMessage">
              {message}
            </div>
          ))}
        </div>
      </div>
      <div className="messageInput">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ServerContent;
