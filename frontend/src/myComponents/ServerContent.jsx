import React, { useState } from "react";
import "../componentsCss/serverContent.css";
import logo from "../assets/discord_icon.png";

function ServerContent() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, newMessage]);
      setNewMessage("");
    }
  };

  return (
    <div className="serverContent">
      <div className="channelName">
        Channel name |<div className="channelDesc">Channel Description</div>
      </div>
      <div className="channelContent">
        <div className="welcome">
          <img src={logo} width={60} height={60} className="channelLogo" />
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
