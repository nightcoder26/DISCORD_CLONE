import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaTimes, FaHashtag, FaVolumeUp, FaLock, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { closeModal } from '../../store/slices/uiSlice';
import { createChannel } from '../../store/slices/channelSlice';

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
  width: 460px;
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

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #b9bbbe;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: #40444b;
  border: 1px solid #2f3136;
  border-radius: 4px;
  color: #ffffff;
  font-size: 16px;
  
  &::placeholder {
    color: #72767d;
  }
  
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const ChannelTypeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChannelTypeOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.selected ? '#5865f2' : 'transparent'};
  
  &:hover {
    background: ${props => props.selected ? '#5865f2' : '#42464d'};
  }
`;

const RadioButton = styled.input`
  margin: 0;
`;

const ChannelTypeInfo = styled.div`
  flex: 1;
`;

const ChannelTypeName = styled.div`
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 2px;
`;

const ChannelTypeDesc = styled.div`
  color: #b9bbbe;
  font-size: 12px;
`;

const PermissionsSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #2f3136;
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
`;

const PermissionLabel = styled.div`
  color: #ffffff;
  font-size: 14px;
`;

const Toggle = styled.input`
  position: relative;
  appearance: none;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background: #72767d;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:checked {
    background: #3ba55c;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    transition: transform 0.2s;
  }
  
  &:checked::before {
    transform: translateX(20px);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #2f3136;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.variant === 'primary' ? `
    background: #5865f2;
    color: #ffffff;
    
    &:hover:not(:disabled) {
      background: #4752c4;
    }
    
    &:disabled {
      background: #4f545c;
      color: #72767d;
      cursor: not-allowed;
    }
  ` : `
    background: transparent;
    color: #ffffff;
    
    &:hover {
      text-decoration: underline;
    }
  `}
`;

const CreateChannelModal = ({ isOpen, onClose }) => {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('text');
  const [isPrivate, setIsPrivate] = useState(false);
  const [permissions, setPermissions] = useState({
    viewChannel: true,
    sendMessages: true,
    readHistory: true,
    useSlashCommands: true,
    embedLinks: true,
    attachFiles: true,
    addReactions: true,
    useExternalEmojis: true
  });

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.channels);
  const { currentServer } = useSelector((state) => state.servers);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelName.trim()) {
      toast.error('Please enter a channel name');
      return;
    }

    if (!currentServer) {
      toast.error('Please select a server first');
      return;
    }

    try {
      const channelData = {
        name: channelName.toLowerCase().replace(/\s+/g, '-'),
        type: channelType,
        serverId: currentServer,
        isPrivate,
        permissions: Object.entries(permissions)
          .filter(([key, value]) => value)
          .map(([key]) => key)
      };

      await dispatch(createChannel(channelData)).unwrap();
      toast.success(`${channelType === 'text' ? 'Text' : 'Voice'} channel created!`);
      dispatch(closeModal());
      setChannelName('');
      setChannelType('text');
      setIsPrivate(false);
    } catch (error) {
      toast.error(error || 'Failed to create channel');
    }
  };

  const handlePermissionToggle = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Create Channel</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Channel Type</Label>
              <ChannelTypeContainer>
                <ChannelTypeOption 
                  selected={channelType === 'text'}
                  onClick={() => setChannelType('text')}
                >
                  <RadioButton 
                    type="radio" 
                    name="channelType" 
                    value="text"
                    checked={channelType === 'text'}
                    onChange={() => setChannelType('text')}
                  />
                  <FaHashtag style={{ color: '#b9bbbe' }} />
                  <ChannelTypeInfo>
                    <ChannelTypeName>Text</ChannelTypeName>
                    <ChannelTypeDesc>Send messages, images, GIFs, emojis, opinions, and puns</ChannelTypeDesc>
                  </ChannelTypeInfo>
                </ChannelTypeOption>
                
                <ChannelTypeOption 
                  selected={channelType === 'voice'}
                  onClick={() => setChannelType('voice')}
                >
                  <RadioButton 
                    type="radio" 
                    name="channelType" 
                    value="voice"
                    checked={channelType === 'voice'}
                    onChange={() => setChannelType('voice')}
                  />
                  <FaVolumeUp style={{ color: '#b9bbbe' }} />
                  <ChannelTypeInfo>
                    <ChannelTypeName>Voice</ChannelTypeName>
                    <ChannelTypeDesc>Hang out together with voice, video, and screen share</ChannelTypeDesc>
                  </ChannelTypeInfo>
                </ChannelTypeOption>
              </ChannelTypeContainer>
            </FormGroup>

            <FormGroup>
              <Label>Channel Name</Label>
              <Input
                type="text"
                placeholder={channelType === 'text' ? '# new-channel' : '🔊 General'}
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <PermissionItem>
                <div>
                  <PermissionLabel>
                    {isPrivate ? <FaLock /> : <FaGlobe />}
                    {' '}Private Channel
                  </PermissionLabel>
                  <div style={{ color: '#b9bbbe', fontSize: '12px', marginTop: '4px' }}>
                    {isPrivate 
                      ? 'Only selected members and roles will be able to view this channel'
                      : 'Everyone can see this channel'
                    }
                  </div>
                </div>
                <Toggle
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
              </PermissionItem>
            </FormGroup>

            {channelType === 'text' && (
              <PermissionsSection>
                <Label>Text Permissions</Label>
                {[
                  ['viewChannel', 'View Channel'],
                  ['sendMessages', 'Send Messages'],
                  ['readHistory', 'Read Message History'],
                  ['useSlashCommands', 'Use Slash Commands'],
                  ['embedLinks', 'Embed Links'],
                  ['attachFiles', 'Attach Files'],
                  ['addReactions', 'Add Reactions'],
                  ['useExternalEmojis', 'Use External Emojis']
                ].map(([key, label]) => (
                  <PermissionItem key={key}>
                    <PermissionLabel>{label}</PermissionLabel>
                    <Toggle
                      type="checkbox"
                      checked={permissions[key]}
                      onChange={() => handlePermissionToggle(key)}
                    />
                  </PermissionItem>
                ))}
              </PermissionsSection>
            )}

            <ButtonContainer>
              <Button type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading || !channelName.trim()}
              >
                {loading ? 'Creating...' : 'Create Channel'}
              </Button>
            </ButtonContainer>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateChannelModal;