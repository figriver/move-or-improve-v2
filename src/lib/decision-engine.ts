import {
  Question,
  QuestionScoring,
  Category,
  ConditionalRule,
  ScoringConfig,
  VersionSnapshot,
  Responses,
  DecisionEngineOutput,
  Decision,
  LeanStrength,
  CategoryBreakdown,
  NAHandling,
} from '@/types';

/**
 * Decision Engine: Config-driven, NA-safe scoring
 * 
 * Formula:
 * 1. Normalize each response to [-1, 1]
 * 2. Apply conditional rules (hide/disable questions)
 * 3. Calculate per-category scores
 * 4. Apply category weights
 * 5. Compute weighted composite scores
 * 6. Determine decision & lean
 */
export class DecisionEngine {
  private config: VersionSnapshot;
  private questionsMap: Map<string, Question>;
  private scoringMap: Map<string, QuestionScoring>;
  private categoriesMap: Map<string, Category>;
  private rulesMap: Map<string, ConditionalRule[]>;

  constructor(config: VersionSnapshot) {
    this.config = config;
    
    // Build lookup maps for O(1) access
    this.questionsMap = new Map(config.questions.map(q => [q.id, q]));
    this.scoringMap = new Map(Object.entries(config.questionScoring));
    this.categoriesMap = new Map(config.categories.map(c => [c.id, c]));
    
    // Group rules by ifQuestionId
    this.rulesMap = new Map();
    for (const rule of config.conditionalRules) {
      if (!this.rulesMap.has(rule.ifQuestionId)) {
        this.rulesMap.set(rule.ifQuestionId, []);
      }
      this.rulesMap.get(rule.ifQuestionId)!.push(rule);
    }
  }

