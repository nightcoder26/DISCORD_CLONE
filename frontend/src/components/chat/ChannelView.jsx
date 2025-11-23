import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaPaperPlane, FaSmile, FaFileUpload, FaEdit, FaTrash } from 'react-icons/fa';
import { BsEmojiLaughing } from 'react-icons/bs';
import { MdGif } from 'react-icons/md';
import toast from 'react-hot-toast';

import {
  fetchMessages,
  sendMessage,
  sendMessageWithFile,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  addMessageToChannel
} from '../../store/slices/messageSlice';
import { openUserProfileModal } from '../../store/slices/uiSlice';
import { socketService } from '../../services/socketService';

const ChannelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #36393f;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2f3136;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #202225;
    border-radius: 4px;
  }
`;

const MessageGroup = styled.div`
  display: flex;
  gap: 16px;
  padding: 8px 0;
  position: relative;
  
  &:hover {
    background: rgba(4, 4, 5, 0.07);
    border-radius: 8px;
    padding: 8px;
    margin: 0 -8px;
  }
  
  &:hover .message-actions {
    opacity: 1;
  }
`;

const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.bgColor || '#5865f2'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
`;

const MessageAuthor = styled.span`
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MessageTimestamp = styled.span`
  color: #72767d;
  font-size: 12px;
  font-weight: 500;
`;

const MessageText = styled.div`
  color: #dcddde;
  font-size: 16px;
  line-height: 1.375;
  word-wrap: break-word;
  
  &.editing {
    background: #40444b;
    border-radius: 4px;
    padding: 8px;
  }
`;

const MessageActions = styled.div`
  position: absolute;
  top: -16px;
  right: 16px;
  background: #36393f;
  border: 1px solid #2f3136;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 4px;
  color: #b9bbbe;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #4f545c;
    color: #dcddde;
  }
`;

const MessageReactions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const Reaction = styled.button`
  background: ${props => props.active ? '#5865f2' : 'rgba(79, 84, 92, 0.16)'};
  border: 1px solid ${props => props.active ? '#5865f2' : 'rgba(79, 84, 92, 0.3)'};
  border-radius: 8px;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  span {
    font-size: 14px;
  }
  
  .count {
    color: ${props => props.active ? '#ffffff' : '#b9bbbe'};
    font-size: 12px;
    font-weight: 500;
  }
  
  &:hover {
    background: ${props => props.active ? '#4752c4' : 'rgba(79, 84, 92, 0.24)'};
  }
`;

const MessageInput = styled.div`
  padding: 24px;
  background: #36393f;
`;

const InputContainer = styled.div`
  background: #40444b;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease;
  
  &:focus-within {
    border-color: #5865f2;
  }
`;

const TextInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  color: #dcddde;
  font-size: 16px;
  outline: none;
  
  &::placeholder {
    color: #72767d;
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: 8px;
`;

const InputButton = styled.button`
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    color: #dcddde;
    background: #4f545c;
  }
`;

const SendButton = styled.button`
  background: #5865f2;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #4752c4;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EditInput = styled.input`
  background: #40444b;
  border: 1px solid #5865f2;
  border-radius: 4px;
  padding: 8px;
  color: #dcddde;
  font-size: 16px;
  width: 100%;
  outline: none;
`;

const TypingIndicator = styled.div`
  padding: 8px 24px;
  color: #72767d;
  font-size: 14px;
  font-style: italic;
  min-height: 28px;
`;

const EmojiPicker = styled.div`
  position: absolute;
  bottom: 100%;
  right: 60px;
  background: #36393f;
  border: 1px solid #4f545c;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
`;

const EmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #4f545c;
  }
`;

const FilePreview = styled.div`
  background: #2f3136;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dcddde;
  font-size: 14px;
`;

