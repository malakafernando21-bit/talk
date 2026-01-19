/*
 * Voki Toky Backend Server
 * 
 * Instructions:
 * 1. Initialize a new Node project: `npm init -y`
 * 2. Install dependencies: `npm install express socket.io cors dotenv`
 * 3. Run with: `node server.js`
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all for demo, restrict in prod
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8 // Allow larger blobs if necessary (100MB)
});

interface ConnectedUser {
  id: string;
  name: string;
  channel: string;
}

const users: Record<string, ConnectedUser> = {};
const channels: Record<string, string[]> = {}; // channel -> array of socket ids

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join", ({ name, channel }) => {
    users[socket.id] = { id: socket.id, name, channel };
    socket.join(channel);
    
    // Add to channel list
    if (!channels[channel]) channels[channel] = [];
    channels[channel].push(socket.id);

    // Notify channel
    io.to(channel).emit("user_joined", { id: socket.id, name });
    io.to(channel).emit("active_users", channels[channel].map(id => users[id]));
    
    console.log(`${name} joined ${channel}`);
  });

  // Handle Voice Data
  // In a scalable app, use WebRTC Peer connections signaling here.
  // For simplicity and "Walkie Talkie" burst style, relaying blobs via socket is acceptable for small groups.
  socket.on("voice_message", (data) => {
    const user = users[socket.id];
    if (user) {
      // Broadcast to everyone else in the channel
      socket.to(user.channel).emit("voice_message", {
        id: Date.now().toString(),
        senderId: socket.id,
        senderName: user.name,
        audioBlob: data.audioBlob, // This would be binary data
        transcription: data.transcription,
        duration: data.duration,
        timestamp: Date.now()
      });
      console.log(`Relayed voice from ${user.name}`);
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      const ch = user.channel;
      if (channels[ch]) {
        channels[ch] = channels[ch].filter(id => id !== socket.id);
        io.to(ch).emit("active_users", channels[ch].map(id => users[id]));
      }
      console.log(`${user.name} disconnected`);
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});