// firebase.js
const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

// Load service account from environment variable or a JSON file
const serviceAccount = require("./firebase-server.json"); // 🔒 You must download it from Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
