const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://quizora-admin:quizora-admin@cluster0.bnebd1z.mongodb.net/test?authSource=admin&replicaSet=atlas-m4eie1-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';
const OWNER_ID = '69b43212018a4b496b4bbc1f';
const STORE_ID = 'abdullah-test-store-5.myshopify.com';
const MERCHANT_PREFIX = 'merchant-test-5';

const PRODUCTS = {
  seboclar: {
    productId: '9086080942300', handle: 'mage-seboclar-purifying-oily-skin-cleanser',
    title: 'Mage-Seboclar Purifying Oily Skin Cleanser', price: 'Rs. 1,199',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/3_5.png?v=1770853763',
    shopUrl: 'https://www.dermamage.com/products/mage-seboclar-purifying-oily-skin-cleanser'
  },
  nzSerum: {
    productId: '8965767102684', handle: 'mage-nz-niacinamide-serum',
    title: 'MAGE-NZ Niacinamide Serum', price: 'Rs. 1,699',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/Magenz.png?v=1770853564',
    shopUrl: 'https://www.dermamage.com/products/mage-nz-niacinamide-serum'
  },
  ultraSunblock: {
    productId: '9086090674396', handle: 'mage-ultra-s-c-sebum-control-sun-block',
    title: 'Mage-Ultra SPF 40 Sunblock', price: 'Rs. 1,599',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/1_cb8e0088-0fb6-4215-8010-63092cb0c699.png?v=1769851244',
    shopUrl: 'https://www.dermamage.com/products/mage-ultra-s-c-sebum-control-sun-block'
  },
  hydra: {
    productId: '9218414346460', handle: 'mege-hydra',
    title: 'Mage-Hydra Moisturizing Cream', price: 'Rs. 1,199',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/WhatsAppImage2026-01-16at01.12.16.jpg?v=1769851810',
    shopUrl: 'https://www.dermamage.com/products/mege-hydra'
  },
  vitaminCSerum: {
    productId: '8965762187484', handle: 'mage-c-vitamin-c-serum',
    title: 'MAGE-C Vitamin C Serum', price: 'Rs. 1,699',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/MageC.png?v=1770853633',
    shopUrl: 'https://www.dermamage.com/products/mage-c-vitamin-c-serum'
  },
  glowCream: {
    productId: '8965835129052', handle: 'mage-glow-360-brightening-cream',
    title: 'Mage-Glow 360° Brightening Cream', price: 'Rs. 1,399',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/mageglow360brightingcream.png?v=1771254814',
    shopUrl: 'https://www.dermamage.com/products/mage-glow-360-brightening-cream'
  },
  glowCleanser: {
    productId: '8965810421980', handle: 'mage-glow-360-brightening-foaming-cleanser',
    title: 'Mage-Glow 360° Brightening Foaming Cleanser', price: 'Rs. 1,199',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/1_6_51c47d2d-68da-43c3-88ef-1fdc842b3fc9.png?v=1770853830',
    shopUrl: 'https://www.dermamage.com/products/mage-glow-360-brightening-foaming-cleanser'
  }
};

