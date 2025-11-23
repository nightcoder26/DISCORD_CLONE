import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPaperPlane, FaSmile, FaFileUpload, FaPhone, FaVideo, FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { BsEmojiLaughing, BsThreeDots } from 'react-icons/bs';
import { MdGif } from 'react-icons/md';
import toast from 'react-hot-toast';

import { 
  fetchDMMessages, 
  sendDMMessage,
  editDMMessage,
  deleteDMMessage,
  addDMReaction,
  removeDMReaction 
} from '../../store/slices/dmSlice';
import { openUserProfileModal } from '../../store/slices/uiSlice';
import { getUserProfile } from '../../store/slices/userSlice';
import { socketService } from '../../services/socketService';

const DMContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #36393f;
`;

const DMHeader = styled.div`
  height: 48px;
  background: #36393f;
  border-bottom: 1px solid #2f3136;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 0 rgba(4,4,5,0.2), 0 1.5px 0 rgba(6,6,7,0.05), 0 2px 0 rgba(4,4,5,0.05);
`;

const DMHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DMAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.bgColor || '#5865f2'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => 
      props.status === 'online' ? '#3ba55c' : 
      props.status === 'idle' ? '#faa61a' : 
      props.status === 'dnd' ? '#ed4245' : '#747f8d'
    };
    border: 2px solid #36393f;
  }
`;

const DMUserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const DMUsername = styled.h3`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const DMStatus = styled.span`
  color: #b9bbbe;
  font-size: 12px;
`;

const DMHeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #4f545c;
    color: #dcddde;
  }
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

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 32px;
  margin-bottom: 32px;
`;

const WelcomeAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.bgColor || '#5865f2'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 32px;
  margin: 0 auto 16px;
