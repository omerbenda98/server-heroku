require("./DB/connectToDb");
const initialData = require("./initialData/initialData");
const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const usersRouter = require("./Routes/userRouter");
const cardsRouter = require("./Routes/cardsRouter");
const chatRouter = require("./Routes/chatRouter");
const chalk = require("chalk");
const morgan = require("morgan");
const cors = require("cors");
const Chat = require("./model/chats/chatModel");
const { validateChat } = require("./validation/chatValidation");
const { Server } = require("socket.io");
const normalizeChat = require("./model/chats/NormalizeChat");
const multer = require("multer");
const config = require("config");
const jwt = require("jsonwebtoken");

const server = http.createServer(app);

// Attach socket.io to the server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // When a user joins a room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  // When a message is sent
  socket.on("send_message", async (data) => {
    try {
      // Validates incoming data first
      const { error } = validateChat(data);

      if (error) {
        console.error("Validation error:", error.details[0].message);
        return res.status(400).send(error.details[0].message); // returns early if validation fails
      }
      // Create new chat and save it only if validation passes
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

// validates token and sends a response to check for invalid/old token
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

// multer used for file upload to 'uploads' folder
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
initialData();
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(morgan(chalk.cyan(":method :url :status :response-time ms")));
app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/chats", chatRouter);

const PORT = 8181;
server.listen(process.env.PORT, () =>
  console.log(chalk.blueBright.bold(`server run on: http://localhost:${PORT}`))
);