  /**
   * Main entry point: Calculate scores from responses
   */
  calculateScores(responses: Responses): DecisionEngineOutput {
    // Step 1: Apply conditional rules
    const validResponses = this.applyConditionalRules(responses);

    // Step 2: Calculate category scores
    const categoryScores = this.calculateCategoryScores(validResponses);

    // Step 3: Calculate weighted composite scores
    const { improveScore, moveScore } = this.calculateCompositeScores(categoryScores);

    // Step 4: Determine decision
    const decisionIndex = improveScore - moveScore;
    const decision = this.determineDecision(decisionIndex);

    // Step 5: Calculate lean strength
    const lean = this.calculateLean(decisionIndex);

    return {
      improveScore: Math.round(improveScore * 10000) / 10000,
      moveScore: Math.round(moveScore * 10000) / 10000,
      decisionIndex: Math.round(decisionIndex * 10000) / 10000,
      decision,
      lean,
      inNeutralZone: this.isInNeutralZone(decisionIndex),
      categoryScores,
      metadata: {
        totalQuestionsAnswered: Object.keys(validResponses).length,
        naCount: this.countNA(validResponses),
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Apply conditional rules to filter/modify responses
   */
  private applyConditionalRules(responses: Responses): Responses {
    let validResponses = { ...responses };
    let changed = true;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      for (const [questionId, rules] of this.rulesMap) {
        const triggerValue = validResponses[questionId];
        
        if (triggerValue === undefined || triggerValue === null) {
          continue;
        }

        for (const rule of rules) {
          if (!rule.isActive) continue;

          if (this.evaluateCondition(rule, triggerValue)) {
            // Apply action
            switch (rule.action) {
              case 'hide':
              case 'disable':
                for (const targetId of rule.targetQuestionIds) {
                  if (validResponses[targetId] !== undefined) {
                    delete validResponses[targetId];
                    changed = true;
                  }
                }
                break;

              case 'zero_weight':
                // Will be handled in scoring phase
                break;

              case 'change_weight':
                // Will be handled in scoring phase
                break;
            }
          }
        }
      }
    }

    return validResponses;
  }

  /**
   * Evaluate if a condition is met
   */
  private evaluateCondition(rule: ConditionalRule, value: string): boolean {
    const ruleValue = rule.value;

    switch (rule.operator) {
      case '==':
        return value === ruleValue;
      case '!=':
        return value !== ruleValue;
      case '<':
        return Number(value) < Number(ruleValue);
      case '>':
        return Number(value) > Number(ruleValue);
      case '<=':
        return Number(value) <= Number(ruleValue);
      case '>=':
        return Number(value) >= Number(ruleValue);
      case 'contains':
        return String(value).includes(ruleValue);
      case 'in':
        try {
          const values = JSON.parse(ruleValue);
          return Array.isArray(values) && values.includes(value);
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Calculate per-category scores
   */
  private calculateCategoryScores(responses: Responses): CategoryBreakdown {
    const categoryScores: CategoryBreakdown = {};

    for (const category of this.config.categories) {
      if (!category.isActive) continue;

      // Get questions in this category
      const categoryQuestions = this.config.questions.filter(
        q => q.categoryId === category.id && q.isActive
      );

      if (categoryQuestions.length === 0) {
        categoryScores[category.id] = {
          improve: 0,
          move: 0,
          count: 0,
          weight: category.defaultWeight,
        };
        continue;
      }

      let improveSum = 0;
      let moveSum = 0;
      let activeCount = 0;

      for (const question of categoryQuestions) {
        const response = responses[question.id];

        // Skip NA or missing responses
        if (response === undefined || response === null || this.isNA(response, question)) {
          continue;
        }

        // Normalize response to [-1, 1]
        const normalizedScore = this.normalizeScore(response, question);
        
        // Get scoring config for this question
        const scoring = this.scoringMap.get(question.id);
        if (!scoring) continue;

        // Apply reverse scoring if needed
        const finalScore = scoring.reverseScored ? -normalizedScore : normalizedScore;

        // Apply weights
        improveSum += finalScore * scoring.improveWeight * scoring.multiplier;
        moveSum += finalScore * scoring.moveWeight * scoring.multiplier;
        activeCount++;
      }

      // Protect against division by zero
      const denominator = activeCount > 0 ? activeCount : 1;

      categoryScores[category.id] = {
        improve: improveSum / denominator,
        move: moveSum / denominator,
        count: activeCount,
        weight: category.defaultWeight,
      };
    }

    return categoryScores;
  }

  /**
   * Calculate final composite scores
   */
  private calculateCompositeScores(categoryScores: CategoryBreakdown): {
    improveScore: number;
    moveScore: number;
  } {
    let improveSum = 0;
    let moveSum = 0;
    let enabledCategoryCount = 0;
    let totalWeight = 0;

    for (const [categoryId, scores] of Object.entries(categoryScores)) {
      if (scores.count === 0) continue; // Skip empty categories

      const weight = scores.weight || 1.0;
      improveSum += scores.improve * weight;
      moveSum += scores.move * weight;
      totalWeight += weight;
      enabledCategoryCount++;
    }

    // Determine normalizer based on equal weighting setting
    let normalizer = totalWeight;
    if (this.config.scoringConfig.equalWeighting) {
      normalizer = Math.max(enabledCategoryCount, 1);
    } else {
      normalizer = Math.max(totalWeight, 1);
    }

    // Protect against division by zero
    if (normalizer === 0) normalizer = 1;

    return {
      improveScore: improveSum / normalizer,
      moveScore: moveSum / normalizer,
    };
  }

  /**
   * Determine decision based on decision index
   */
  private determineDecision(decisionIndex: number): Decision {
    const { neutralZoneMin, neutralZoneMax } = this.config.scoringConfig;

    if (decisionIndex >= neutralZoneMin && decisionIndex <= neutralZoneMax) {
      return 'Unclear';
    }

    return decisionIndex > 0 ? 'Improve' : 'Move';
  }

  /**
   * Calculate lean strength
   */
  private calculateLean(decisionIndex: number): LeanStrength {
    const absIndex = Math.abs(decisionIndex);
    const thresholds = this.config.scoringConfig;

    if (absIndex >= thresholds.strongLeanThreshold) {
      return 'Strong';
    } else if (absIndex >= thresholds.moderateLeanThreshold) {
      return 'Moderate';
    } else if (absIndex >= thresholds.slightLeanThreshold) {
      return 'Slight';
    }

    return 'Unclear';
  }

  /**
   * Check if decision index is in neutral zone
   */
  private isInNeutralZone(decisionIndex: number): boolean {
    const { neutralZoneMin, neutralZoneMax } = this.config.scoringConfig;
    return decisionIndex >= neutralZoneMin && decisionIndex <= neutralZoneMax;
  }

  /**
   * Normalize response to [-1, 1] scale
   */
  private normalizeScore(response: string, question: Question): number {
    if (question.type === 'scale' && question.scaleMin !== undefined && question.scaleMax !== undefined) {
      const numResponse = Number(response);
      if (isNaN(numResponse)) return 0;

      const min = question.scaleMin;
      const max = question.scaleMax;
      const normalized = (numResponse - min) / (max - min);
      return normalized * 2 - 1; // Convert to [-1, 1]
    }

    if (question.type === 'numeric') {
      const numResponse = Number(response);
      if (isNaN(numResponse)) return 0;
      return Math.min(1, Math.max(-1, numResponse / 100));
    }

    if (question.type === 'yesno') {
      return response === 'yes' ? 1 : -1;
    }

    if (question.type === 'dropdown' && question.options) {
      // Find the option and use its scoreImpact if available
      const option = question.options.find(o => o.value === response);
      if (option?.scoreImpact) {
        const avgImpact = (option.scoreImpact.improve + option.scoreImpact.move) / 2;
        return Math.min(1, Math.max(-1, avgImpact));
      }
      return 0;
    }

    return 0;
  }

  /**
   * Check if response is NA
   */
  private isNA(response: string | null | undefined, question: Question): boolean {
    if (!question.allowNA) return false;
    return response === 'NA' || response === null || response === undefined;
  }

  /**
   * Count NA responses
   */
  private countNA(responses: Responses): number {
    let count = 0;
    for (const [questionId, response] of Object.entries(responses)) {
      const question = this.questionsMap.get(questionId);
      if (question && this.isNA(response as any, question)) {
        count++;
      }
    }
    return count;
  }
}