const ChannelView = () => {
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { channelId } = useParams();
  
  const { user } = useSelector((state) => state.auth);
  const messagesState = useSelector((state) => state.messages || {});
  const { activeChannel } = useSelector((state) => state.channels || { activeChannel: null });

  // Get messages for the current channel
  const messages = messagesState.messages?.[channelId] || [];
  const loading = messagesState.loading || false;
  
  // Ensure messages is always an array
  const messageList = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    if (channelId) {
      dispatch(fetchMessages({ channelId }));
    }
  }, [channelId, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.channel === channelId) {
        dispatch(addMessageToChannel({ channelId, message }));
      }
    };

    const handleTyping = ({ userId, username, channelId: typingChannelId }) => {
      if (typingChannelId === channelId && userId !== user._id) {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === userId)) {
            return [...prev, { userId, username }];
          }
          return prev;
        });
        
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== userId));
        }, 3000);
      }
    };

    if (channelId) {
      // Join the channel room for real-time updates
      socketService.emit('join_channel', channelId);
      socketService.on('new_message', handleNewMessage);
      socketService.on('user_typing', handleTyping);
      
      // Also join the server room for proper routing
      if (activeChannel?.server) {
        socketService.emit('join_server', activeChannel.server);
      }
    }

    return () => {
      if (channelId) {
        // Leave the channel room
        socketService.emit('leave_channel', channelId);
        socketService.off('new_message', handleNewMessage);
        socketService.off('user_typing', handleTyping);
      }
    };
  }, [channelId, user._id, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Check if we have either text or file
    if ((!newMessage.trim() && !selectedFile) || !channelId) return;

    try {
      if (selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('channelId', channelId);
        if (newMessage.trim()) {
          formData.append('content', newMessage.trim());
        }

        await dispatch(sendMessageWithFile({ formData })).unwrap();
        setSelectedFile(null);
      } else {
        // Handle text message
        await dispatch(sendMessage({
          channelId,
          content: newMessage.trim()
        })).unwrap();
      }
      
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editingText.trim()) return;

    try {
      await dispatch(editMessage({
        messageId,
        content: editingText.trim()
      })).unwrap();
      
      setEditingMessageId(null);
      setEditingText('');
    } catch (error) {
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await dispatch(deleteMessage(messageId)).unwrap();
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  const handleReaction = async (messageId, emoji) => {
    const message = messages.find(m => m._id === messageId);
    const existingReaction = message?.reactions?.find(r => 
      r.emoji === emoji && r.users.includes(user._id)
    );

    try {
      if (existingReaction) {
        await dispatch(removeReaction({ messageId, emoji })).unwrap();
      } else {
        await dispatch(addReaction({ messageId, emoji })).unwrap();
      }
    } catch (error) {
      toast.error('Failed to update reaction');
    }
  };

  const handleTyping = () => {
    socketService.emit('typing_start', {
      channelId,
      serverId: activeChannel?.server, // Add server ID for proper routing
      userId: user._id,
      username: user.username
    });
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleGifClick = () => {
    toast.info('GIF picker coming soon!');
  };

  // Common emojis for the picker
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💯'
  ];

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getUserInitials = (username) => {
    return username ? username[0].toUpperCase() : 'U';
  };

  const getRandomColor = (username) => {
    const colors = ['#5865f2', '#3ba55c', '#faa61a', '#ed4245', '#eb459e', '#00d9ff'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleUserClick = (messageAuthor, serverId) => {
    console.log('Clicked user:', messageAuthor);
    console.log('Type of messageAuthor:', typeof messageAuthor);
    console.log('Has _id?', messageAuthor?._id);
    
    // Defensive check for user object structure
    if (!messageAuthor) {
      console.error('No user object provided');
      toast.error('User information not available');
      return;
    }
    
    // Check if it's already a proper user object with _id
    if (messageAuthor && typeof messageAuthor === 'object' && messageAuthor._id) {
      console.log('Opening profile modal for user ID:', messageAuthor._id);
      dispatch(openUserProfileModal({ 
        user: messageAuthor, 
        serverId: serverId 
      }));
    }
    // If it's just a username string, we can't open a profile
    else if (typeof messageAuthor === 'string') {
      console.error('User is just a string:', messageAuthor);
      toast.error('User profile not available - username only');
    }
    // If it's an object but missing _id
    else {
      console.error('User object missing _id:', messageAuthor);
      toast.error('User profile not available - incomplete data');
    }
  };

  if (loading) {
    return (
      <ChannelContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#b9bbbe' 
        }}>
          Loading messages...
        </div>
      </ChannelContainer>
    );
  }

  return (
    <ChannelContainer>
      <MessagesContainer>
        {messageList.map((message) => (
          <MessageGroup key={message._id}>
            <MessageAvatar bgColor={getRandomColor(message.author.username)}>
              {getUserInitials(message.author.username)}
            </MessageAvatar>
            
            <MessageContent>
              <MessageHeader>
                <MessageAuthor 
                  onClick={() => handleUserClick(message.author, activeChannel?.server)}
                >
                  {message.author.username}
                </MessageAuthor>
                <MessageTimestamp>
                  {formatTimestamp(message.createdAt)}
                  {message.edited && ' (edited)'}
                </MessageTimestamp>
              </MessageHeader>
              
              {editingMessageId === message._id ? (
                <EditInput
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditMessage(message._id);
                    } else if (e.key === 'Escape') {
                      setEditingMessageId(null);
                      setEditingText('');
                    }
                  }}
                  onBlur={() => {
                    setEditingMessageId(null);
                    setEditingText('');
                  }}
                  autoFocus
                />
              ) : (
                <MessageText>{message.content}</MessageText>
              )}
              
              {/* Render file attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {message.attachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '8px', 
                        background: '#2f3136', 
                        borderRadius: '4px', 
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaFileUpload style={{ color: '#b9bbbe' }} />
                      <a 
                        href={`http://localhost:5000${attachment.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#00aff4', 
                          textDecoration: 'none',
                          flex: 1
                        }}
                      >
                        {attachment.filename}
                      </a>
                      <span style={{ color: '#72767d', fontSize: '12px' }}>
                        {(attachment.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {message.reactions && message.reactions.length > 0 && (
                <MessageReactions>
                  {message.reactions.map((reaction, index) => (
                    <Reaction
                      key={index}
                      active={reaction.users.includes(user._id)}
                      onClick={() => handleReaction(message._id, reaction.emoji)}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="count">{reaction.count}</span>
                    </Reaction>
                  ))}
                </MessageReactions>
              )}
            </MessageContent>
            
            {message.author._id === user._id && (
              <MessageActions className="message-actions">
                <ActionButton
                  onClick={() => handleReaction(message._id, '👍')}
                  title="Add reaction"
                >
                  <BsEmojiLaughing />
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    setEditingMessageId(message._id);
                    setEditingText(message.content);
                  }}
                  title="Edit message"
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  onClick={() => handleDeleteMessage(message._id)}
                  title="Delete message"
                >
                  <FaTrash />
                </ActionButton>
              </MessageActions>
            )}
          </MessageGroup>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <TypingIndicator>
        {typingUsers.length > 0 && (
          `${typingUsers.map(u => u.username).join(', ')} ${
            typingUsers.length === 1 ? 'is' : 'are'
          } typing...`
        )}
      </TypingIndicator>
      
      <MessageInput>
        <form onSubmit={handleSendMessage}>
          {selectedFile && (
            <FilePreview>
              <FaFileUpload />
              <span>{selectedFile.name}</span>
              <button 
                type="button" 
                onClick={() => setSelectedFile(null)}
                style={{ 
                  marginLeft: 'auto', 
                  background: 'none', 
                  border: 'none', 
                  color: '#ed4245', 
                  cursor: 'pointer' 
                }}
              >
                ✕
              </button>
            </FilePreview>
          )}
          <InputContainer>
            <TextInput
              type="text"
              placeholder={`Message #${activeChannel?.name || 'channel'}`}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
            />
            
            <InputActions>
              <InputButton type="button" title="Upload file" onClick={handleFileUpload}>
                <FaFileUpload />
              </InputButton>
              <InputButton type="button" title="Add GIF" onClick={handleGifClick}>
                <MdGif />
              </InputButton>
              <InputButton 
                type="button" 
                title="Add emoji" 
                onClick={handleEmojiClick}
                style={{ backgroundColor: showEmojiPicker ? '#5865f2' : 'transparent' }}
              >
                <FaSmile />
              </InputButton>
              
              <SendButton 
                type="submit" 
                disabled={!newMessage.trim() && !selectedFile}
                title="Send message"
              >
                <FaPaperPlane />
              </SendButton>
            </InputActions>
          </InputContainer>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
          />
          
          {/* Simple Emoji Picker */}
          {showEmojiPicker && (
            <EmojiPicker>
              <EmojiGrid>
                {commonEmojis.map(emoji => (
                  <EmojiButton key={emoji} onClick={() => insertEmoji(emoji)}>
                    {emoji}
                  </EmojiButton>
                ))}
              </EmojiGrid>
            </EmojiPicker>
          )}
        </form>
      </MessageInput>
    </ChannelContainer>
  );
};

export default ChannelView;