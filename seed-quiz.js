const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizdb';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    const Quiz = require('./src/models/Quiz');

    // Clean up existing test quiz if needed, but let's create a NEW one for "Skin Care Routine"
    // Using the same ID as the one in the test file to make it seamless
    const TARGET_ID = '69a1b39f14799fbada03cdae';
    
    await Quiz.deleteOne({ _id: TARGET_ID });

    const premiumQuiz = {
      _id: new mongoose.Types.ObjectId(TARGET_ID),
      ownerId: new mongoose.Types.ObjectId('69a0947e4fc4f39f4ee1117e'), // User TSP
      storeId: 'default-store',
      title: 'Personalized Skin Care Analysis',
      handle: 'skin-care-routine',
      status: 'published',
      theme: {
        primaryColor: '#6366f1',
        backgroundColor: '#0a0a0b',
        textColor: '#ffffff',
        accentColor: '#8b5cf6',
        fontFamily: 'Inter',
        borderRadius: 'rounded',
        buttonStyle: 'solid',
        layoutMode: 'glass-morph'
      },
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          text: 'What is your primary skin concern?',
          required: true,
          options: [
            { id: 'opt1_1', text: 'Dryness & Flaking', tags: ['dry', 'hydration'] },
            { id: 'opt1_2', text: 'Acne & Breakouts', tags: ['acne', 'oily'] },
            { id: 'opt1_3', text: 'Fine Lines & Aging', tags: ['aging', 'firming'] },
            { id: 'opt1_4', text: 'Redness & Sensitivity', tags: ['sensitive', 'calming'] }
          ]
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          text: 'How does your skin feel by midday?',
          required: true,
          options: [
            { id: 'opt2_1', text: 'Tight and uncomfortable', tags: ['dry'] },
            { id: 'opt2_2', text: 'Shiny all over', tags: ['oily'] },
            { id: 'opt2_3', text: 'Oily only in T-zone', tags: ['combination'] },
            { id: 'opt2_4', text: 'Normal and balanced', tags: ['normal'] }
          ]
        },
        {
            id: 'q3',
            type: 'multiple_choice',
            text: 'Choose your preferred texture:',
            required: false,
            options: [
              { id: 'opt3_1', text: 'Rich, creamy creams', tags: ['heavy-moisture'] },
              { id: 'opt3_2', text: 'Lightweight gels', tags: ['lightweight'] }
            ]
          }
      ],
      outcomes: [
        {
          id: 'out1',
          title: 'Deep Hydration Protocol',
          description: 'Your skin is craving moisture. This routine focuses on lipid barrier repair and intense hydration using hyaluronic acid.',
          tags: ['dry', 'hydration', 'heavy-moisture'],
          priority: 10,
          matchingRules: { requiredTags: ['dry'] },
          recommendedProducts: [
            { productId: 'p1', title: 'Ultra-Rich Hydrating Cream', price: '$42.00', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600' },
            { productId: 'p2', title: 'Hyaluronic Acid Serum', price: '$28.00', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600' }
          ]
        },
        {
          id: 'out2',
          title: 'Oil Control & Clarifying Set',
          description: 'Designed to balance sebum production and clear pores without stripping your skin of essential oils.',
          tags: ['oily', 'acne', 'lightweight'],
          priority: 10,
          matchingRules: { requiredTags: ['oily'] },
          recommendedProducts: [
            { productId: 'p3', title: 'Salicylic Acid Cleanser', price: '$18.00', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600' },
            { productId: 'p4', title: 'Oil-Free Mattifying Gel', price: '$24.00', imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600' }
          ]
        },
        {
          id: 'out3',
          title: 'The Essential Glow Routine',
          description: 'A balanced approach for normal to combination skin to maintain radiance and health.',
          tags: ['normal', 'combination'],
          priority: 5,
          recommendedProducts: [
            { productId: 'p5', title: 'Daily Balancing Cleanser', price: '$15.00', imageUrl: 'https://images.unsplash.com/photo-1556228515-9195a672e8a03?auto=format&fit=crop&q=80&w=600' }
          ]
        }
      ],
      settings: {
        collectEmail: true,
        showProgressBar: true,
        resultLayout: 'detailed_products'
      }
    };

    await Quiz.create(premiumQuiz);
    console.log('✅ Premium quiz seeded successfully with ID: ' + TARGET_ID);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
