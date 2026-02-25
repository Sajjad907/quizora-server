const connectDB = require('../src/config/db');
const app = require('../src/app');

module.exports = async (req, res) => {
  try {
    // Only connect if not already connected
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Entry Error:", error);
    res.status(500).json({ 
      error: "Initialization Error", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
