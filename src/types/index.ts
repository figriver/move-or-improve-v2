// ════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ════════════════════════════════════════════════════════════════════════════════

export type QuestionType = 'scale' | 'dropdown' | 'numeric' | 'yesno';

export type ConditionOperator = '==' | '!=' | '<' | '>' | '<=' | '>=' | 'contains' | 'in';

export type ConditionalAction = 'hide' | 'disable' | 'zero_weight' | 'change_weight';

export type Decision = 'Improve' | 'Move' | 'Unclear';

export type LeanStrength = 'Strong' | 'Moderate' | 'Slight' | 'Unclear';

export type NAHandling = 'exclude_from_denominator' | 'treat_as_neutral';

// ════════════════════════════════════════════════════════════════════════════════
// DOMAIN MODELS
// ════════════════════════════════════════════════════════════════════════════════

export interface QuestionnaireVersion {
  id: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  description?: string;
  updatedAt: Date;
}

export interface Category {
  id: string;
  versionId: string;
  name: string;
  label: string;
  description?: string;
  defaultWeight: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScaleLabels {
  [key: string]: string;
}

export interface DropdownOption {
  value: string;
  label: string;
  scoreImpact?: {
    improve: number;
    move: number;
  };
  isNA?: boolean;
}

export interface Question {
  id: string;
  versionId: string;
  categoryId: string;
  text: string;
  type: QuestionType;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: ScaleLabels;
  options?: DropdownOption[];
  allowNA: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionScoring {
  id: string;
  questionId: string;
  improveWeight: number;
  moveWeight: number;
  multiplier: number;
  reverseScored: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConditionalRule {
  id: string;
  versionId: string;
  ifQuestionId: string;
  operator: ConditionOperator;
  value: string;
  action: ConditionalAction;
  targetQuestionId?: string;
  targetQuestionIds: string[];
  weightOverride?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoringConfig {
  id: string;
  versionId: string;
  equalWeighting: boolean;
  neutralZoneMin: number;
  neutralZoneMax: number;
  strongLeanThreshold: number;
  moderateLeanThreshold: number;
  slightLeanThreshold: number;
  naHandling: NAHandling;
  createdAt: Date;
  updatedAt: Date;
}

export interface VersionSnapshot {
  version: number;
  isActive: boolean;
  categories: Category[];
  questions: Question[];
  questionScoring: Record<string, QuestionScoring>;
  conditionalRules: ConditionalRule[];
  scoringConfig: ScoringConfig;
}

// ════════════════════════════════════════════════════════════════════════════════
// RESPONSE & SCORING TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface ResponseSession {
  id: string;
  versionId: string;
  createdAt: Date;
  completedAt?: Date;
  userMeta?: Record<string, any>;
}

export interface ResponseAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  value?: string;
  isNA: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Responses {
  [questionId: string]: string | null | undefined;
}

export interface CategoryScore {
  improve: number;
  move: number;
  count: number;
  weight: number;
}

export interface CategoryBreakdown {
  [categoryId: string]: CategoryScore;
}

export interface ScoreResult {
  id: string;
  sessionId: string;
  improveComposite: number;
  moveComposite: number;
  decisionIndex: number;
  decision: Decision;
  leanStrength: LeanStrength;
  categoryBreakdown: CategoryBreakdown;
  metadata?: {
    naCount: number;
    questionsAnswered: number;
    timestamp: string;
  };
  createdAt: Date;
}

export interface DecisionEngineOutput {
  improveScore: number;
  moveScore: number;
  decisionIndex: number;
  decision: Decision;
  lean: LeanStrength;
  inNeutralZone: boolean;
  categoryScores: CategoryBreakdown;
  metadata: {
    totalQuestionsAnswered: number;
    naCount: number;
    timestamp: string;
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// ADMIN TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface Admin {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'EDITOR';
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AdminSession {
  admin: Admin;
  token: string;
  expiresAt: Date;
}

export type VersionChangeType =
  | 'question_added'
  | 'question_edited'
  | 'question_deleted'
  | 'category_added'
  | 'category_edited'
  | 'category_deleted'
  | 'weight_updated'
  | 'threshold_updated'
  | 'rule_added'
  | 'rule_edited'
  | 'rule_deleted'
  | 'version_activated'
  | 'version_rollback';

export interface VersionHistory {
  id: string;
  versionNumber: number;
  createdAt: Date;
  createdBy: string;
  changeType: VersionChangeType;
  description: string;
  configSnapshot: VersionSnapshot;
  previousVersionId?: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// API TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface CreateQuestionRequest {
  categoryId: string;
  text: string;
  type: QuestionType;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: ScaleLabels;
  options?: DropdownOption[];
  allowNA?: boolean;
  scoring?: Omit<QuestionScoring, 'id' | 'questionId' | 'createdAt' | 'updatedAt'>;
  sortOrder?: number;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  id: string;
}

export interface CreateCategoryRequest {
  name: string;
  label: string;
  description?: string;
  defaultWeight?: number;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

export interface CreateConditionalRuleRequest {
  ifQuestionId: string;
  operator: ConditionOperator;
  value: string;
  action: ConditionalAction;
  targetQuestionIds?: string[];
  weightOverride?: number;
  sortOrder?: number;
}

export interface UpdateConditionalRuleRequest extends Partial<CreateConditionalRuleRequest> {
  id: string;
}

export interface CreateResponseSessionRequest {
  userMeta?: Record<string, any>;
}

export interface SubmitAnswersRequest {
  sessionId: string;
  answers: Responses;
}

export interface ActivateVersionRequest {
  versionId: string;
}

export interface RollbackVersionRequest {
  toVersion: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// FORM TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface QuestionFormState {
  categoryId: string;
  text: string;
  type: QuestionType;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: ScaleLabels;
  options?: DropdownOption[];
  allowNA: boolean;
  improveWeight: number;
  moveWeight: number;
  multiplier: number;
  reverseScored: boolean;
  sortOrder: number;
}

export interface CategoryFormState {
  name: string;
  label: string;
  description?: string;
  defaultWeight: number;
  sortOrder: number;
}

export interface ConditionalRuleFormState {
  ifQuestionId: string;
  operator: ConditionOperator;
  value: string;
  action: ConditionalAction;
  targetQuestionIds: string[];
  weightOverride?: number;
  sortOrder: number;
}
