const crypto = require("crypto");
const config = require("config");

// Load the secret from config
const secret = config.get("WEBHOOK_SECRET");
console.log("Secret:", secret);
console.log("Secret length:", secret.length);

// Define the body - use the exact JSON you're sending in Postman
const body = {
  ref: "refs/heads/main",
  repository: {
    name: "server-heroku",
    full_name: "omerbenda98/server-heroku",
    owner: {
      name: "omerbenda98",
      email: "omerbenda98@gmail.com",
    },
  },
  pusher: {
    name: "omerbenda98",
    email: "omerbenda98@gmail.com",
  },
  head_commit: {
    id: "59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5",
    message: "Update for testing",
    timestamp: "2024-10-05T14:30:00Z",
    modified: ["README.md"],
  },
};

// Stringify the body
const bodyString = JSON.stringify(body);
console.log("Body string:", bodyString);
console.log("Body string length:", bodyString.length);

// Generate the signature
const signature =
  "sha1=" + crypto.createHmac("sha1", secret).update(bodyString).digest("hex");
console.log("Generated X-Hub-Signature:", signature);

// Simulate server-side verification
const serverSignature =
  "sha1=" + crypto.createHmac("sha1", secret).update(bodyString).digest("hex");
console.log("Server-side calculated signature:", serverSignature);

// Compare signatures
console.log("Signatures match:", signature === serverSignature);

// If you have the signature from Postman, paste it here to compare
const postmanSignature = "sha1=9619101359bd8a51de18cd749d8e00c22bc73c35";
console.log(
  "Postman signature matches generated:",
  postmanSignature === signature
);
