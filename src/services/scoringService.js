/**
 * Simplified Tag-Based Scoring Service (Industry Standard)
 * 
 * Algorithm:
 * 1. Aggregate all tags from selected options
 * 2. Score each outcome based on matching tags
 * 3. Filter outcomes by required tags (if specified)
 * 4. Sort by score (desc), then priority (desc)
 * 5. Return highest scoring outcome
 */

exports.calculateOutcome = (quiz, submittedAnswers) => {
  try {
    const outcomes = quiz.outcomes || [];
    const debugLog = [];

    debugLog.push(`=== Hybrid Scoring Started ===`);
    debugLog.push(`Quiz: ${quiz.title}`);
    
    // --- STEP 1: Aggregate Selected Tags & Process Direct Weights ---
    const selectedTags = [];
    const directWeightsMap = {}; // outcomeId -> totalPoints

    submittedAnswers.forEach((ans, index) => {
      debugLog.push(`\n--- Answer #${index + 1} ---`);
      debugLog.push(`Question ID: ${ans.questionId}, Option ID: ${ans.optionId}`);

      // Find the question
      const question = quiz.questions.find(q => {
        const qId = q.id || q._id?.toString();
        return String(qId) === String(ans.questionId) || String(q._id) === String(ans.questionId);
      });

      if (!question) {
        debugLog.push(`⚠️ Question not found for ID: ${ans.questionId}`);
        return;
      }

      // Find the selected option
      const option = question.options?.find(opt => {
        const oId = opt.id || opt._id?.toString();
        return String(oId) === String(ans.optionId) || String(opt._id) === String(ans.optionId);
      });

      if (!option) {
        if (question.type !== 'multiple_choice' && question.type !== 'single_choice') {
          debugLog.push(`Text Answer: "${ans.value}"`);
        } else {
          debugLog.push(`⚠️ Option not found for ID: ${ans.optionId}`);
        }
        return;
      }

      debugLog.push(`✓ Option selected: "${option.text}"`);

      // 1. Process Tags (Affinity)
      if (option.tags && option.tags.length > 0) {
        selectedTags.push(...option.tags);
        debugLog.push(`  Tags added: [${option.tags.join(', ')}]`);
      }

      // 2. Process Weights (Direct Points)
      if (option.weights && option.weights.length > 0) {
        option.weights.forEach(w => {
          if (w.outcomeId) {
            const currentPoints = directWeightsMap[w.outcomeId] || 0;
            directWeightsMap[w.outcomeId] = currentPoints + (w.points || 0);
            debugLog.push(`  Weight: +${w.points} points to Outcome "${w.outcomeId}"`);
          }
        });
      }
    });

    const uniqueTags = [...new Set(selectedTags)];
    debugLog.push(`\n=== Aggregation Complete ===`);
    debugLog.push(`Selected Tags: [${uniqueTags.join(', ')}]`);
    debugLog.push(`Direct Weights Table: ${JSON.stringify(directWeightsMap)}`);

    // --- STEP 2: Score Each Outcome (Hybrid Logic) ---
    const scoredOutcomes = outcomes.map(outcome => {
      const outcomeId = outcome.id || outcome._id?.toString();
      
      debugLog.push(`\n--- Scoring Outcome: "${outcome.title}" ---`);
      debugLog.push(`ID: ${outcomeId} | Priority: ${outcome.priority || 0}`);

      // A. Strict Filter (Required Tags)
      const requiredTags = outcome.matchingRules?.requiredTags || [];
      if (requiredTags.length > 0) {
        const hasAllRequired = requiredTags.every(tag => selectedTags.includes(tag));
        if (!hasAllRequired) {
          const missingTags = requiredTags.filter(tag => !selectedTags.includes(tag));
          debugLog.push(`❌ DISQUALIFIED: Missing required tags [${missingTags.join(', ')}]`);
          return { outcome, outcomeId, score: -1, priority: 0, pointsFromWeights: 0, pointsFromTags: 0 };
        }
        debugLog.push(`✓ Required tags satisfied`);
      }

      // B. Hybrid Scoring
      // 1. Direct Points from Weights
      const pointsFromWeights = directWeightsMap[outcomeId] || 0;
      
      // 2. Points from Tag Affinity (1 point per match)
      const outcomeTags = outcome.tags || [];
      const matchedTags = outcomeTags.filter(tag => selectedTags.includes(tag));
      const pointsFromTags = matchedTags.length;

      const totalScore = pointsFromWeights + pointsFromTags;

      // C. Minimum Score Threshold
      const minScore = outcome.minScore || 0;
      if (totalScore < minScore) {
        debugLog.push(`❌ DISQUALIFIED: Score ${totalScore} is below threshold ${minScore}`);
        return { outcome, outcomeId, score: -1, priority: 0, pointsFromWeights, pointsFromTags };
      }

      debugLog.push(`  Points from Weights: ${pointsFromWeights}`);
      debugLog.push(`  Points from Tags: ${pointsFromTags} ([${matchedTags.join(', ')}])`);
      debugLog.push(`  Total Hybrid Score: ${totalScore}`);

      return {
        outcome,
        outcomeId,
        score: totalScore,
        pointsFromWeights,
        pointsFromTags,
        priority: outcome.priority || 0,
        matchedTags
      };
    });

    // --- STEP 3: Filter Out Disqualified & Sort ---
    const qualified = scoredOutcomes.filter(s => s.score >= 0);

    if (qualified.length === 0) {
      debugLog.push(`\n⚠️ No qualified outcomes - using fallback`);
      const fallbackOutcome = outcomes[0] || {
        title: "Analysis Complete",
        description: "Thank you for completing the quiz! We've captured your preferences."
      };
      return {
        outcomeId: fallbackOutcome._id?.toString() || fallbackOutcome.id || "fallback",
        outcome: fallbackOutcome,
        aggregatedProducts: fallbackOutcome?.recommendedProducts || [],
        scores: {},
        winReason: 'Fallback (No matches)',
        debugLog
      };
    }

    // Sort by Total Score (desc) -> Priority (desc)
    qualified.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.priority - a.priority;
    });

    debugLog.push(`\n=== Ranking ===`);
    qualified.slice(0, 5).forEach((s, i) => {
      debugLog.push(`${i + 1}. "${s.outcome.title}" - Score: ${s.score}, Priority: ${s.priority}`);
    });

    // --- STEP 5: Select Winner ---
    const winner = qualified[0];
    const winningOutcome = winner.outcome;
    
    let winReason = 'Highest Score';
    if (qualified.length > 1 && qualified[0].score === qualified[1].score) {
      winReason = 'Tie-broken by Priority';
    }

    debugLog.push(`\n=== WINNER ===`);
    debugLog.push(`🏆 "${winningOutcome.title}"`);
    debugLog.push(`Score: ${winner.score} | Priority: ${winner.priority}`);
    debugLog.push(`Reason: ${winReason}`);

    // --- STEP 6: Aggregate Products (Truly Dynamic) ---
    const aggregatedProducts = [];
    const seenProductIds = new Set();

    // 1. Add Answer-Specific Products (Add-ons based on answers)
    submittedAnswers.forEach(ans => {
      const question = quiz.questions.find(q => String(q.id || q._id) === String(ans.questionId));
      if (!question) return;

      const option = question.options?.find(opt => String(opt.id || opt._id) === String(ans.optionId));
      if (option && option.recommendedProducts && option.recommendedProducts.length > 0) {
        option.recommendedProducts.forEach(p => {
          const pId = p.productId || p.handle || p.title;
          if (!seenProductIds.has(pId)) {
            aggregatedProducts.push(p);
            seenProductIds.add(pId);
            debugLog.push(`+ Dynamic Add-on Added: "${p.title}" (from answer "${option.text}")`);
          }
        });
      }
    });

    // 2. Add Base Routine Products (from winning outcome)
    if (winningOutcome.recommendedProducts) {
      winningOutcome.recommendedProducts.forEach(p => {
        const pId = p.productId || p.handle || p.title;
        if (!seenProductIds.has(pId)) {
          aggregatedProducts.push(p);
          seenProductIds.add(pId);
        }
      });
    }

    debugLog.push(`Total Products: ${aggregatedProducts.length}`);

    // Build score map for backward compatibility
    const scoreMap = {};
    qualified.forEach(s => {
      const label = s.outcome.title || s.outcomeId;
      scoreMap[label] = s.score;
    });

    console.log("=== Scoring Debug Log ===");
    console.log(debugLog.join('\n'));

    return {
      outcomeId: winner.outcomeId,
      outcome: winningOutcome,
      aggregatedProducts,
      scores: scoreMap,
      winReason,
      debugLog
    };

  } catch (error) {
    console.error("❌ Scoring Service Error:", error);
    return {
      outcomeId: null,
      outcome: quiz.outcomes?.[0] || null,
      aggregatedProducts: [],
      scores: {},
      error: error.message,
      debugLog: [`CRASH: ${error.message}`]
    };
  }
};

