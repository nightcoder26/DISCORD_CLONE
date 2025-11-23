import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'dark',
  sidebarCollapsed: false,
  memberListVisible: true,
  currentView: 'servers', // 'servers', 'friends', 'dm'
  activeModal: null,
  contextMenu: null,
  notifications: [],
  isConnecting: false,
  connectionError: null,
  showEmojiPicker: false,
  emojiPickerTarget: null,
  userPanelExpanded: false,
  searchQuery: '',
  searchResults: null,
  showSearch: false,
  userProfileModal: {
    isOpen: false,
    user: null,
    serverId: null
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('discord-theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMemberList: (state) => {
      state.memberListVisible = !state.memberListVisible;
    },
    setMemberListVisible: (state, action) => {
      state.memberListVisible = action.payload;
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    showContextMenu: (state, action) => {
      state.contextMenu = action.payload;
    },
    hideContextMenu: (state) => {
      state.contextMenu = null;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    setConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setConnectionError: (state, action) => {
      state.connectionError = action.payload;
    },
    showEmojiPicker: (state, action) => {
      state.showEmojiPicker = true;
      state.emojiPickerTarget = action.payload;
    },
    hideEmojiPicker: (state) => {
      state.showEmojiPicker = false;
      state.emojiPickerTarget = null;
    },
    toggleUserPanel: (state) => {
      state.userPanelExpanded = !state.userPanelExpanded;
    },
    setUserPanelExpanded: (state, action) => {
      state.userPanelExpanded = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    toggleSearch: (state) => {
      state.showSearch = !state.showSearch;
      if (!state.showSearch) {
        state.searchQuery = '';
        state.searchResults = null;
      }
    },
    setShowSearch: (state, action) => {
      state.showSearch = action.payload;
      if (!action.payload) {
        state.searchQuery = '';
        state.searchResults = null;
      }
    },
    openUserProfileModal: (state, action) => {
      // Only open if user object is valid
      if (action.payload && action.payload.user && action.payload.user._id) {
        state.userProfileModal.isOpen = true;
        state.userProfileModal.user = action.payload.user;
        state.userProfileModal.serverId = action.payload.serverId || null;
      } else {
        console.error('Cannot open user profile modal: invalid user object', action.payload);
      }
    },
    closeUserProfileModal: (state) => {
      state.userProfileModal.isOpen = false;
      state.userProfileModal.user = null;
      state.userProfileModal.serverId = null;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  toggleMemberList,
  setMemberListVisible,
  setCurrentView,
  openModal,
  closeModal,
  showContextMenu,
  hideContextMenu,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setConnecting,
  setConnectionError,
  showEmojiPicker,
  hideEmojiPicker,
  toggleUserPanel,
  setUserPanelExpanded,
  setSearchQuery,
  setSearchResults,
  toggleSearch,
  setShowSearch,
  openUserProfileModal,
  closeUserProfileModal,
} = uiSlice.actions;

export default uiSlice.reducer;