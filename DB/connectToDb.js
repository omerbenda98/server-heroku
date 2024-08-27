const mongoose = require("mongoose");
const config = require("config");

const connectToDb = () => {
  mongoose
    .connect(config.get("dbConfig.url"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Could not connect to MongoDB...", err));
};

module.exports = connectToDb;
