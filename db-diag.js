const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const QUIZ_ID = '69b856dedf58bd430ae5746a';

async function check() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const Quiz = require('./src/models/Quiz');
    const quiz = await Quiz.findById(QUIZ_ID);

    if (quiz) {
      console.log('✅ Quiz Found!');
      console.log('Title:', quiz.title);
      console.log('Status:', quiz.status);
      console.log('Questions Count:', quiz.questions?.length);
      console.log('Outcomes Count:', quiz.outcomes?.length);
      console.log('Start Screen:', JSON.stringify(quiz.startScreen, null, 2));
      console.log('Questions Structure:', JSON.stringify(quiz.questions?.[0], null, 2));
    } else {
      console.log('❌ Quiz NOT Found by ID:', QUIZ_ID);
      const all = await Quiz.find({ handle: /skin-analysis-pro/ });
      console.log('Quizzes with similar handle:', all.map(q => ({ id: q._id, title: q.title, handle: q.handle })));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
