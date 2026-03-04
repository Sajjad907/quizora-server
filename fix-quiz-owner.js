const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizdb';
const USER_EMAIL = 'tsp.pak123@gmail.com';
const QUIZ_HANDLE = 'dermamage-skin-quiz';

const updateQuizOwner = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const User = require('./src/models/User');
        const Quiz = require('./src/models/Quiz');

        // 1. Find the user by their email
        const adminUser = await User.findOne({ email: USER_EMAIL.toLowerCase() });
        
        if (!adminUser) {
            console.error(`❌ User with email ${USER_EMAIL} not found in database!`);
            process.exit(1);
        }

        console.log(`✅ Found Admin User: ${adminUser.name} (ID: ${adminUser._id})`);

        // 2. Find the Dermamage quiz
        const dermamageQuiz = await Quiz.findOne({ handle: QUIZ_HANDLE });

        if (!dermamageQuiz) {
            console.error(`❌ Quiz with handle '${QUIZ_HANDLE}' not found!`);
            process.exit(1);
        }

        // 3. Update the ownerId
        dermamageQuiz.ownerId = adminUser._id;
        await dermamageQuiz.save();

        console.log(`\n🎉 SUCCESS! Quiz ownership transferred to ${USER_EMAIL}.`);
        console.log(`The quiz with ID ${dermamageQuiz._id} will now appear in your Admin Dashboard.`);

        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updateQuizOwner();
