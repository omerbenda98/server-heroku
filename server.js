const express = require("express");
const app = express();
const setupApp = require("./app");

setupApp(app);

const PORT = process.env.PORT || 8181;
app.listen(PORT, () => console.log(`server run on: http://localhost:${PORT}`));
