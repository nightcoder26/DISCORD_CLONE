import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTimes, FaSearch, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { closeModal } from '../../store/slices/uiSlice';
import { searchUsers } from '../../store/slices/userSlice';
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
  width: 440px;
  max-height: 720px;
  overflow: hidden;
  animation: modalSlideIn 0.15s ease-out;

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

const ModalHeader = styled.div`
  padding: 16px;
  background: #36393f;
  border-bottom: 1px solid #2f3136;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #4f545c;
    color: #ffffff;
  }
`;

const ModalBody = styled.div`
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  background: #40444b;
  border: 1px solid #2f3136;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  
  &::placeholder {
    color: #72767d;
  }
  
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #72767d;
  font-size: 14px;
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #42464d;
  }
`;

const UserAvatar = styled.div`
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
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Username = styled.div`
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
`;

const UserStatus = styled.div`
  color: #b9bbbe;
  font-size: 12px;
`;

const NoResults = styled.div`
  text-align: center;
  color: #72767d;
  padding: 32px;
  font-size: 14px;
`;

const StartDMModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, loading } = useSelector((state) => state.users);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        dispatch(searchUsers(searchQuery));
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, dispatch]);

  const handleUserClick = async (userId) => {
    try {
      const conversation = await dispatch(createConversation([userId])).unwrap();
      navigate(`/dm/${conversation._id}`);
      dispatch(closeModal());
      toast.success('DM conversation started!');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const getRandomColor = () => {
    const colors = ['#5865f2', '#3ba55c', '#faa61a', '#ed4245', '#9c59b6', '#e91e63'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getUserInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Start a conversation</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <SearchIcon />
          </SearchContainer>

          <UsersList>
            {loading && (
              <NoResults>Searching...</NoResults>
            )}
            
            {!loading && searchQuery && (!searchResults || searchResults.length === 0) && (
              <NoResults>
                <FaUser style={{ fontSize: '32px', marginBottom: '8px' }} />
                <div>No users found</div>
              </NoResults>
            )}
            
            {!loading && searchResults && searchResults.map((user) => (
              <UserItem key={user._id} onClick={() => handleUserClick(user._id)}>
                <UserAvatar bgColor={getRandomColor()}>
                  {getUserInitials(user.username)}
                </UserAvatar>
                <UserInfo>
                  <Username>{user.username}#{user.discriminator}</Username>
                  <UserStatus>{user.status || 'offline'}</UserStatus>
                </UserInfo>
              </UserItem>
            ))}
          </UsersList>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default StartDMModal;