`;

const WelcomeTitle = styled.h2`
  color: #ffffff;
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const WelcomeSubtitle = styled.p`
  color: #b9bbbe;
  font-size: 16px;
  margin: 0;
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

const DirectMessageView = () => {
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  
  const { user } = useSelector((state) => state.auth);
  const { messages: allMessages, loading, currentConversation } = useSelector((state) => state.dm);
  const { userProfiles } = useSelector((state) => state.users);
  
  // Get messages for the current conversation
  const messages = allMessages[conversationId] || [];

  // Get recipient from current conversation or user profiles
  const [recipient, setRecipient] = useState({
    _id: conversationId || '1',
    username: 'Loading...',
    discriminator: '0001',
    avatar: null,
    status: 'offline'
  });

  useEffect(() => {
    // If we have a conversation with participants, use that
    if (currentConversation) {
      const foundRecipient = currentConversation.participants.find(p => p._id !== user._id);
      if (foundRecipient) {
        setRecipient(foundRecipient);
      }
    }
    // If conversationId is a user ID, fetch that user's info
    else if (conversationId && conversationId !== user._id) {
      // Check if we already have this user's profile
      if (userProfiles[conversationId]) {
        setRecipient({
          _id: conversationId,
          username: userProfiles[conversationId].username,
          discriminator: userProfiles[conversationId].discriminator || '0001',
          avatar: userProfiles[conversationId].avatar,
          status: userProfiles[conversationId].status || 'offline'
        });
      } else {
        // Fetch the user profile if we don't have it
        console.log('Fetching user profile for DM recipient:', conversationId);
        dispatch(getUserProfile(conversationId));
      }
    }
  }, [currentConversation, conversationId, user._id, userProfiles, dispatch]);

  // Update recipient when user profile is loaded
  useEffect(() => {
    if (conversationId && userProfiles[conversationId] && !currentConversation) {
      const userProfile = userProfiles[conversationId];
      setRecipient({
        _id: conversationId,
        username: userProfile.username,
        discriminator: userProfile.discriminator || '0001',
        avatar: userProfile.avatar,
        status: userProfile.status || 'offline'
      });
    }
  }, [userProfiles, conversationId, currentConversation]);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchDMMessages({ conversationId }));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleNewDM = (message) => {
      if (message.conversation === conversationId) {
        dispatch(fetchDMMessages({ conversationId }));
      }
    };

    const handleTyping = ({ userId: typingUserId, username }) => {
      if (typingUserId !== user._id) {
        setTypingUsers([{ userId: typingUserId, username }]);
        
        setTimeout(() => {
          setTypingUsers([]);
        }, 3000);
      }
    };

    socketService.on('newDirectMessage', handleNewDM);
    socketService.on('userTypingDM', handleTyping);

    return () => {
      socketService.off('newDirectMessage', handleNewDM);
      socketService.off('userTypingDM', handleTyping);
    };
  }, [conversationId, user._id, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      // The conversationId is actually the recipient's userId in our system
      await dispatch(sendDMMessage({
        recipientId: conversationId, // conversationId is the recipient's user ID
        content: newMessage.trim()
      })).unwrap();
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send DM:', error);
      toast.error('Failed to send message');
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editingText.trim()) return;

    try {
      await dispatch(editDMMessage({
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
        await dispatch(deleteDMMessage(messageId)).unwrap();
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
        await dispatch(removeDMReaction({ messageId, emoji })).unwrap();
      } else {
        await dispatch(addDMReaction({ messageId, emoji })).unwrap();
      }
    } catch (error) {
      toast.error('Failed to update reaction');
    }
  };

  const handleTyping = () => {
    socketService.emit('typingDM', {
      conversationId: conversationId,
      userId: user._id,
      username: user.username
    });
  };

  const handleVoiceCall = () => {
    toast.info('Voice calls will be available in a future update!');
  };

  const handleVideoCall = () => {
    toast.info('Video calls will be available in a future update!');
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

  const handleUserClick = (messageSender) => {
    console.log('Clicked DM user:', messageSender);
    
    // Defensive check for user object structure
    if (!messageSender) {
      console.error('No user object provided in DM');
      return;
    }
    
    // Check if it's already a proper user object with _id
    if (messageSender._id) {
      dispatch(openUserProfileModal({ 
        user: messageSender, 
        serverId: null // No server for DMs
      }));
    }
    // If it's just a username string, we can't open a profile
    else if (typeof messageSender === 'string') {
      console.error('DM User is just a string:', messageSender);
      toast.error('User profile not available');
    }
    // If it's an object but missing _id
    else {
      console.error('DM User object missing _id:', messageSender);
      toast.error('User profile not available');
    }
  };

  if (!conversationId) {
    return (
      <DMContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#b9bbbe',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h2 style={{ color: '#ffffff' }}>Select a conversation</h2>
          <p>Choose a friend from the list to start messaging</p>
        </div>
      </DMContainer>
    );
  }

  if (loading) {
    return (
      <DMContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#b9bbbe' 
        }}>
          Loading messages...
        </div>
      </DMContainer>
    );
  }

  return (
    <DMContainer>
      <DMHeader>
        <DMHeaderLeft>
          <DMAvatar 
            bgColor={getRandomColor(recipient.username)}
            status={recipient.status}
          >
            {getUserInitials(recipient.username)}
          </DMAvatar>
          <DMUserInfo>
            <DMUsername>{recipient.username}</DMUsername>
            <DMStatus>
              {recipient.status === 'online' ? 'Online' : 
               recipient.status === 'idle' ? 'Away' : 
               recipient.status === 'dnd' ? 'Do Not Disturb' : 'Offline'}
            </DMStatus>
          </DMUserInfo>
        </DMHeaderLeft>
        
        <DMHeaderActions>
          <HeaderButton onClick={handleVoiceCall} title="Start voice call">
            <FaPhone />
          </HeaderButton>
          <HeaderButton onClick={handleVideoCall} title="Start video call">
            <FaVideo />
          </HeaderButton>
          <HeaderButton title="Add friend to group">
            <FaUserPlus />
          </HeaderButton>
          <HeaderButton title="More options">
            <BsThreeDots />
          </HeaderButton>
        </DMHeaderActions>
      </DMHeader>

      <MessagesContainer>
        <WelcomeMessage>
          <WelcomeAvatar bgColor={getRandomColor(recipient.username)}>
            {getUserInitials(recipient.username)}
          </WelcomeAvatar>
          <WelcomeTitle>{recipient.username}</WelcomeTitle>
          <WelcomeSubtitle>
            This is the beginning of your direct message history with {recipient.username}.
          </WelcomeSubtitle>
        </WelcomeMessage>

        {messages.map((message) => (
          <MessageGroup key={message._id}>
            <MessageAvatar bgColor={getRandomColor(message.sender.username)}>
              {getUserInitials(message.sender.username)}
            </MessageAvatar>
            
            <MessageContent>
              <MessageHeader>
                <MessageAuthor 
                  onClick={() => handleUserClick(message.sender)}
                >
                  {message.sender.username}
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
            
            {message.sender._id === user._id && (
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
          `${typingUsers[0].username} is typing...`
        )}
      </TypingIndicator>
      
      <MessageInput>
        <form onSubmit={handleSendMessage}>
          <InputContainer>
            <TextInput
              type="text"
              placeholder={`Message @${recipient.username}`}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
            />
            
            <InputActions>
              <InputButton type="button" title="Upload file">
                <FaFileUpload />
              </InputButton>
              <InputButton type="button" title="Add GIF">
                <MdGif />
              </InputButton>
              <InputButton type="button" title="Add emoji">
                <FaSmile />
              </InputButton>
              
              <SendButton 
                type="submit" 
                disabled={!newMessage.trim()}
                title="Send message"
              >
                <FaPaperPlane />
              </SendButton>
            </InputActions>
          </InputContainer>
        </form>
      </MessageInput>
    </DMContainer>
  );
};

export default DirectMessageView;