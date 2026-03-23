const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizdb';

async function findUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Define a minimal User schema to find the user
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // Find user by username or email
    const user = await User.findOne({ 
      $or: [
        { username: 'tsp.pak123' },
        { email: 'tsp.pak123' }, // Sometimes username is used as email
        { email: /tsp\.pak123/i }
      ] 
    });

    if (user) {
      console.log('USER_FOUND:', user._id.toString());
      console.log('User details:', JSON.stringify(user, null, 2));
    } else {
      console.log('USER_NOT_FOUND');
      // List all users to help debug
      const allUsers = await User.find({}, 'username email');
      console.log('All users in DB:', JSON.stringify(allUsers, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

findUser();
