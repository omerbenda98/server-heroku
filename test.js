const crypto = require("crypto");
const config = require("config");

// Load the secret from config
const secret = config.get("WEBHOOK_SECRET");
console.log("Secret:", secret);

// Define the body
const body = JSON.stringify({
  action: "test",
  repository: {
    full_name: "omerbenda98/server-heroku",
  },
});
console.log("Body:", body);

// Generate the signature
const signature =
  "sha1=" + crypto.createHmac("sha1", secret).update(body).digest("hex");
console.log("X-Hub-Signature:", signature);

// Function to simulate server-side signature calculation
function serverCalculateSignature(secret, body) {
  return "sha1=" + crypto.createHmac("sha1", secret).update(body).digest("hex");
}

// Simulate server-side calculation
const serverSignature = serverCalculateSignature(secret, body);
console.log("Server Signature:", serverSignature);

// Compare signatures
console.log("Signatures match:", signature === serverSignature);
