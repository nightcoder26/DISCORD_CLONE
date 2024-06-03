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
  selectedServer: "SamayRaina",
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
  },
});

// Action creators are generated for each case reducer function
export const { addServer, deleteServer, setSelectedServer } =
  serverSlice.actions;

export default serverSlice.reducer;