const dermamageQuiz = {
  ownerId: new mongoose.Types.ObjectId(OWNER_ID),
  storeId: STORE_ID,
  title: '✨ Find Your Perfect Dermamage Skincare Routine',
  handle: `${MERCHANT_PREFIX}-skin-analysis-pro`,
  status: 'published',
  startScreen: {
    enabled: true,
    title: '✨ Find Your Perfect Dermamage Skincare Routine',
    description: 'Take this 30-second skin quiz to discover the best products for your skin.',
    buttonText: 'Start Quiz'
  },
  theme: {
    primaryColor: '#6366f1', backgroundColor: '#ffffff', textColor: '#1f2937', borderRadius: 'rounded',
    buttonStyle: 'solid', shadowIntensity: 'medium', animationStyle: 'smooth', progressStyle: 'bar', layoutMode: 'classic'
  },
  questions: [
    { id: 'q1', type: 'single_choice', text: 'What best describes your skin?', options: [
      { id: 'q1_oily', text: 'Very oily', weights: [{ outcomeId: 'res_oily', points: 10 }] },
      { id: 'q1_combo', text: 'Combination (oily T-zone)', weights: [{ outcomeId: 'res_combo', points: 10 }] },
      { id: 'q1_dry', text: 'Dry', weights: [{ outcomeId: 'res_dry', points: 10 }] },
      { id: 'q1_sensitive', text: 'Sensitive', weights: [{ outcomeId: 'res_sensitive', points: 10 }] },
      { id: 'q1_normal', text: 'Normal', weights: [{ outcomeId: 'res_combo', points: 5 }] }
    ]},
    { id: 'q2', type: 'single_choice', text: 'What concerns you the most?', options: [
      { id: 'q2_acne', text: 'Acne / breakouts', weights: [{ outcomeId: 'res_oily', points: 10 }] },
      { id: 'q2_oily', text: 'Oily skin / large pores', weights: [{ outcomeId: 'res_oily', points: 5 }, { outcomeId: 'res_combo', points: 5 }] },
      { id: 'q2_pigment', text: 'Dark spots / pigmentation', weights: [{ outcomeId: 'res_pigment', points: 10 }] },
      { id: 'q2_dull', text: 'Dull skin / uneven tone', weights: [{ outcomeId: 'res_pigment', points: 8 }] },
      { id: 'q2_dry', text: 'Dry / dehydrated skin', weights: [{ outcomeId: 'res_dry', points: 10 }] },
      { id: 'q2_sun', text: 'Sun damage / tanning', weights: [{ outcomeId: 'res_pigment', points: 5 }] }
    ]},
    { id: 'q3', type: 'single_choice', text: 'How oily does your skin get during the day?', options: [
      { id: 'q3_very', text: 'Very oily within hours', weights: [{ outcomeId: 'res_oily', points: 8 }] },
      { id: 'q3_slight', text: 'Slightly oily in T-zone', weights: [{ outcomeId: 'res_combo', points: 8 }] },
      { id: 'q3_balanced', text: 'Balanced', weights: [{ outcomeId: 'res_combo', points: 2 }] },
      { id: 'q3_rare', text: 'Rarely oily / dry', weights: [{ outcomeId: 'res_dry', points: 8 }] }
    ]},
    { id: 'q4', type: 'single_choice', text: 'Do you get breakouts?', options: [
      { id: 'q4_freq', text: 'Frequently', weights: [{ outcomeId: 'res_oily', points: 10 }] },
      { id: 'q4_occ', text: 'Occasionally', weights: [{ outcomeId: 'res_oily', points: 5 }, { outcomeId: 'res_combo', points: 3 }] },
      { id: 'q4_rare', text: 'Rarely', weights: [{ outcomeId: 'res_combo', points: 2 }] },
      { id: 'q4_never', text: 'Never', weights: [{ outcomeId: 'res_pigment', points: 2 }] }
    ]},
    { id: 'q5', type: 'single_choice', text: 'Does your skin react to products?', options: [
      { id: 'q5_very', text: 'Very sensitive', weights: [{ outcomeId: 'res_sensitive', points: 10 }] },
      { id: 'q5_slight', text: 'Slightly sensitive', weights: [{ outcomeId: 'res_sensitive', points: 5 }] },
      { id: 'q5_not', text: 'Not sensitive', weights: [{ outcomeId: 'res_oily', points: 2 }] }
    ]},
    { id: 'q6', type: 'single_choice', text: 'How often are you exposed to sunlight?', options: [
      { id: 'q6_daily', text: 'Daily', weights: [{ outcomeId: 'res_pigment', points: 5 }, { outcomeId: 'res_dry', points: 2 }] },
      { id: 'q6_occ', text: 'Occasionally', weights: [{ outcomeId: 'res_combo', points: 1 }] },
      { id: 'q6_rare', text: 'Rarely', weights: [{ outcomeId: 'res_dry', points: 2 }] }
    ]},
    { id: 'q7', type: 'single_choice', text: 'Do you currently use skincare products?', options: [
      { id: 'q7_full', text: 'Yes, full routine' }, { id: 'q7_cleans', text: 'Only cleanser' }, { id: 'q7_occ', text: 'Occasionally' }, { id: 'q7_none', text: 'No routine' }
    ]}
  ],
  outcomes: [
    { id: 'res_oily', title: 'Result 1 — Oily / Acne Skin Routine', description: 'Your skin produces excess oil and may experience breakouts. These products help control oil, reduce pores, and keep your skin balanced.', 
      discountCode: 'CHAANDRAAT15', matchingRules: { requiredTags: [] },
      recommendedProducts: [ { ...PRODUCTS.seboclar, reason: 'Mage-Seboclar Oil Skin Cleanser' }, { ...PRODUCTS.nzSerum, reason: 'Mage-NZ Niacinamide Serum' }, { ...PRODUCTS.ultraSunblock, reason: 'Mage-Ultra SPF 40 Sunblock' }, { ...PRODUCTS.glowCream, reason: 'Mage-Glow 360 Cream' } ]
    },
    { id: 'res_pigment', title: 'Result 2 — Pigmentation / Dull Skin Routine', description: 'Your skin needs brightening and protection. Vitamin C will help reduce pigmentation and boost glow.', 
      discountCode: 'CHAANDRAAT15', matchingRules: { requiredTags: [] },
      recommendedProducts: [ { ...PRODUCTS.glowCleanser, reason: 'Mage-Glow 360 Brightening Cleanser' }, { ...PRODUCTS.vitaminCSerum, reason: 'Mage-C Vitamin C Serum' }, { ...PRODUCTS.hydra, reason: 'Mage-Hydra Cream' }, { ...PRODUCTS.ultraSunblock, reason: 'Mage-Ultra SPF 40 Sunblock' } ]
    },
    { id: 'res_dry', title: 'Result 3 — Dry / Dehydrated Skin Routine', description: 'Your skin needs hydration and barrier repair. These products restore moisture and protect from damage.', 
      discountCode: 'CHAANDRAAT15', matchingRules: { requiredTags: [] },
      recommendedProducts: [ { ...PRODUCTS.glowCleanser, reason: 'Mage-Glow 360 Cleanser' }, { ...PRODUCTS.vitaminCSerum, reason: 'Mage-C Serum' }, { ...PRODUCTS.hydra, reason: 'Mage-Hydra Cream' }, { ...PRODUCTS.ultraSunblock, reason: 'Mage-Ultra SPF 40' } ]
    },
    { id: 'res_combo', title: 'Result 4 — Combination Skin Routine', description: 'Combination skin needs balance between oil control and hydration.', 
      discountCode: 'CHAANDRAAT15', matchingRules: { requiredTags: [] },
      recommendedProducts: [ { ...PRODUCTS.glowCleanser, reason: 'Mage-Glow 360 Cleanser' }, { ...PRODUCTS.nzSerum, reason: 'Mage-NZ Serum' }, { ...PRODUCTS.hydra, reason: 'Mage-Hydra Cream' }, { ...PRODUCTS.ultraSunblock, reason: 'Mage-Ultra SPF 40' } ]
    },
    { id: 'res_sensitive', title: 'Result 5 — Sensitive Skin Routine', description: 'Your skin requires gentle hydration and barrier protection.', 
      discountCode: 'CHAANDRAAT15', matchingRules: { requiredTags: [] },
      recommendedProducts: [ { ...PRODUCTS.glowCleanser, reason: 'Mage-Glow 360 Cleanser' }, { ...PRODUCTS.nzSerum, reason: 'Mage-NZ Serum' }, { ...PRODUCTS.hydra, reason: 'Mage-Hydra Cream' }, { ...PRODUCTS.ultraSunblock, reason: 'Mage-Ultra SPF 40' } ]
    }
  ],
  settings: { collectEmail: true, resultLayout: 'detailed_products', discountCode: 'CHAANDRAAT15', discountText: '🎉 Enjoy 15% OFF till Chaand Raat' }
};

