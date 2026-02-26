const app = require("../src/app");
const connectDB = require("../src/config/db");

// Database handle for serverless
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error("Vercel Init Error:", error);
    }
  }
  return app(req, res);
};
