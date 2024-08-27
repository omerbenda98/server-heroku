const express = require("express");
const config = require("config");
const setupApp = require("./app");

console.log("Starting server setup...");

async function startServer() {
  try {
    const app = express();
    const { server } = await setupApp(app);
    console.log("App setup completed.");

    const PORT = process.env.PORT || config.get("port") || 8181;
    server.listen(PORT, () => {
      if (process.env.NODE_ENV === "production") {
        console.log(`Server running on port ${PORT}`);
      } else {
        console.log(`Server running on: http://localhost:${PORT}`);
      }
      console.log(`Connected to MongoDB: ${config.get("dbConfig.url")}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();