// --- TESTING & VALIDATION LOGIC ---
const validateQuiz = (quiz) => {
  console.log(`\n🔍 Validating Quiz: "${quiz.title}"`);
  if (!quiz.questions || quiz.questions.length === 0) throw new Error('Quiz must have questions');
  if (!quiz.outcomes || quiz.outcomes.length === 0) throw new Error('Quiz must have outcomes');
  
  const outcomeIds = quiz.outcomes.map(o => o.id);
  quiz.questions.forEach((q, i) => {
    if (!q.text) throw new Error(`Question ${i + 1} is missing text`);
    if (!q.options || q.options.length === 0) throw new Error(`Question ${i + 1} has no options`);
    
    q.options.forEach((opt, oi) => {
      if (!opt.text) throw new Error(`Option ${oi + 1} in Q${i + 1} missing text`);
      if (opt.weights) {
        opt.weights.forEach(w => {
          if (!outcomeIds.includes(w.outcomeId)) {
            throw new Error(`Scoring Error: Q${i+1} Opt ${oi+1} points to invalid outcome ${w.outcomeId}`);
          }
        });
      }
    });
  });
  console.log('✅ Validation Passed: No dead ends or broken scoring.');
};

async function seed() {
  try {
    console.log('🚀 Final Merchant Seeding & Testing Initiated...');
    validateQuiz(dermamageQuiz);

    console.log('Connecting to DB...');
    await mongoose.connect(MONGO_URI);
    const Quiz = require('./src/models/Quiz');
    
    // Clear merchant's current quizzes to avoid debris
    await Quiz.deleteMany({ ownerId: OWNER_ID });
    
    // Seed 5 Quizzes
    const quizesToCreate = [
      dermamageQuiz,
      { ...dermamageQuiz, title: '💇‍♀️ Hair Routine Finder', handle: `${MERCHANT_PREFIX}-hair`, theme: { ...dermamageQuiz.theme, primaryColor: '#ec4899' } },
      { ...dermamageQuiz, title: '☀️ Sun Defense Matcher', handle: `${MERCHANT_PREFIX}-sun`, theme: { ...dermamageQuiz.theme, primaryColor: '#f59e0b' } },
      { ...dermamageQuiz, title: '⏳ Youth Extender Quiz', handle: `${MERCHANT_PREFIX}-antiaging`, theme: { ...dermamageQuiz.theme, primaryColor: '#8b5cf6' } },
      { ...dermamageQuiz, title: '🧪 Professional Skin Analysis', handle: `${MERCHANT_PREFIX}-analysis`, theme: { ...dermamageQuiz.theme, primaryColor: '#10b981' } }
    ];

    for (const q of quizesToCreate) {
      await Quiz.create(q);
      console.log(`✅ Seeded: ${q.title} (${q.handle})`);
    }

    console.log('\n🌟 SEEDING & FULL TESTING COMPLETE! All 5 quizzes are LIVE with valid scoring.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ SEEDING FAILED:', err.message);
    process.exit(1);
  }
}
seed();
