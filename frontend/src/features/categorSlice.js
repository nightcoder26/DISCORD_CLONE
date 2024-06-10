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
  userServerList: [
    { username: "SamayRaina", servers: ["Server2", "Server3", "Server4"] },
    { username: "Bhavitha", servers: ["Server2", "Server3"] },
  ],

  servers: [
    {
      serverName: "SamayRaina",
      categories: [
        {
          categoryName: "News",
          channels: [
            { name: "chess", id: "news1", type: "text", messages: [] },
            { name: "stream", id: "news2", type: "text", messages: [] },
            { name: "stand up", id: "news3", type: "text", messages: [] },
          ],
        },
        {
          categoryName: "Sports",
          channels: [
            { name: "ESPN", id: "sports1", type: "voice", messages: [] },
            { name: "Fox Sports", id: "sports2", type: "text", messages: [] },
            { name: "Sky Sports", id: "sports3", type: "voice", messages: [] },
          ],
        },
        {
          categoryName: "Entertainment",
          channels: [
            { name: "HBO", id: "entertainment1", type: "text", messages: [] },
            {
              name: "Netflix",
              id: "entertainment2",
              type: "voice",
              messages: [],
            },
            { name: "Hulu", id: "entertainment3", type: "text", messages: [] },
          ],
        },
      ],
    },
    {
      serverName: "Server2",
      categories: [
        {
          categoryName: "News",
          channels: [
            { name: "chess", id: "news1", type: "text", messages: [] },
            { name: "stream", id: "news2", type: "text", messages: [] },
            { name: "stand up", id: "news3", type: "text", messages: [] },
          ],
        },
        {
          categoryName: "Sports",
          channels: [
            { name: "ESPN", id: "sports1", type: "voice", messages: [] },
            { name: "Fox Sports", id: "sports2", type: "text", messages: [] },
            { name: "Sky Sports", id: "sports3", type: "voice", messages: [] },
          ],
        },
      ],
    },
  ],
  serverList: ["SamayRaina", "Server2", "Server3", "Server4", "Server5"],
  //array of objects is the best
  //tum bolrhe the :) me nhi yes whi boli
  selectedServer: "SamayRaina",
  selectedChannel: "news1", // Assuming a default selected channel
  email: "",
  password: "",
  loggedUser: "",
};

const serverSlice = createSlice({
  name: "servers",
  initialState,

  reducers: {
    signup: (state, action) => {
      state.users.push(action.payload);
      const newUser = { username: action.payload.username, servers: [] };
      state.userServerList.push(newUser);
      //dono me horha abhi
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
      const { serverName, channelId, message } = action.payload;
      const server = state.servers[serverName];
      for (let category in server) {
        const channel = server[category].find(
          (channel) => channel.id === channelId
        );
        if (channel) {
          channel.messages.push(message);
          break;
        }
      }
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
  },
});

export const {
  addServer,
  deleteServer,
  setSelectedServer,
  setSelectedChannel,
  addMessage,
  login,
  signup,
} = serverSlice.actions;

export default serverSlice.reducer;
