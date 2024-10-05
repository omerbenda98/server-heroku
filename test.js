const crypto = require("crypto");

const secret = "0330105125a385acee588979e94b804a8f757c28";
console.log(secret);

const body = JSON.stringify({
  action: "test",
  repository: {
    full_name: "omerbenda98/server-heroku",
  },
});

const signature =
  "sha1=" + crypto.createHmac("sha1", secret).update(body).digest("hex");
console.log("X-Hub-Signature:", signature);
