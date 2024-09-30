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

const connectToDb = require("./DB/connectToDb");

module.exports = function (app) {
  try {
    connectToDb();
    console.log("Database connected successfully");

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
    const allowedOrigins = [
      "https://omerbenda98.github.io",
      "http://localhost:3000",
    ];

    app.use(
      cors({
        origin: function (origin, callback) {
          // allow requests with no origin
          // (like mobile apps or curl requests)
          if (!origin) return callback(null, true);
          if (allowedOrigins.indexOf(origin) === -1) {
            var msg =
              "The CORS policy for this site does not " +
              "allow access from the specified Origin.";
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        },
      })
    );
    // Middleware
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
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      console.error("WEBHOOK_SECRET environment variable is not set");
      process.exit(1);
    }
    // Routes
    app.get("/api/validate-token", (req, res) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ valid: false, message: "Token required" });
      }
      jwt.verify(token, config.get("jwtKey"), (err, user) => {
        if (err) {
          return res
            .status(401)
            .json({ valid: false, message: "Token invalid" });
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

    app.post("/deploy", (req, res) => {
      const signature = req.headers["x-hub-signature"];
      if (!signature) {
        return res.status(401).send("No signature");
      }

      const hmac = crypto.createHmac("sha1", secret);
      const digest =
        "sha1=" + hmac.update(JSON.stringify(req.body)).digest("hex");

      if (signature !== digest) {
        return res.status(401).send("Invalid signature");
      }

      exec(
        "/home/ubuntu/deployment-scripts/deploy.sh",
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send("Deployment failed");
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
          res.status(200).send("Deployment successful");
        }
      );
    });

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
  } catch (error) {
    console.error("Error in app setup:", error);
    throw error;
  }
};

if (require.main === module) {
  (async () => {
    try {
      const { server } = await module.exports();
      const PORT = process.env.PORT || 8181;
      server.listen(PORT, () =>
        console.log(`Server running on: http://localhost:${PORT}`)
      );
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  })();
}
