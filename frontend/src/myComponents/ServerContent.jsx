import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../features/categorSlice"; // Ensure the path is correct
import "../componentsCss/serverContent.css";
import logo from "../assets/discord_icon.png";

function ServerContent() {
  const chatsEndRef = useRef(null);

  const scrollToBottom = () => {
    if (chatsEndRef.current) {
      chatsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const dispatch = useDispatch();
  const selectedServer = useSelector((state) => state.servers.selectedServer);
  const selectedChannelId = useSelector((state) => state.servers.selectedChannel);
  const [newMessage, setNewMessage] = useState("");

  const categories = useSelector((state) =>
    state.servers.servers[selectedServer]?.categories || []
  );

  const messages = useSelector((state) =>
    state.servers.messages[selectedChannelId.name] || []
  );

  const loggedUser = useSelector((state) =>
    state.servers.loggedUser
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log(loggedUser, selectedChannelId.name, newMessage)
      dispatch(
        addMessage({
          channelId: selectedChannelId.name,
          message: newMessage,
          username: loggedUser, // Include username in the message object
        })
      );
      setNewMessage("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="serverContent">
      <div className="channelName">
        {selectedChannelId ? selectedChannelId.name : "Channel name"} |
        <div className="channelDesc">Channel Description</div>
      </div>
      <div className="channelContent">
        <div className={`welcome ${messages.length > 0 ? 'top' : ''}`}>
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
            <div key={index} className={`chatMessage ${message.username === loggedUser ? 'right' : 'left'}`}>
              <div className="messageText">{message.text}</div>
              <div className="messageUsername">{message.username}</div>
            </div>
          ))}
          <div ref={chatsEndRef} />
        </div>
      </div>
      <div className="messageInput">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ServerContent;
