import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { FaEye, FaEyeSlash, FaDiscord, FaGoogle } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { loginUser, clearError } from '../../store/slices/authSlice';
import { checkAuthStatus } from '../../store/slices/authSlice';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
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

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  // Get the return URL from state
  const returnTo = location.state?.returnTo || '/';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data));
      toast.success('Welcome back!');
      navigate(returnTo);
    } catch (error) {
      toast.error(error || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  React.useEffect(() => {
    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/';
    }
    
    // Clear URL parameters
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  React.useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  return (
    <LoginContainer>
      <LoginCard className="fade-in">
        <Header>
          <Logo>
            <FaDiscord />
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#dcddde' }}>
              Discord Clone
            </span>
          </Logo>
          <Title>Welcome back!</Title>
          <Subtitle>We're so excited to see you again!</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit(onSubmit)}>
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
                  required: 'Password is required'
                })}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </div>
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Log In'}
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
          Need an account? <Link to="/register">Register</Link>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;