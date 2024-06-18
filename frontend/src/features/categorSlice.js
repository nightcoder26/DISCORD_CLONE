import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [
    {
      email: "here",
      password: "abc",
      displayName: "Samay Raina",
      username: "SamayRaina",
    },
    {
      email: "there",
      password: "def",
      displayName: "Bhavitha",
      username: "Bhavitha",
    },
  ],
  userServerList: {
    SamayRaina: { servers: ["Server2", "Server3", "Server4"] },
    Bhavitha: { servers: ["Server2", "Server3"] },
  },
  servers: {
    SamayRaina: {
      categories: [
        {
          categoryName: "News",
          channels: [
            { name: "chess", id: "news1", type: "text" },
            { name: "stream", id: "news2", type: "text" },
            { name: "stand up", id: "news3", type: "text" },
          ],
        },
        {
          categoryName: "Sports",
          channels: [
            { name: "ESPN", id: "sports1", type: "voice" },
            { name: "Fox Sports", id: "sports2", type: "text" },
            { name: "Sky Sports", id: "sports3", type: "voice" },
          ],
        },
        {
          categoryName: "Entertainment",
          channels: [
            { name: "HBO", id: "entertainment1", type: "text" },
            { name: "Netflix", id: "entertainment2", type: "voice" },
            { name: "Hulu", id: "entertainment3", type: "text" },
          ],
        },
      ],
    },
    Server2: {
      categories: [
        {
          categoryName: "News",
          channels: [
            { name: "chess", id: "news1", type: "text" },
            { name: "stream", id: "news2", type: "text" },
            { name: "stand up", id: "news3", type: "text" },
          ],
        },
        {
          categoryName: "Sports",
          channels: [
            { name: "ESPN", id: "sports1", type: "voice" },
            { name: "Fox Sports", id: "sports2", type: "text" },
            { name: "Sky Sports", id: "sports3", type: "voice" },
          ],
        },
      ],
    },
    Server3: {
      categories: [
        {
          categoryName: "abhi",
          channels: [
            { name: "chess", id: "news1", type: "text" },
            { name: "stream", id: "news2", type: "text" },
            { name: "stand up", id: "news3", type: "text" },
          ],
        },
        {
          categoryName: "hi",
          channels: [
            { name: "ESPN", id: "sports1", type: "voice" },
            { name: "Fox Sports", id: "sports2", type: "text" },
            { name: "Sky Sports", id: "sports3", type: "voice" },
          ],
        },
      ],
    },
    Server4: {
      categories: [
        {
          categoryName: "News",
          channels: [
            { name: "chess", id: "news1", type: "text" },
            { name: "stream", id: "news2", type: "text" },
            { name: "stand up", id: "news3", type: "text" },
          ],
        },
        {
          categoryName: "Sports",
          channels: [
            { name: "ESPN", id: "sports1", type: "voice" },
            { name: "Fox Sports", id: "sports2", type: "text" },
            { name: "Sky Sports", id: "sports3", type: "voice" },
          ],
        },
      ],
    },
  },
  serverList: ["SamayRaina", "Server2", "Server3", "Server4", "Server5"],
  selectedServer: "SamayRaina",
  selectedChannel: "news1",
  loggedUser: "SamayRaina",
  messages: {
    news1: [
      { username: "User", text: "Hello" },
      { username: "User", text: "How are you?" },
    ],
    chess: [
      { username: "User", text: "Hello" },
      { username: "User", text: "How are you?" },
    ],
    stream: [
      { username: "User", text: "Hello" },
      { username: "User", text: "standup" },
    ],
    ESPN: [
      { username: "User", text: "Hello" },
      { username: "User", text: "stream?" },
    ],
  },
};

const categorSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {
    signup: (state, action) => {
      state.users.push(action.payload);
      const newUser = { servers: [] };
      state.userServerList[action.payload.username] = newUser;
    },

    login: (state, action) => {
      const user = state.users.find(
        (user) =>
          user.email === action.payload.email &&
          user.password === action.payload.password
      );
      if (user) {
        state.loggedUser = user.username;
      } else {
        state.loggedUser = "SamayRaina"; // assuming "SamayRaina" indicates an invalid login
      }
    },
    addServer: (state, action) => {
      state.servers.push(action.payload);
    },
    deleteServer: (state, action) => {
      state.servers = state.servers.filter(
        (server) => server.id !== action.payload.id
      );
    },
    setSelectedServer: (state, action) => {
      state.selectedServer = action.payload;
    },
    setSelectedChannel: (state, action) => {
      state.selectedChannel = action.payload;
    },
    addMessage: (state, action) => {
      const { channelId, message } = action.payload;
      if (!state.messages[channelId]) {
        state.messages[channelId] = [];
      }
      state.messages[channelId].push({
        username: state.loggedUser, // Use logged-in user's username
        text: message,
      });
    },
  },
});

export const {
  signup,
  login,
  addServer,
  deleteServer,
  setSelectedServer,
  setSelectedChannel,
  addMessage,
} = categorSlice.actions;

export default categorSlice.reducer;

// // Example function to generate unique IDs (you may replace this with your implementation)
// const generateUniqueId = () => {
//   return Math.random().toString(36).substr(2, 9);
// };
