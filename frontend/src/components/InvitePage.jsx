import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaUsers, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { fetchUserServers } from '../store/slices/serverSlice';

const InviteContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const InviteCard = styled.div`
  background: #36393f;
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const ServerIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.bgColor || '#5865f2'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
  font-weight: bold;
  color: white;
`;

const ServerName = styled.h1`
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const InviteInfo = styled.p`
  color: #b9bbbe;
  font-size: 16px;
  margin: 0 0 24px 0;
`;

const MemberCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #72767d;
  font-size: 14px;
  margin-bottom: 32px;
`;

const JoinButton = styled.button`
  background: #5865f2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #4752c4;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #4f545c;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const LoginPrompt = styled.div`
  background: #2f3136;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const LoginButton = styled.button`
  background: #3ba55c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #2d7d32;
  }
`;

const ErrorMessage = styled.div`
  background: #ed4245;
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #3ba55c;
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #b9bbbe;
  font-size: 16px;
`;

const SpinningIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const InvitePage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch invite details
  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/invites/${code}`);
        setInvite(response.data);
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Invalid or expired invite');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchInvite();
    }
  }, [code]);

  const handleJoinServer = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    try {
      setJoining(true);
      setError('');
      
      const response = await api.post(`/invites/${code}/join`);
      
      setSuccess('Successfully joined the server!');
      toast.success('Welcome to the server!');
      
      // Refresh user servers
      dispatch(fetchUserServers());
      
      // Redirect to the server after 2 seconds
      setTimeout(() => {
        navigate(`/server/${response.data.server._id}`);
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to join server';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  const handleLogin = () => {
    navigate('/login', { state: { returnTo: `/invite/${code}` } });
  };

  if (loading) {
    return (
      <InviteContainer>
        <InviteCard>
          <LoadingSpinner>
            <SpinningIcon />
            Loading invite...
          </LoadingSpinner>
        </InviteCard>
      </InviteContainer>
    );
  }

  if (error && !invite) {
    return (
      <InviteContainer>
        <InviteCard>
          <ErrorMessage>
            <FaTimes style={{ marginRight: '8px' }} />
            {error}
          </ErrorMessage>
          <JoinButton onClick={() => navigate('/')}>
            Go to Discord Clone
          </JoinButton>
        </InviteCard>
      </InviteContainer>
    );
  }

  const getServerInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = () => {
    const colors = ['#5865f2', '#3ba55c', '#faa61a', '#ed4245', '#eb459e', '#00d9ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <InviteContainer>
      <InviteCard>
        {success && (
          <SuccessMessage>
            <FaCheck style={{ marginRight: '8px' }} />
            {success}
          </SuccessMessage>
        )}
        
        {error && (
          <ErrorMessage>
            <FaTimes style={{ marginRight: '8px' }} />
            {error}
          </ErrorMessage>
        )}

        {invite && (
          <>
            <ServerIcon bgColor={getRandomColor()}>
              {invite.server.icon ? (
                <img 
                  src={invite.server.icon} 
                  alt={invite.server.name} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              ) : (
                getServerInitials(invite.server.name)
              )}
            </ServerIcon>

            <ServerName>{invite.server.name}</ServerName>
            
            <InviteInfo>
              You've been invited to join this server by{' '}
              <strong>{invite.inviter.username}#{invite.inviter.discriminator}</strong>
            </InviteInfo>

            <MemberCount>
              <FaUsers />
              {invite.memberCount || 0} members
            </MemberCount>

            {!user ? (
              <LoginPrompt>
                <p style={{ color: '#dcddde', margin: '0 0 16px 0' }}>
                  You need to login to join this server
                </p>
                <LoginButton onClick={handleLogin}>
                  Login to Discord Clone
                </LoginButton>
              </LoginPrompt>
            ) : (
              <JoinButton 
                onClick={handleJoinServer} 
                disabled={joining}
              >
                {joining ? (
                  <>
                    <SpinningIcon />
                    Joining...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Join Server
                  </>
                )}
              </JoinButton>
            )}
          </>
        )}
      </InviteCard>
    </InviteContainer>
  );
};

export default InvitePage;