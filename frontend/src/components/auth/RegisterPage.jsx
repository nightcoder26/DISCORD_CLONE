import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { FaEye, FaEyeSlash, FaDiscord, FaGoogle } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { registerUser, clearError } from '../../store/slices/authSlice';

const RegisterContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const RegisterCard = styled.div`
  background: #36393f;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  
  svg {
    font-size: 32px;
    color: #5865f2;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #b9bbbe;
  font-size: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
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
  
  &.error {
    border-color: #ed4245;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #dcddde;
  }
`;

const ErrorMessage = styled.span`
  color: #ed4245;
  font-size: 14px;
  margin-top: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #5865f2;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: #4752c4;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled(Button)`
  background: #ffffff;
  color: #000000;
  margin-top: 12px;
  
  &:hover:not(:disabled) {
    background: #f0f0f0;
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: 20px 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #4f545c;
  }
  
  span {
    background: #36393f;
    color: #72767d;
    padding: 0 16px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #b9bbbe;
  font-size: 14px;
  
  a {
    color: #5865f2;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PasswordStrength = styled.div`
  margin-top: 8px;
  font-size: 12px;
  
  .strength-bar {
    height: 4px;
    background: #4f545c;
    border-radius: 2px;
    margin-bottom: 4px;
    overflow: hidden;
    
    .strength-fill {
      height: 100%;
      transition: all 0.3s ease;
      border-radius: 2px;
    }
  }
  
  &.weak .strength-fill {
    width: 33%;
    background: #ed4245;
  }
  
  &.medium .strength-fill {
    width: 66%;
    background: #faa61a;
  }
  
  &.strong .strength-fill {
    width: 100%;
    background: #57f287;
  }
`;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const checkPasswordStrength = (password) => {
    if (!password) return '';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength < 3) return 'weak';
    if (strength < 5) return 'medium';
    return 'strong';
  };

  React.useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(registerUser(data)).unwrap();
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  React.useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  return (
    <RegisterContainer>
      <RegisterCard className="fade-in">
        <Header>
          <Logo>
            <FaDiscord />
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#dcddde' }}>
              Discord Clone
            </span>
          </Logo>
          <Title>Create an account</Title>
          <Subtitle>Join millions of users on our platform!</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Enter your username"
              className={errors.username ? 'error' : ''}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                },
                maxLength: {
                  value: 30,
                  message: 'Username must be less than 30 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
            />
            {errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <div style={{ position: 'relative' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                  }
                })}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </div>
            {password && (
              <PasswordStrength className={passwordStrength}>
                <div className="strength-bar">
                  <div className="strength-fill"></div>
                </div>
                <span style={{ color: passwordStrength === 'weak' ? '#ed4245' : passwordStrength === 'medium' ? '#faa61a' : '#57f287' }}>
                  Password strength: {passwordStrength}
                </span>
              </PasswordStrength>
            )}
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Create Account'}
          </Button>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <GoogleButton type="button" onClick={handleGoogleLogin}>
          <FaGoogle />
          Continue with Google
        </GoogleButton>

        <Footer>
          Already have an account? <Link to="/login">Log In</Link>
        </Footer>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;