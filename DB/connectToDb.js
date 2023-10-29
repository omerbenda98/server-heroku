const mongoose = require("mongoose");
const chalk = require("chalk");
const config = require("config");

console.log("con str", config.get("dbConfig.url"));

mongoose
  .connect(config.get("dbConfig.url"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(chalk.magentaBright.bold("connected to MongoDb!")))
  .catch((error) =>
    console.log(chalk.redBright.bold(`could not connect to mongoDb: ${error}`))
  );

module.exports = mongoose;
