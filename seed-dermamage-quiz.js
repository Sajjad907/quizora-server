/**
 * ============================================================
 * DERMAMAGE QUIZ SEED SCRIPT
 * ============================================================
 * This script seeds the MongoDB database (Atlas or local) with
 * a complete, professional skin-care quiz for dermamage.com.
 *
 * Products are pulled directly from the live Shopify store.
 * Run: node seed-dermamage-quiz.js
 * ============================================================
 */

const mongoose = require('mongoose');
require('dotenv').config();

// ---- CONFIG ----
// Change MONGO_URI in .env to your Atlas URI for production seeding
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizdb';

// This is the Owner/Admin user that owns the quiz.
// Use the real ObjectId from your MongoDB Users collection.
const OWNER_ID = process.env.OWNER_ID || '69a0947e4fc4f39f4ee1117e';

// The quiz handle used in the widget embed code
const QUIZ_HANDLE = 'dermamage-skin-quiz';

// ---- REAL DERMAMAGE PRODUCTS (from live Shopify store) ----
const PRODUCTS = {
  seboclar: {
    productId: '9086080942300',
    handle: 'mage-seboclar-purifying-oily-skin-cleanser',
    title: 'Mage-Seboclar Purifying Oily Skin Cleanser',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/3_5.png?v=1770853763',
    price: 'Rs. 1,199',
    shopUrl: 'https://www.dermamage.com/products/mage-seboclar-purifying-oily-skin-cleanser',
    reason: 'Controls excess oil, deeply cleanses pores, and prevents breakouts for oily/acne-prone skin.',
  },
  nzSerum: {
    productId: '8965767102684',
    handle: 'mage-nz-niacinamide-serum',
    title: 'MAGE-NZ Niacinamide Serum',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/Magenz.png?v=1770853564',
    price: 'Rs. 1,699',
    shopUrl: 'https://www.dermamage.com/products/mage-nz-niacinamide-serum',
    reason: 'Minimizes enlarged pores, controls excess oil, and refines skin texture for oily/combination skin.',
  },
  ultraSunblock: {
    productId: '9086090674396',
    handle: 'mage-ultra-s-c-sebum-control-sun-block',
    title: 'Mage-Ultra S/C Sebum Control Sun Block',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/1_cb8e0088-0fb6-4215-8010-63092cb0c699.png?v=1769851244',
    price: 'Rs. 1,599',
    shopUrl: 'https://www.dermamage.com/products/mage-ultra-s-c-sebum-control-sun-block',
    reason: 'Broad-spectrum UV protection with sebum-control technology — ideal for oily, acne-prone skin.',
  },
  hydra: {
    productId: '9218414346460',
    handle: 'mege-hydra',
    title: 'Mage-Hydra Moisturizing Cream',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/WhatsAppImage2026-01-16at01.12.16.jpg?v=1769851810',
    price: 'Rs. 1,199',
    shopUrl: 'https://www.dermamage.com/products/mege-hydra',
    reason: 'Concentrated moisturizing cream that restores the skin barrier and provides lasting hydration for dry skin.',
  },
  vitaminCSerum: {
    productId: '8965762187484',
    handle: 'mage-c-vitamin-c-serum',
    title: 'MAGE-C Vitamin C Serum',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/MageC.png?v=1770853633',
    price: 'Rs. 1,699',
    shopUrl: 'https://www.dermamage.com/products/mage-c-vitamin-c-serum',
    reason: 'Fades dark spots and pigmentation, boosts collagen, and restores radiance for dull/uneven skin.',
  },
  glowCream: {
    productId: '8965835129052',
    handle: 'mage-glow-360-brightening-cream',
    title: 'Mage-Glow 360° Brightening Cream',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/mageglow360brightingcream.png?v=1771254814',
    price: 'Rs. 1,399',
    shopUrl: 'https://www.dermamage.com/products/mage-glow-360-brightening-cream',
    reason: 'Multi-action brightening cream that fades pigmentation, hydrates, and restores natural radiance daily.',
  },
  foamingCleanser: {
    productId: '8965810421980',
    handle: 'mage-glow-360-brightening-foaming-cleanser',
    title: 'Mage-Glow 360° Brightening Foaming Cleanser',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0761/9064/6492/files/1_6_51c47d2d-68da-43c3-88ef-1fdc842b3fc9.png?v=1770853830',
    price: 'Rs. 1,199',
    shopUrl: 'https://www.dermamage.com/products/mage-glow-360-brightening-foaming-cleanser',
    reason: 'Brightening foaming cleanser that revives dull skin and removes impurities without stripping moisture.',
  },
};

