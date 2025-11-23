import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaTimes, FaLink, FaCopy, FaCog } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { closeModal } from '../../store/slices/uiSlice';
import api from '../../services/api';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: #36393f;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const ModalHeader = styled.div`
  padding: 20px 24px 0;
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
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    color: #ffffff;
    background: #4f545c;
  }
`;

const ModalContent = styled.div`
  padding: 20px 24px 24px;
`;

const InviteSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const InviteLink = styled.div`
  background: #2f3136;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #5865f2;
  }
`;

const InviteCode = styled.span`
  flex: 1;
  color: #dcddde;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: #1e2124;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #4f545c;
`;

const CopyButton = styled.button`
  background: #5865f2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #4752c4;
  }
`;

const SettingsButton = styled.button`
  background: #4f545c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #5c6269;
  }
`;

const CreateButton = styled.button`
  background: #5865f2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  margin-top: 16px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #4752c4;
  }
  
  &:disabled {
    background: #4f545c;
    cursor: not-allowed;
  }
`;

const SettingsSection = styled.div`
  background: #2f3136;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  color: #dcddde;
  font-size: 14px;
  font-weight: 500;
`;

const Select = styled.select`
  background: #40444b;
  color: #dcddde;
  border: 1px solid #72767d;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const Checkbox = styled.input`
  margin-left: 8px;
`;

const InfoText = styled.p`
  color: #72767d;
  font-size: 12px;
  margin: 8px 0 0 0;
  line-height: 1.4;
`;

const InviteModal = ({ isOpen }) => {
  const dispatch = useDispatch();
  const { currentServer } = useSelector((state) => state.servers);
  
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    maxAge: 86400, // 24 hours
    maxUses: 0, // unlimited
    temporary: false
  });

  // Don't render if not open
  if (!isOpen) return null;

  const handleCreateInvite = async () => {
    if (!currentServer) return;
    
    setLoading(true);
    try {
      const response = await api.post('/invites', {
        serverId: currentServer,
        ...settings
      });
      
      setInviteCode(response.data.invite.code);
      toast.success('Invite created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Invite link copied to clipboard!');
    }
  };

  const getExpirationText = (seconds) => {
    if (seconds === 0) return 'Never';
    if (seconds === 1800) return '30 minutes';
    if (seconds === 3600) return '1 hour';
    if (seconds === 21600) return '6 hours';
    if (seconds === 43200) return '12 hours';
    if (seconds === 86400) return '1 day';
    if (seconds === 604800) return '7 days';
    return `${seconds} seconds`;
  };

  const getUsesText = (uses) => {
    if (uses === 0) return 'No limit';
    return `${uses} use${uses === 1 ? '' : 's'}`;
  };

  return (
    <ModalOverlay onClick={() => dispatch(closeModal())}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaLink style={{ marginRight: '8px' }} />
            Invite Friends
          </ModalTitle>
          <CloseButton onClick={() => dispatch(closeModal())}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalContent>
          {inviteCode ? (
            <InviteSection>
              <SectionTitle>Your invite link</SectionTitle>
              <InviteLink>
                <InviteCode>
                  {window.location.origin}/invite/{inviteCode}
                </InviteCode>
                <CopyButton onClick={handleCopyInvite}>
                  <FaCopy />
                  Copy
                </CopyButton>
                <SettingsButton onClick={() => setShowSettings(!showSettings)}>
                  <FaCog />
                  Settings
                </SettingsButton>
              </InviteLink>
              <InfoText>
                This link expires {getExpirationText(settings.maxAge)} and can be used {getUsesText(settings.maxUses)}.
              </InfoText>
            </InviteSection>
          ) : (
            <InviteSection>
              <SectionTitle>Send a server invite link to a friend</SectionTitle>
              <InfoText>
                Your friends will be able to join your server using this link.
              </InfoText>
            </InviteSection>
          )}

          {(showSettings || !inviteCode) && (
            <SettingsSection>
              <SectionTitle>Invite Settings</SectionTitle>
              
              <SettingRow>
                <SettingLabel>Expire after</SettingLabel>
                <Select 
                  value={settings.maxAge}
                  onChange={(e) => setSettings({...settings, maxAge: parseInt(e.target.value)})}
                >
                  <option value={1800}>30 minutes</option>
                  <option value={3600}>1 hour</option>
                  <option value={21600}>6 hours</option>
                  <option value={43200}>12 hours</option>
                  <option value={86400}>1 day</option>
                  <option value={604800}>7 days</option>
                  <option value={0}>Never</option>
                </Select>
              </SettingRow>
              
              <SettingRow>
                <SettingLabel>Max number of uses</SettingLabel>
                <Select 
                  value={settings.maxUses}
                  onChange={(e) => setSettings({...settings, maxUses: parseInt(e.target.value)})}
                >
                  <option value={0}>No limit</option>
                  <option value={1}>1 use</option>
                  <option value={5}>5 uses</option>
                  <option value={10}>10 uses</option>
                  <option value={25}>25 uses</option>
                  <option value={50}>50 uses</option>
                  <option value={100}>100 uses</option>
                </Select>
              </SettingRow>
              
              <SettingRow>
                <SettingLabel>Temporary membership</SettingLabel>
                <Checkbox 
                  type="checkbox"
                  checked={settings.temporary}
                  onChange={(e) => setSettings({...settings, temporary: e.target.checked})}
                />
              </SettingRow>
              
              <InfoText>
                Temporary members are kicked from the server when they go offline, unless they've been assigned a role.
              </InfoText>
            </SettingsSection>
          )}

          {!inviteCode && (
            <CreateButton 
              onClick={handleCreateInvite} 
              disabled={loading || !currentServer}
            >
              {loading ? 'Creating...' : 'Generate a New Link'}
            </CreateButton>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default InviteModal;