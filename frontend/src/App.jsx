import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Import components
import LoginPage from './components/auth/LoginPage.jsx';
import RegisterPage from './components/auth/RegisterPage.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import ChannelView from './components/chat/ChannelView.jsx';
import DirectMessageView from './components/chat/DirectMessageView.jsx';
import InvitePage from './components/InvitePage.jsx';
import CreateServerModal from './components/modals/CreateServerModal.jsx';
import StartDMModal from './components/modals/StartDMModal.jsx';
import CreateChannelModal from './components/modals/CreateChannelModal.jsx';
import InviteModal from './components/modals/InviteModal.jsx';
import UserProfileModal from './components/modals/UserProfileModal.jsx';

// Import services and actions
import { getCurrentUser } from './store/slices/authSlice';
import { closeModal, closeUserProfileModal } from './store/slices/uiSlice';
import socketService from './services/socketService';

// Global styles
import './styles/global.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, token, user } = useSelector((state) => state.auth);
  const { connected } = useSelector((state) => state.socket);
  const { activeModal } = useSelector((state) => state.ui);
  const { userProfileModal } = useSelector((state) => state.ui);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedToken = localStorage.getItem('token');
    if (storedToken && !isAuthenticated && !loading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, loading]);

  useEffect(() => {
    // Connect to socket when user is authenticated
    if (isAuthenticated && token && user && !connected) {
      socketService.connect(token);
    }
    
    // Disconnect socket when user logs out
    if (!isAuthenticated && connected) {
      socketService.disconnect();
    }
  }, [isAuthenticated, token, user, connected]);

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      dispatch(getCurrentUser());
    } else if (error) {
      console.error('OAuth error:', error);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading Discord Clone...</p>
      </div>
    );
  }

  // If no token and not authenticated, redirect to login
  const hasToken = localStorage.getItem('token');
  if (!hasToken && !isAuthenticated && !loading) {
    return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#36393f',
              color: '#dcddde',
              border: '1px solid #4f545c',
            },
            success: {
              iconTheme: {
                primary: '#57f287',
                secondary: '#36393f',
              },
            },
            error: {
              iconTheme: {
                primary: '#ed4245',
                secondary: '#36393f',
              },
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Authentication Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dm" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dm" />} 
          />

          {/* Public Invite Route */}
          <Route 
            path="/invite/:code" 
            element={<InvitePage />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
          >
            {/* Direct Messages */}
            <Route 
              path="dm" 
              element={<DirectMessageView />} 
            />
            <Route 
              path="dm/:conversationId" 
              element={<DirectMessageView />} 
            />

            {/* Server Routes */}
            <Route 
              path="server/:serverId" 
              element={<Navigate to="/dm" />} // Default redirect for now
            />
            <Route 
              path="server/:serverId/channel/:channelId" 
              element={<ChannelView />} 
            />

            {/* Default redirect */}
            <Route 
              index 
              element={<Navigate to="/dm" />} 
            />
          </Route>

          {/* Fallback redirect */}
          <Route 
            path="*" 
            element={isAuthenticated ? <Navigate to="/dm" /> : <Navigate to="/login" />} 
          />
        </Routes>

        {/* Modals */}
        <CreateServerModal 
          isOpen={activeModal === 'createServer'}
          onClose={() => dispatch(closeModal())}
        />
        <StartDMModal 
          isOpen={activeModal === 'startDM'}
          onClose={() => dispatch(closeModal())}
        />
        <CreateChannelModal 
          isOpen={activeModal === 'createChannel'}
          onClose={() => dispatch(closeModal())}
        />
        <InviteModal 
          isOpen={activeModal === 'invite'}
          onClose={() => dispatch(closeModal())}
        />
        <UserProfileModal 
          isOpen={userProfileModal.isOpen}
          user={userProfileModal.user}
          serverId={userProfileModal.serverId}
          onClose={() => dispatch(closeUserProfileModal())}
        />
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#36393f',
            color: '#dcddde',
            border: '1px solid #4f545c',
          },
          success: {
            iconTheme: {
              primary: '#57f287',
              secondary: '#36393f',
            },
          },
          error: {
            iconTheme: {
              primary: '#ed4245',
              secondary: '#36393f',
            },
          },
        }}
      />
    </div>
  );
}

export default App;