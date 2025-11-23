import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaSignOutAlt, FaCog, FaMicrophone, FaMicrophoneSlash, FaHeadphones, FaVolumeUp, FaUserPlus } from 'react-icons/fa';
import { BsFillPersonFill } from 'react-icons/bs';

import { logoutUser } from '../../store/slices/authSlice';
import { fetchUserServers, setCurrentServer } from '../../store/slices/serverSlice';
import { setConnected } from '../../store/slices/socketSlice';
import { setCurrentView, openModal } from '../../store/slices/uiSlice';
import { fetchConversations } from '../../store/slices/dmSlice';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #36393f;
  overflow: hidden;
`;

const ServerList = styled.div`
  width: 72px;
  background: #202225;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 0;
  }
`;

const ServerIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.active ? '16px' : '24px'};
  background: ${props => props.bgColor || '#36393f'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: #dcddde;
  font-weight: 600;
  font-size: 18px;
  
  &:hover {
    border-radius: 16px;
    background: ${props => props.hoverColor || '#5865f2'};
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -16px;
    width: 4px;
    height: ${props => props.active ? '40px' : '20px'};
    background: #ffffff;
    border-radius: 0 2px 2px 0;
    opacity: ${props => props.active ? '1' : '0'};
    transition: all 0.2s ease;
  }
  
  &:hover::before {
    opacity: 1;
    height: 20px;
  }
`;

const DMButton = styled(ServerIcon)`
  background: #5865f2;
  margin-bottom: 8px;
  
  &:hover {
    background: #4752c4;
  }
`;

const AddServerButton = styled(ServerIcon)`
  background: #36393f;
  border: 2px dashed #4f545c;
  
  &:hover {
    background: #3ba55c;
    border: 2px dashed #3ba55c;
    color: #ffffff;
  }
`;

const Separator = styled.div`
  width: 32px;
  height: 2px;
  background: #4f545c;
  border-radius: 1px;
`;

const Sidebar = styled.div`
  width: 240px;
  background: #2f3136;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #27292d;
  border-bottom: 1px solid #1e2124;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    background: #2c2e33;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2f3136;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #202225;
    border-radius: 2px;
  }
`;

const ChannelCategory = styled.div`
  padding: 16px 8px 0 16px;
  color: #8e9297;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  
  &:hover {
    color: #dcddde;
  }
`;

const ChannelList = styled.div`
  padding: 8px 0;
`;

const ChannelItem = styled.div`
  padding: 8px 16px;
  color: #8e9297;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  margin: 1px 8px;
  
  &:hover {
    background: #3c3f44;
    color: #dcddde;
  }
  
  &.active {
    background: #5865f2;
    color: #ffffff;
  }
  
  &::before {
    content: '#';
    font-weight: 300;
    color: #8e9297;
  }
  
  &.voice::before {
    content: '🔊';
  }
  
  &.active::before {
    color: #ffffff;
  }
`;

const DMList = styled.div`
  padding: 8px 0;
`;

const DMItem = styled.div`
  padding: 8px 16px;
  color: #8e9297;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 4px;
  margin: 1px 8px;
  
  &:hover {
    background: #3c3f44;
    color: #dcddde;
  }
  
  &.active {
    background: #5865f2;
    color: #ffffff;
  }
`;

const UserAvatar = styled.div`
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
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => 
      props.status === 'online' ? '#3ba55c' : 
      props.status === 'idle' ? '#faa61a' : 
      props.status === 'dnd' ? '#ed4245' : '#747f8d'
    };
    border: 2px solid #2f3136;
  }
`;

const UserPanel = styled.div`
  height: 52px;
  background: #292b2f;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserStatus = styled.div`
  color: #b9bbbe;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VoiceControls = styled.div`
  display: flex;
  gap: 4px;
`;

const VoiceButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: none;
  color: #b9bbbe;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #3c3f44;
    color: #dcddde;
  }
  
  &.active {
    color: #3ba55c;
  }
  
  &.muted {
    color: #ed4245;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #36393f;
`;

const ContentHeader = styled.div`
  height: 48px;
  background: #36393f;
  border-bottom: 1px solid #2f3136;
  padding: 0 16px;
  display: flex;
  align-items: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 1px 0 rgba(4,4,5,0.2), 0 1.5px 0 rgba(6,6,7,0.05), 0 2px 0 rgba(4,4,5,0.05);
`;

const ContentBody = styled.div`
  flex: 1;
  overflow: hidden;
`;

