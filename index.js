const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Running');
});

io.on("connection", (socket) => {
  // Emit the unique socket ID to the connecting client
  socket.emit("me", socket.id);

  // Handle when a client disconnects
  socket.on("disconnect", () => {
    // Notify all connected clients that a call has ended
    io.emit("callEnded");
  });

  // Handle when a client initiates a call
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  // Handle when a client answers a call
  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
