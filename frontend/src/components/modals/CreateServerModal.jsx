import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTimes, FaUpload, FaServer, FaGamepad, FaMusic, FaCode, FaGraduationCap } from 'react-icons/fa';
import { MdWork, MdGroup } from 'react-icons/md';
import toast from 'react-hot-toast';

import { createServer } from '../../store/slices/serverSlice';

const Overlay = styled.div`
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

const Modal = styled.div`
  background: #36393f;
  border-radius: 8px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
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

const ModalHeader = styled.div`
  padding: 24px 24px 0;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    color: #dcddde;
    background: #4f545c;
  }
`;

const ModalTitle = styled.h2`
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const ModalSubtitle = styled.p`
  color: #b9bbbe;
  font-size: 16px;
  margin: 0 0 24px 0;
`;

const ModalContent = styled.div`
  padding: 0 24px 24px;
`;

const TemplateSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
  color: #8e9297;
`;

const TemplateGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TemplateOption = styled.button`
  background: none;
  border: 1px solid #4f545c;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: #5865f2;
    background: rgba(88, 101, 242, 0.1);
  }
  
  &.selected {
    border-color: #5865f2;
    background: rgba(88, 101, 242, 0.2);
  }
`;

const TemplateIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  flex-shrink: 0;
`;

const TemplateInfo = styled.div`
  flex: 1;
`;

const TemplateName = styled.h4`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const TemplateDescription = styled.p`
  color: #b9bbbe;
  font-size: 14px;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  text-align: center;
`;

const ImageUpload = styled.div`
  position: relative;
  margin: 0 auto 16px;
`;

const ImagePreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.hasImage ? 'none' : '#5865f2'};
  border: 4px dashed #4f545c;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #5865f2;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const UploadButton = styled.button`
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #5865f2;
  border: none;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #4752c4;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const InputGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  color: #b9bbbe;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: #40444b;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
  
  &::placeholder {
    color: #72767d;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  background: #40444b;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-size: 16px;
  transition: border-color 0.2s ease;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
  
  &::placeholder {
    color: #72767d;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &.primary {
    background: #5865f2;
    color: #ffffff;
    
    &:hover:not(:disabled) {
      background: #4752c4;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: transparent;
    color: #ffffff;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CreateServerModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: template selection, 2: server details
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [serverName, setServerName] = useState('');
  const [serverDescription, setServerDescription] = useState('');
  const [serverIcon, setServerIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.servers);

  const templates = [
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'Hang out and have fun with your gaming friends',
      icon: <FaGamepad />,
      channels: ['general', 'gaming-chat', 'voice-lobby', 'game-night']
    },
    {
      id: 'school',
      name: 'School Club',
      description: 'Get study groups and classes organized',
      icon: <FaGraduationCap />,
      channels: ['general', 'announcements', 'homework-help', 'study-hall']
    },
    {
      id: 'work',
      name: 'Work',
      description: 'Get a workspace to collaborate with colleagues',
      icon: <MdWork />,
      channels: ['general', 'announcements', 'project-updates', 'random']
    },
    {
      id: 'community',
      name: 'Community',
      description: 'Build a community around shared interests',
      icon: <MdGroup />,
      channels: ['general', 'introductions', 'discussions', 'events']
    },
    {
      id: 'music',
      name: 'Music',
      description: 'Share and discover music with friends',
      icon: <FaMusic />,
      channels: ['general', 'music-share', 'listening-party', 'artists-corner']
    },
    {
      id: 'tech',
      name: 'Tech',
      description: 'Discuss technology, programming, and innovation',
      icon: <FaCode />,
      channels: ['general', 'tech-news', 'coding-help', 'project-showcase']
    }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setServerIcon(file);
      const reader = new FileReader();
      reader.onload = () => setIconPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serverName.trim()) return;

    try {
      const formData = new FormData();
      formData.append('name', serverName.trim());
      formData.append('description', serverDescription.trim());
      formData.append('template', selectedTemplate);
      
      if (serverIcon) {
        formData.append('icon', serverIcon);
      }

      const result = await dispatch(createServer(formData)).unwrap();
      toast.success('Server created successfully!');
      navigate(`/server/${result._id}`);
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to create server');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      // Set default server name based on template
      const template = templates.find(t => t.id === selectedTemplate);
      if (template && !serverName) {
        setServerName(`${template.name} Server`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        
        {step === 1 ? (
          <>
            <ModalHeader>
              <ModalTitle>Create Your Server</ModalTitle>
              <ModalSubtitle>
                Your server is where you and your friends hang out. Make yours and start talking.
              </ModalSubtitle>
            </ModalHeader>
            
            <ModalContent>
              <TemplateSection>
                <SectionTitle>Choose a template</SectionTitle>
                <TemplateGrid>
                  <TemplateOption
                    className={selectedTemplate === 'custom' ? 'selected' : ''}
                    onClick={() => setSelectedTemplate('custom')}
                  >
                    <TemplateIcon>
                      <FaServer />
                    </TemplateIcon>
                    <TemplateInfo>
                      <TemplateName>Create My Own</TemplateName>
                      <TemplateDescription>Start from scratch with your own custom setup</TemplateDescription>
                    </TemplateInfo>
                  </TemplateOption>
                  
                  {templates.map(template => (
                    <TemplateOption
                      key={template.id}
                      className={selectedTemplate === template.id ? 'selected' : ''}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <TemplateIcon>
                        {template.icon}
                      </TemplateIcon>
                      <TemplateInfo>
                        <TemplateName>{template.name}</TemplateName>
                        <TemplateDescription>{template.description}</TemplateDescription>
                      </TemplateInfo>
                    </TemplateOption>
                  ))}
                </TemplateGrid>
              </TemplateSection>
              
              <ButtonGroup>
                <Button className="primary" onClick={handleNext}>
                  Next
                </Button>
              </ButtonGroup>
            </ModalContent>
          </>
        ) : (
          <>
            <ModalHeader>
              <ModalTitle>Customize your server</ModalTitle>
              <ModalSubtitle>
                Give your new server a personality with a name and an icon. You can always change it later.
              </ModalSubtitle>
            </ModalHeader>
            
            <ModalContent>
              <Form onSubmit={handleSubmit}>
                <FormSection>
                  <ImageUpload>
                    <ImagePreview hasImage={iconPreview}>
                      {iconPreview ? (
                        <img src={iconPreview} alt="Server icon" />
                      ) : (
                        <FaUpload color="#dcddde" size={24} />
                      )}
                    </ImagePreview>
                    <UploadButton
                      type="button"
                      onClick={() => document.getElementById('server-icon').click()}
                    >
                      <FaUpload size={12} />
                    </UploadButton>
                    <HiddenInput
                      id="server-icon"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </ImageUpload>
                </FormSection>
                
                <InputGroup>
                  <Label>Server Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter server name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </InputGroup>
                
                <InputGroup>
                  <Label>Server Description (Optional)</Label>
                  <TextArea
                    placeholder="What's your server about?"
                    value={serverDescription}
                    onChange={(e) => setServerDescription(e.target.value)}
                    maxLength={500}
                  />
                </InputGroup>
                
                <ButtonGroup>
                  <Button type="button" className="secondary" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" className="primary" disabled={loading || !serverName.trim()}>
                    {loading ? 'Creating...' : 'Create Server'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </>
        )}
      </Modal>
    </Overlay>
  );
};

export default CreateServerModal;