const MainLayout = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { servers, currentServer } = useSelector((state) => state.servers);
  const { currentView } = useSelector((state) => state.ui);
  const { connected } = useSelector((state) => state.socket);
  const { conversations } = useSelector((state) => state.dm);

  useEffect(() => {
    if (user) {
      dispatch(setConnected(true));
      dispatch(fetchUserServers());
      dispatch(fetchConversations()); // Fetch DM conversations
    }
    
    return () => {
      dispatch(setConnected(false));
    };
  }, [user, dispatch]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (user) {
      // Import socketService
      import('../../services/socketService').then(({ default: socketService }) => {
        
        // Listen for new channels
        socketService.on('channelCreated', (channelData) => {
          console.log('New channel created:', channelData);
          // Refresh servers to get updated channel list
          dispatch(fetchUserServers());
        });

        // Listen for channel updates
        socketService.on('channelUpdated', (channelData) => {
          console.log('Channel updated:', channelData);
          dispatch(fetchUserServers());
        });

        // Listen for channel deletion
        socketService.on('channelDeleted', (channelData) => {
          console.log('Channel deleted:', channelData);
          dispatch(fetchUserServers());
        });

        // Clean up listeners
        return () => {
          socketService.off('channelCreated');
          socketService.off('channelUpdated');
          socketService.off('channelDeleted');
        };
      });
    }
  }, [user, dispatch]);

  // Auto-select first server if none selected and we're in server view
  useEffect(() => {
    if (servers.length > 0 && !currentServer && currentView !== 'dm') {
      dispatch(setCurrentServer(servers[0]._id));
      dispatch(setCurrentView('server'));
    }
  }, [servers, currentServer, currentView, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleServerClick = (serverId) => {
    dispatch(setCurrentServer(serverId));
    dispatch(setCurrentView('server'));
    navigate(`/server/${serverId}`);
  };

  const handleDMClick = () => {
    dispatch(setCurrentView('dm'));
    navigate('/dm');
  };

  const handleCreateServerClick = () => {
    dispatch(openModal('createServer'));
  };

  const handleChannelClick = (channelId) => {
    navigate(`/server/${currentServer}/channel/${channelId}`);
  };

  const getServerInitials = (serverName) => {
    return serverName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserInitials = (username) => {
    return username ? username[0].toUpperCase() : 'U';
  };

  const getRandomColor = () => {
    const colors = ['#5865f2', '#3ba55c', '#faa61a', '#ed4245', '#eb459e', '#00d9ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderSidebarContent = () => {
    if (currentView === 'dm') {
      return (
        <>
          <SidebarHeader onClick={handleDMClick}>
            Direct Messages
            <FaPlus 
              style={{ 
                cursor: 'pointer', 
                fontSize: '16px', 
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: '#4f545c',
                color: '#ffffff'
              }} 
              onClick={(e) => {
                e.stopPropagation();
                dispatch(openModal('startDM'));
              }}
              title="Start a new DM"
            />
          </SidebarHeader>
          <SidebarContent>
            <div style={{ 
              padding: '8px 16px', 
              color: '#72767d', 
              fontSize: '12px',
              marginBottom: '8px'
            }}>
              Click the + button above to start a new DM
            </div>
            <DMList>
              {conversations && conversations.length > 0 ? (
                conversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find(p => p._id !== user._id);
                  return (
                    <DMItem 
                      key={conversation._id}
                      onClick={() => navigate(`/dm/${conversation._id}`)}
                    >
                      <UserAvatar bgColor="#5865f2" status={otherParticipant?.status || 'offline'}>
                        {otherParticipant?.username?.[0]?.toUpperCase() || 'U'}
                      </UserAvatar>
                      <span>{otherParticipant?.username || 'Unknown User'}</span>
                    </DMItem>
                  );
                })
              ) : (
                <div style={{ 
                  padding: '16px', 
                  textAlign: 'center', 
                  color: '#72767d',
                  fontSize: '14px' 
                }}>
                  No conversations yet
                </div>
              )}
            </DMList>
          </SidebarContent>
        </>
      );
    }

    const currentServerData = servers.find(s => s._id === currentServer);
    
    return (
      <>
        <SidebarHeader>
          <span>{currentServer ? currentServerData?.name : 'Select a Server'}</span>
          {currentServer && (
            <FaUserPlus 
              style={{ 
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: '#5865f2',
                color: '#ffffff',
                marginLeft: 'auto'
              }}
              onClick={() => dispatch(openModal('invite'))}
              title="Invite People"
            />
          )}
        </SidebarHeader>
        <SidebarContent>
          {currentServer ? (
            <>
              <ChannelCategory>
                Text Channels
                <FaPlus 
                  size={14} 
                  style={{ 
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '2px',
                    backgroundColor: '#4f545c',
                    color: '#ffffff'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(openModal('createChannel'));
                  }}
                  title="Create Text Channel"
                />
              </ChannelCategory>
              <ChannelList>
                {currentServerData?.channels
                  ?.filter(channel => channel.type === 'text')
                  .map(channel => (
                    <ChannelItem
                      key={channel._id}
                      onClick={() => handleChannelClick(channel._id)}
                    >
                      {channel.name}
                    </ChannelItem>
                  ))}
              </ChannelList>
              
              <ChannelCategory>
                Voice Channels
                <FaPlus 
                  size={14} 
                  style={{ 
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '2px',
                    backgroundColor: '#4f545c',
                    color: '#ffffff'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(openModal('createChannel'));
                  }}
                  title="Create Voice Channel"
                />
              </ChannelCategory>
              <ChannelList>
                {currentServerData?.channels
                  ?.filter(channel => channel.type === 'voice')
                  .map(channel => (
                    <ChannelItem
                      key={channel._id}
                      className="voice"
                      onClick={() => handleChannelClick(channel._id)}
                    >
                      {channel.name}
                    </ChannelItem>
                  ))}
              </ChannelList>
            </>
          ) : (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: '#72767d'
            }}>
              <div style={{ marginBottom: '8px' }}>No server selected</div>
              <div style={{ fontSize: '12px' }}>
                Create a server using the + button on the left, then click on it to see channel creation options
              </div>
            </div>
          )}
        </SidebarContent>
      </>
    );
  };

  return (
    <LayoutContainer>
      <ServerList>
        <DMButton onClick={handleDMClick} active={currentView === 'dm'}>
          <BsFillPersonFill />
        </DMButton>
        
        <Separator />
        
        {servers.map(server => (
          <ServerIcon
            key={server._id}
            active={currentServer === server._id}
            bgColor={getRandomColor()}
            onClick={() => handleServerClick(server._id)}
            title={server.name}
          >
            {getServerInitials(server.name)}
          </ServerIcon>
        ))}
        
        {servers.length === 0 && (
          <div style={{
            color: '#72767d',
            fontSize: '10px',
            textAlign: 'center',
            padding: '8px 4px',
            lineHeight: '12px'
          }}>
            Click + below to create your first server
          </div>
        )}
        
        <AddServerButton onClick={handleCreateServerClick} title="Add a Server">
          <FaPlus />
        </AddServerButton>
      </ServerList>

      <Sidebar>
        {renderSidebarContent()}
        
        <UserPanel>
          <UserInfo>
            <UserAvatar
              bgColor="#5865f2"
              status={connected ? 'online' : 'offline'}
            >
              {getUserInitials(user?.username)}
            </UserAvatar>
            <UserDetails>
              <Username>{user?.username || 'Loading...'}</Username>
              <UserStatus>
                {connected ? 'Online' : 'Connecting...'}
              </UserStatus>
            </UserDetails>
          </UserInfo>
          
          <VoiceControls>
            <VoiceButton
              className={isMuted ? 'muted' : ''}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </VoiceButton>
            
            <VoiceButton
              className={isDeafened ? 'muted' : ''}
              onClick={() => setIsDeafened(!isDeafened)}
              title={isDeafened ? 'Undeafen' : 'Deafen'}
            >
              {isDeafened ? <FaVolumeUp /> : <FaHeadphones />}
            </VoiceButton>
            
            <VoiceButton
              onClick={() => setShowSettings(!showSettings)}
              title="User Settings"
            >
              <FaCog />
            </VoiceButton>
            
            <VoiceButton
              onClick={handleLogout}
              title="Logout"
            >
              <FaSignOutAlt />
            </VoiceButton>
          </VoiceControls>
        </UserPanel>
      </Sidebar>

      <MainContent>
        <ContentHeader>
          {currentView === 'dm' ? (
            '# Direct Messages'
          ) : (
            `# ${servers.find(s => s._id === currentServer)?.name || 'General'}`
          )}
        </ContentHeader>
        <ContentBody>
          <Outlet />
        </ContentBody>
      </MainContent>
    </LayoutContainer>
  );
};

export default MainLayout;