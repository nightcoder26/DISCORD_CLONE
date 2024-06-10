import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  servers: {
    SamayRaina: {
      News: [
        { name: "chess", id: "news1", type: "text" },
        { name: "stream", id: "news2", type: "text" },
        { name: "stand up", id: "news3", type: "text" },
      ],
      Sports: [
        { name: "ESPN", id: "sports1", type: "voice" },
        { name: "Fox Sports", id: "sports2", type: "text" },
        { name: "Sky Sports", id: "sports3", type: "voice" },
      ],
      Entertainment: [
        { name: "HBO", id: "entertainment1", type: "text" },
        { name: "Netflix", id: "entertainment2", type: "voice" },
        { name: "Hulu", id: "entertainment3", type: "text" },
      ],
    },
    // Other server data
  },
  serverList: ["SamayRaina", "Server2", "Server3", "Server4", "Server5"],
  userServerList: [
    { username: "SamayRaina", servers: ["Server2", "Server3", "Server4"] },
    {
      username: "Bhavitha",
      servers: ["Server2", "Server3"],
    },
  ],
  selectedServer: "SamayRaina",
  email: "",
  password: "",
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
  loggedUser: "",
};

const serverSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {
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
    signup: (state, action) => {
      state.users.push(action.payload);
      const newUser = { username: action.payload.username, servers: [] };
      state.userServerList.push(newUser);
    },
  },
});

export const { addServer, deleteServer, setSelectedServer, login, signup } =
  serverSlice.actions;

export default serverSlice.reducer;
