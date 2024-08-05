const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const chalk = require("chalk");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const config = require("config");
const { Server } = require("socket.io");

const usersRouter = require("./Routes/userRouter");
const cardsRouter = require("./Routes/cardsRouter");
const chatRouter = require("./Routes/chatRouter");
const Chat = require("./model/chats/chatModel");
const { validateChat } = require("./validation/chatValidation");
const normalizeChat = require("./model/chats/NormalizeChat");
const initialData = require("./initialData/initialData");

require("./DB/connectToDb");

module.exports = function (app) {
  if (!app) {
    app = express();
  }

  const server = http.createServer(
    {
      joinDuplicateHeaders: false,
      insecureHTTPParser: false,
    },
    app
  );

  // Middleware
  app.use(cors({ origin: "https://omerbenda98.github.io" }));
  app.use(morgan(chalk.cyan(":method :url :status :response-time ms")));
  app.use(express.json());
  app.use(express.static("public"));
  app.use("/uploads", express.static("uploads"));

  // Socket.io setup
  const io = new Server(server, {
    cors: {
      origin: "https://omerbenda98.github.io",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("send_message", async (data) => {
      try {
        const { error } = validateChat(data);
        if (error) {
          console.error("Validation error:", error.details[0].message);
          return;
        }
        const normalizedMessage = normalizeChat(
          data,
          data.senderID,
          data.recepientID
        );
        const message = new Chat(normalizedMessage);
        await message.save();
        io.to(data.roomID).emit("receive_message", message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });
  });

  // Routes
  app.get("/api/validate-token", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ valid: false, message: "Token required" });
    }
    jwt.verify(token, config.get("jwtKey"), (err, user) => {
      if (err) {
        return res.status(401).json({ valid: false, message: "Token invalid" });
      }
      return res.json({ valid: true, user });
    });
  });

  app.get("/", (req, res) => {
    res.send("Hello World");
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  const upload = multer({ storage: storage });

  app.post("/api/upload", upload.single("profilePic"), (req, res) => {
    if (req.file) {
      res.json({ imageUrl: `uploads/${req.file.filename}` });
    } else {
      res.status(400).json({ error: "No file uploaded" });
    }
  });

  app.use("/api/users", usersRouter);
  app.use("/api/cards", cardsRouter);
  app.use("/api/chats", chatRouter);

  // Initialize data
  initialData();

  return { app, server };
};