// ---- QUIZ DATA ----
const quizData = {
  ownerId: new mongoose.Types.ObjectId(OWNER_ID),
  storeId: 'dermamage',
  title: 'Dermamage Personalised Skin Analysis',
  handle: QUIZ_HANDLE,
  status: 'published',

  theme: {
    primaryColor: '#C9A96E',       // Dermamage gold
    backgroundColor: '#1a1208',    // Deep warm dark
    textColor: '#f5f0e8',          // Warm white
    secondaryColor: '#2a1e0a',
    accentColor: '#e8c68a',
    fontFamily: 'Inter',
    borderRadius: 'rounded',
    buttonStyle: 'solid',
    shadowIntensity: 'medium',
    animationStyle: 'spring',
    progressStyle: 'bar',
    layoutMode: 'glass-morph',
  },

  startScreen: {
    enabled: true,
    title: 'Discover Your Skin\'s Perfect Routine',
    description: 'Answer 6 simple questions and our skin experts will recommend the ideal Dermamage products tailored just for you.',
    buttonText: '✨ Start My Skin Analysis',
  },

  questions: [
    {
      id: 'q1',
      type: 'single_choice',
      text: 'What is your skin type?',
      description: 'Choose the option that best describes how your skin normally feels without any products.',
      required: true,
      options: [
        { id: 'q1_a', text: '💧 Dry', tags: ['dry', 'hydration'], weights: [{ outcomeId: 'out_dry', points: 4 }, { outcomeId: 'out_combo', points: 1 }] },
        { id: 'q1_b', text: '✨ Oily', tags: ['oily', 'acne'], weights: [{ outcomeId: 'out_oily', points: 4 }, { outcomeId: 'out_combo', points: 1 }] },
        { id: 'q1_c', text: '🌿 Combination', tags: ['combination', 'oily'], weights: [{ outcomeId: 'out_combo', points: 4 }, { outcomeId: 'out_oily', points: 2 }] },
        { id: 'q1_d', text: '🌸 Sensitive', tags: ['sensitive', 'dry'], weights: [{ outcomeId: 'out_sensitive', points: 4 }, { outcomeId: 'out_dry', points: 2 }] },
        { id: 'q1_e', text: '😊 Normal / Balanced', tags: ['normal', 'balanced'], weights: [{ outcomeId: 'out_glow', points: 3 }, { outcomeId: 'out_sensitive', points: 1 }] },
      ],
    },
    {
      id: 'q2',
      type: 'single_choice',
      text: 'What is your #1 skin concern right now?',
      description: 'Don\'t overthink it — pick the one that bothers you most daily.',
      required: true,
      options: [
        { 
          id: 'q2_a', 
          text: '🌑 Dark spots & Uneven skin tone', 
          tags: ['pigmentation', 'brightening'], 
          weights: [{ outcomeId: 'out_glow', points: 4 }, { outcomeId: 'out_dry', points: 1 }],
          recommendedProducts: [{ ...PRODUCTS.vitaminCSerum, reason: 'Recommended specifically to target your dark spots and restore an even, radiant complexion.' }]
        },
        { 
          id: 'q2_b', 
          text: '💥 Acne, Breakouts & Blackheads', 
          tags: ['acne', 'oily', 'pores'], 
          weights: [{ outcomeId: 'out_oily', points: 5 }],
          recommendedProducts: [{ ...PRODUCTS.nzSerum, reason: 'Essential for you: Niacinamide targets active breakouts and balances oil immediately.' }]
        },
        { id: 'q2_c', text: '🏜️ Dryness & Flakiness', tags: ['dry', 'dryness', 'hydration'], weights: [{ outcomeId: 'out_dry', points: 5 }] },
        { id: 'q2_d', text: '🔍 Large Pores & Excess Shine', tags: ['oily', 'pores', 'combination'], weights: [{ outcomeId: 'out_oily', points: 3 }, { outcomeId: 'out_combo', points: 3 }] },
        { 
          id: 'q2_e', 
          text: '😔 Dull, Tired-looking Skin', 
          tags: ['dull', 'brightening', 'glow'], 
          weights: [{ outcomeId: 'out_glow', points: 5 }],
          recommendedProducts: [{ ...PRODUCTS.glowCream, reason: 'This specific cream is selected to revive your tired skin and bring back your natural brightness.' }]
        },
        { id: 'q2_f', text: '🌡️ Redness & Irritation', tags: ['sensitive', 'calming'], weights: [{ outcomeId: 'out_sensitive', points: 5 }] },
      ],
    },
    {
      id: 'q3',
      type: 'single_choice',
      text: 'How does your skin feel by midday?',
      description: 'Think about a typical day without any powder or touch-ups.',
      required: true,
      options: [
        { id: 'q3_a', text: 'Tight, rough & uncomfortable', tags: ['dry', 'dryness'], weights: [{ outcomeId: 'out_dry', points: 3 }] },
        { id: 'q3_b', text: 'Shiny & oily all over my face', tags: ['oily'], weights: [{ outcomeId: 'out_oily', points: 3 }] },
        { id: 'q3_c', text: 'Oily only in my T-zone (forehead & nose)', tags: ['combination'], weights: [{ outcomeId: 'out_combo', points: 3 }] },
        { id: 'q3_d', text: 'Comfortable & normal — no issues', tags: ['normal', 'balanced'], weights: [{ outcomeId: 'out_glow', points: 2 }, { outcomeId: 'out_sensitive', points: 1 }] },
        { id: 'q3_e', text: 'Easily irritated or reactive', tags: ['sensitive'], weights: [{ outcomeId: 'out_sensitive', points: 3 }] },
      ],
    },
    {
      id: 'q4',
      type: 'single_choice',
      text: 'Do you currently use sunscreen daily?',
      description: 'Be honest — this helps us build your complete routine.',
      required: true,
      options: [
        { id: 'q4_a', text: '✅ Yes, every single day', tags: ['sun-aware'], weights: [{ outcomeId: 'out_glow', points: 1 }] },
        { id: 'q4_b', text: '🌤️ Sometimes, only when going out', tags: ['sun-unaware'], weights: [{ outcomeId: 'out_oily', points: 1 }, { outcomeId: 'out_combo', points: 1 }] },
        { id: 'q4_c', text: '❌ No, I usually skip it', tags: ['sun-unaware', 'pigmentation'], weights: [{ outcomeId: 'out_glow', points: 2 }, { outcomeId: 'out_dry', points: 1 }] },
        { 
          id: 'q4_d', 
          text: '🔍 I want to start but haven\'t found one I like', 
          tags: ['oily', 'combination', 'sun-unaware'], 
          weights: [{ outcomeId: 'out_oily', points: 2 }, { outcomeId: 'out_combo', points: 2 }],
          recommendedProducts: [{ ...PRODUCTS.ultraSunblock, reason: 'Since you are looking for a sunscreen you like, this sebum-control formula is perfect for your specific profile.' }]
        },
      ],
    },
    {
      id: 'q5',
      type: 'single_choice',
      text: 'How would you describe your skin tone?',
      description: 'This helps us recommend products best suited to your natural complexion.',
      required: true,
      options: [
        { id: 'q5_a', text: '🌟 Fair / Light', tags: ['fair', 'sensitive'], weights: [{ outcomeId: 'out_sensitive', points: 1 }, { outcomeId: 'out_glow', points: 1 }] },
        { id: 'q5_b', text: '🍑 Medium / Wheatish', tags: ['medium', 'brightening'], weights: [{ outcomeId: 'out_glow', points: 2 }] },
        { id: 'q5_c', text: '🌻 Olive / Tan', tags: ['olive', 'pigmentation'], weights: [{ outcomeId: 'out_glow', points: 2 }, { outcomeId: 'out_oily', points: 1 }] },
        { id: 'q5_d', text: '🍫 Deep / Dark', tags: ['deep', 'hydration', 'pigmentation'], weights: [{ outcomeId: 'out_glow', points: 2 }, { outcomeId: 'out_dry', points: 1 }] },
      ],
    },
    {
      id: 'q6',
      type: 'single_choice',
      text: 'What is the most important outcome for you?',
      description: 'This is your skin goal — what matters most to you in the next 30 days.',
      required: true,
      options: [
        { 
          id: 'q6_a', 
          text: '✨ Brighter, more even skin tone', 
          tags: ['brightening', 'glow'], 
          weights: [{ outcomeId: 'out_glow', points: 5 }],
          recommendedProducts: [{ ...PRODUCTS.vitaminCSerum, reason: 'Your goal is brightness: High-potency Vitamin C is the #1 item to achieve this results.' }]
        },
        { 
          id: 'q6_b', 
          text: '🧊 Clear, acne-free & oil-controlled skin', 
          tags: ['acne', 'oily'], 
          weights: [{ outcomeId: 'out_oily', points: 5 }],
          recommendedProducts: [{ ...PRODUCTS.seboclar, reason: 'To achieve clear, acne-free skin, this purifying cleanser is non-negotiable for your routine.' }]
        },
        { id: 'q6_c', text: '💦 Deep hydration & plump, soft skin', tags: ['dry', 'hydration'], weights: [{ outcomeId: 'out_dry', points: 5 }] },
        { id: 'q6_d', text: '🌿 Calm, soothed & irritation-free skin', tags: ['sensitive', 'calming'], weights: [{ outcomeId: 'out_sensitive', points: 5 }] },
        { id: 'q6_e', text: '🏆 Balanced skin – not too oily, not too dry', tags: ['combination', 'balanced'], weights: [{ outcomeId: 'out_combo', points: 5 }] },
      ],
    },
  ],

  outcomes: [
    // ---- OUTCOME 1: OILY / ACNE-PRONE ----
    {
      id: 'out_oily',
      title: 'Oil Control & Acne Clear Routine',
      description: 'Your skin is producing excess oil and is prone to breakouts. This targeted routine will deep-cleanse your pores, regulate sebum production, and keep your skin matte, clear, and balanced all day.',
      tags: ['oily', 'acne', 'pores', 'combination'],
      priority: 10,
      matchingRules: { requiredTags: [] },
      recommendedProducts: [
        { ...PRODUCTS.seboclar, reason: 'Your first step: this purifying cleanser removes excess oil and buildup from pores while preventing breakouts.' },
        { ...PRODUCTS.nzSerum, reason: 'Niacinamide minimizes pores, regulates oil production, and refines your skin texture.' },
        { ...PRODUCTS.ultraSunblock, reason: 'Daily SPF protection with sebum-control technology — keeps you protected without clogging pores or causing shine.' },
      ],
    },

    // ---- OUTCOME 2: DRY / DEHYDRATED ----
    {
      id: 'out_dry',
      title: 'Deep Hydration & Barrier Repair Routine',
      description: 'Your skin is craving moisture and needs a barrier-strengthening routine. These products will lock in deep hydration, prevent dryness, and leave your skin soft, supple, and comfortable all day.',
      tags: ['dry', 'hydration', 'dryness'],
      priority: 10,
      matchingRules: { requiredTags: [] },
      recommendedProducts: [
        { ...PRODUCTS.hydra, reason: 'Rich, concentrated moisturizer that prevents dryness and repairs your skin\'s natural barrier.' },
        { ...PRODUCTS.vitaminCSerum, reason: 'Vitamin C serum hydrates while fighting dullness and improving overall skin texture.' },
        { ...PRODUCTS.foamingCleanser, reason: 'Gently cleanses without stripping moisture — the perfect first step for dry skin types.' },
      ],
    },

    // ---- OUTCOME 3: GLOW / BRIGHTENING / PIGMENTATION ----
    {
      id: 'out_glow',
      title: 'Brightening & Glow Restoration Routine',
      description: 'Your skin needs a powerful brightening boost to fight dark spots, uneven tone, and dullness. This routine uses advanced actives to reveal your brightest, most radiant complexion yet.',
      tags: ['brightening', 'glow', 'pigmentation', 'dull', 'normal'],
      priority: 10,
      matchingRules: { requiredTags: [] },
      recommendedProducts: [
        { ...PRODUCTS.vitaminCSerum, reason: 'High-potency Vitamin C fades dark spots and boosts collagen for a firmer, more luminous complexion.' },
        { ...PRODUCTS.glowCream, reason: 'Daily brightening cream that fades pigmentation and restores natural radiance effortlessly.' },
        { ...PRODUCTS.foamingCleanser, reason: 'Brightening foaming cleanser removes dullness-causing buildup and preps skin for actives.' },
      ],
    },

    // ---- OUTCOME 4: COMBINATION ----
    {
      id: 'out_combo',
      title: 'Balance & Refine Routine for Combination Skin',
      description: 'Your skin is both oily in some areas and normal-to-dry in others. This perfectly balanced routine targets shine in your T-zone while keeping the rest of your face comfortable and hydrated.',
      tags: ['combination', 'balanced', 'oily', 'normal'],
      priority: 9,
      matchingRules: { requiredTags: [] },
      recommendedProducts: [
        { ...PRODUCTS.seboclar, reason: 'Purifying cleanser that removes oil and buildup without over-drying your combination skin.' },
        { ...PRODUCTS.nzSerum, reason: 'Niacinamide serum balances oil production, minimizes pores, and evens your skin texture.' },
        { ...PRODUCTS.ultraSunblock, reason: 'Lightweight sebum-control SPF that protects without causing greasiness in your T-zone.' },
      ],
    },

    // ---- OUTCOME 5: SENSITIVE / REACTIVE ----
    {
      id: 'out_sensitive',
      title: 'Calm, Soothe & Protect Routine for Sensitive Skin',
      description: 'Your skin is reactive and needs gentle, calming care. This routine uses soothing, barrier-strengthening formulas that reduce redness, prevent irritation, and build long-term resilience.',
      tags: ['sensitive', 'calming', 'fair'],
      priority: 9,
      matchingRules: { requiredTags: [] },
      recommendedProducts: [
        { ...PRODUCTS.hydra, reason: 'Gentle, non-irritating moisturizer that strengthens the sensitive skin barrier and soothes discomfort.' },
        { ...PRODUCTS.foamingCleanser, reason: 'Mild, brightening cleanser suitable for sensitive skin — removes impurities without irritation.' },
        { ...PRODUCTS.glowCream, reason: 'Lightweight brightening cream that hydrates and calms while restoring your skin\'s natural glow.' },
      ],
    },
  ],

  settings: {
    collectEmail: true,
    showProgressBar: true,
    resultLayout: 'detailed_products',
    defaultLayout: 'modal',
    defaultAnimation: 'scale-up',
  },

  branding: {
    removeWatermark: false,
  },
};

// ---- SEED LOGIC ----
const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n🌿 Connected to MongoDB:', MONGO_URI);

    const Quiz = require('./src/models/Quiz');

    // Remove any existing quiz with the same handle
    const deleted = await Quiz.deleteOne({ handle: QUIZ_HANDLE });
    if (deleted.deletedCount > 0) {
      console.log('🗑️  Removed existing quiz with handle:', QUIZ_HANDLE);
    }

    const quiz = await Quiz.create(quizData);
    console.log('\n✅ DERMAMAGE QUIZ SEEDED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Quiz ID:     ', quiz._id.toString());
    console.log('📌 Quiz Handle: ', quiz.handle);
    console.log('📌 Questions:   ', quiz.questions.length);
    console.log('📌 Outcomes:    ', quiz.outcomes.length);
    console.log('\n🔗 Use this Quiz ID in your Shopify embed code:');
    console.log('\n   data-quiz-id="' + quiz._id.toString() + '"\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ SEEDING FAILED:\n', err);
    process.exit(1);
  }
};

seedData();
