const https = require("https");
const fs = require("fs");
const path = require("path");
// require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { connectDB } = require("./db/connectDB");
const { createRolesInDB } = require("./utils/createRolesInDB");
const { Server } = require("socket.io");
const { app, setSocketIO } = require("./app"); // Import `setSocketIO`
const { initAgenda } = require("./jobs");


connectDB()
  .then(async (conn) => {
    console.log("🔆 Database connected to host:", conn.connection.host);

    require("./jobs");

    const serverOptions = {
      key: fs.readFileSync(path.join(__dirname, "../sslcerts/key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "../sslcerts/cert.pem")),
    };

    const server = https.createServer(serverOptions, app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: "https://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    // Pass `io` to `app.js`
    setSocketIO(io);

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);

      socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
        io.to(room).emit('message', `User ${socket.id} has joined ${room}`);
      });

    // Leave a room
    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room: ${room}`);
        io.to(room).emit('message', `User ${socket.id} has left ${room}`);
    });

    // Send message to a specific room
    socket.on('sendMessage', ({ room, message }) => {
        io.to(room).emit('message', `${socket.id}: ${message}`);
    });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    server.listen(process.env.PORT, async () => {
      await createRolesInDB();
      console.log(`🔆 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("🚫 Database connection error:\n", err);
  });
