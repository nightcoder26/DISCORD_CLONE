import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import serverReducer from './slices/serverSlice';
import channelReducer from './slices/channelSlice';
import messageReducer from './slices/messageSlice';
import userReducer from './slices/userSlice';
import dmReducer from './slices/dmSlice';
import socketReducer from './slices/socketSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    servers: serverReducer,
    channels: channelReducer,
    messages: messageReducer,
    users: userReducer,
    dm: dmReducer,
    socket: socketReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/setSocket'],
        ignoredPaths: ['socket.socket'],
      },
    }),
});