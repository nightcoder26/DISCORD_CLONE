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
    Server2: {
      News: [
        { name: "Bhavitha", id: "news1", type: "text" },
        { name: "BBB", id: "news2", type: "text" },
        { name: "CCC", id: "news3", type: "text" },
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
    Server3: {
      News: [
        { name: "TV9", id: "news1", type: "text" },
        { name: "Aaj tak", id: "news2", type: "text" },
        { name: "Republic TV", id: "news3", type: "text" },
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
    Server4: {
      News: [
        { name: "TV9", id: "news1", type: "text" },
        { name: "Aaj tak", id: "news2", type: "text" },
        { name: "Republic TV", id: "news3", type: "text" },
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
    Server5: {
      News: [
        { name: "TV9", id: "news1", type: "text" },
        { name: "Aaj tak", id: "news2", type: "text" },
        { name: "Republic TV", id: "news3", type: "text" },
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
  },
  serverList: ["SamayRaina", "Server2", "Server3", "Server4", "Server5"],
  // userServerList: {
  //   username: "bhavitha",
  //   servers: ["SamayRaina", "Server2", "Server3", "Server4", "Server5"],
  // },
  // ye ek hee user ka h? no ye ek hee object h  so ye ek hee object h? jo logged user h uska? to access easy hoga aisa koina same hee rehta h bs thoda more organised
  // when they login u will change the username above and then make their servers empty when they join they will have servers wo aise bhi kr skte h na

  selectedServer: "SamayRaina",
  email: "here",
  password: "abc",
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
  loggedUser: "SamayRaina",
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
      state.email = action.payload.email;
      state.password = action.payload.password;
      // ye login h push nhi krni we need store only who is logged in
      //signup alag krke wo push krenge
      //styling krni ok
      if (
        state.users.find(
          (user) =>
            user.email === state.email && user.password === state.password
        )
      ) {
        state.loggedUser = state.users.find(
          (user) =>
            user.email === state.email && user.password === state.password
        ).username;
        // state.userServerList.username = state.loggedUser;
        // state.userServerList.servers = ["Server2", "Server3"];
      }
    },
    signup: (state, action) => {
      state.users.push(action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addServer, deleteServer, setSelectedServer, login, signup } =
  serverSlice.actions;

export default serverSlice.reducer;
