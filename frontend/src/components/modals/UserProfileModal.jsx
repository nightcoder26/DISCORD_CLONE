import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTimes, FaComment, FaUser, FaUserPlus, FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { closeModal } from '../../store/slices/uiSlice';
import { getUserProfile } from '../../store/slices/userSlice';
import { createConversation } from '../../store/slices/dmSlice';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #36393f;
  border-radius: 8px;
  width: 340px;
  overflow: hidden;
  animation: modalSlideIn 0.15s ease-out;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const ProfileBanner = styled.div`
  height: 120px;
  background: linear-gradient(135deg, #7289da, #5865f2);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const ProfileContent = styled.div`
  padding: 16px;
  background: #2f3136;
  position: relative;
  margin-top: -60px;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.color || '#7289da'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: white;
  border: 6px solid #2f3136;
  margin-right: 12px;
  position: relative;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid #2f3136;
  background: ${props => {
    switch (props.status) {
      case 'online': return '#3ba55c';
      case 'idle': return '#faa61a';
      case 'dnd': return '#ed4245';
      default: return '#747f8d';
    }
  }};
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h3`
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const Discriminator = styled.span`
  color: #b9bbbe;
  font-size: 14px;
  font-weight: 400;
`;

const UserTag = styled.div`
  color: #b9bbbe;
  font-size: 14px;
  margin-bottom: 16px;
`;

const Divider = styled.div`
  height: 1px;
  background: #4f545c;
  margin: 16px 0;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  color: #b9bbbe;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;
`;

const UserStatus = styled.div`
  color: #dcddde;
  font-size: 14px;
  line-height: 1.4;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  flex: 1;
  background: #5865f2;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: #4752c4;
  }

  &.secondary {
    background: #4f545c;
    
    &:hover {
      background: #5d6269;
    }
  }
`;

const MemberInfo = styled.div`
  background: #36393f;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const RoleTag = styled.span`
  background: #5865f2;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 4px;
`;

const UserProfileModal = ({ user, serverId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfiles } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  const userProfile = user ? (userProfiles[user._id] || user) : null;

  useEffect(() => {
    if (isOpen && user && !userProfiles[user._id]) {
      dispatch(getUserProfile(user._id));
    }
  }, [isOpen, user, userProfiles, dispatch]);

  // Early return after all hooks
  if (!isOpen || !user) return null;

  const handleStartDM = async () => {
    try {
      console.log('Starting DM with user:', user);
      console.log('User ID:', user._id);
      // Navigate directly to DM with the user ID as conversationId
      // The backend works with user IDs, so we can use the user ID as the conversation ID
      navigate(`/dm/${user._id}`);
      onClose();
      toast.success('DM conversation started!');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const getInitials = (username) => {
    return username?.slice(0, 2).toUpperCase() || 'U';
  };

  const getRandomColor = (userId) => {
    const colors = ['#7289da', '#43b581', '#faa61a', '#f04747', '#9266cc', '#e67e22'];
    const index = userId ? userId.length % colors.length : 0;
    return colors[index];
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ProfileBanner>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ProfileBanner>
        
        <ProfileContent>
          <AvatarContainer>
            <Avatar color={getRandomColor(user._id)}>
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.username} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
              ) : (
                getInitials(userProfile.username)
              )}
              <StatusIndicator status={userProfile.status} />
            </Avatar>
          </AvatarContainer>

          <Username>
            {userProfile.username}
            <Discriminator>#{userProfile.discriminator || '0001'}</Discriminator>
          </Username>

          {userProfile.customStatus && (
            <UserTag>{userProfile.customStatus}</UserTag>
          )}

          <Divider />

          {serverId && (
            <MemberInfo>
              <SectionTitle>Server Member</SectionTitle>
              {userProfile.roles && userProfile.roles.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  {userProfile.roles.map((role, index) => (
                    <RoleTag key={index}>{role}</RoleTag>
                  ))}
                </div>
              )}
              <UserStatus>
                Joined {formatJoinDate(userProfile.joinedAt || userProfile.createdAt)}
              </UserStatus>
            </MemberInfo>
          )}

          <Section>
            <SectionTitle>About Me</SectionTitle>
            <UserStatus>
              {userProfile.bio || 'This user has not set a bio yet.'}
            </UserStatus>
          </Section>

          {currentUser && currentUser._id !== user._id && (
            <ActionButtons>
              <ActionButton onClick={handleStartDM}>
                <FaComment />
                Message
              </ActionButton>
              <ActionButton className="secondary">
                <FaUserPlus />
                Add Friend
              </ActionButton>
            </ActionButtons>
          )}
        </ProfileContent>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserProfileModal;