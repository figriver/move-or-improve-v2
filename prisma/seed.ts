import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface QuestionData {
  text: string;
  type: 'scale' | 'dropdown' | 'numeric_input' | 'yes_no' | 'text_input' | 'multiple_choice';
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: Record<string, string>;
  options?: Array<{ value: string; label: string }>;
  improveWeight: number;
  moveWeight: number;
  reverseScored?: boolean;
}

async function main() {
  console.log('🌱 Seeding Move or Improve Assessment questionnaire...\n');

  // ════════════════════════════════════════════════════════════════════════════════
  // 1. ADMIN & VERSION SETUP
  // ════════════════════════════════════════════════════════════════════════════════

  const adminPassword = await bcrypt.hash('demo123456', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@moveimprove.local' },
    update: {},
    create: {
      email: 'admin@moveimprove.local',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin created: admin@moveimprove.local (password: demo123456)');

  // Create new version
  const version = await prisma.questionnaireVersion.create({
    data: {
      version: 1,
      isActive: true,
      createdBy: admin.id,
      description: 'Complete Move or Improve Assessment v1.0',
    },
  });

  console.log(`✅ Questionnaire Version ${version.version} created (ID: ${version.id})\n`);

  // ════════════════════════════════════════════════════════════════════════════════
  // 2. CREATE CATEGORIES
  // ════════════════════════════════════════════════════════════════════════════════

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        versionId: version.id,
        name: 'quick_diagnosis',
        label: 'Quick Self-Diagnosis',
        description: 'Initial assessment of primary motivations',
        defaultWeight: 0.5,
        sortOrder: 0,
      },
    }),
    prisma.category.create({
      data: {
        versionId: version.id,
        name: 'location_lifestyle',
        label: 'Location & Lifestyle Fit',
        description: 'Assessment of current location and community fit',
        defaultWeight: 1.0,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        versionId: version.id,
        name: 'attachment_moving',
        label: 'Attachment & Openness to Moving',
        description: 'Emotional attachment to home and neighborhood',
        defaultWeight: 1.0,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        versionId: version.id,
        name: 'market_timing',
        label: 'Market Context & Timing',
        description: 'Housing market conditions and readiness',
        defaultWeight: 0.8,
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        versionId: version.id,
        name: 'time_stress_disruption',
        label: 'Time, Stress & Disruption',
        description: 'Timeline and emotional impact considerations',
        defaultWeight: 1.0,
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        versionId: version.id,
        name: 'financial_analysis',
        label: 'Financial Analysis',
        description: 'Detailed financial considerations for both options',
        defaultWeight: 1.5,
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        versionId: version.id,
        name: 'financing_strategy',
        label: 'Financing Strategy',
        description: 'Financing methods and loan considerations',
        defaultWeight: 1.2,
        sortOrder: 6,
      },
    }),
  ]);

  const catMap = {
    quickDiagnosis: categories[0],
    locationLifestyle: categories[1],
    attachmentMoving: categories[2],
    marketTiming: categories[3],
    timeStressDisruption: categories[4],
    financialAnalysis: categories[5],
    financingStrategy: categories[6],
  };

  console.log('✅ Categories created (7 total)\n');

  // ════════════════════════════════════════════════════════════════════════════════
  // 3. CREATE QUESTIONS
  // ════════════════════════════════════════════════════════════════════════════════

  type QuestionMap = Record<string, string>;
  const questionMap: QuestionMap = {};
  let questionIndex = 0;

  async function createQuestion(
    categoryId: string,
    data: QuestionData,
    sortOrder: number
  ): Promise<string> {
    const question = await prisma.question.create({
      data: {
        versionId: version.id,
        categoryId,
        text: data.text,
        type: data.type,
        scaleMin: data.scaleMin,
        scaleMax: data.scaleMax,
        scaleLabels: data.scaleLabels,
        options: data.options
          ? JSON.stringify(data.options.map((opt) => ({ value: opt.value, label: opt.label })))
          : undefined,
        allowNA: true,
        sortOrder,
      },
    });

    // Create scoring
    await prisma.questionScoring.create({
      data: {
        questionId: question.id,
        improveWeight: data.improveWeight,
        moveWeight: data.moveWeight,
        multiplier: 1.0,
        reverseScored: data.reverseScored || false,
      },
    });

    questionMap[`Q${++questionIndex}`] = question.id;
    return question.id;
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // QUICK SELF-DIAGNOSIS (1 multi-select question)
  // ────────────────────────────────────────────────────────────────────────────────

  console.log('Creating: Quick Self-Diagnosis...');

  await createQuestion(catMap.quickDiagnosis.id, {
    text: "What's your primary reason for considering moving or renovating?",
    type: 'dropdown',
    options: [
      { value: 'family_size', label: 'Family size has changed' },
      { value: 'school_district', label: 'School district is inadequate' },
      { value: 'commute', label: 'Commute is too long' },
      { value: 'remodel_process', label: "You don't enjoy the remodeling process" },
      { value: 'neighborhood', label: "You don't like your neighborhood" },
      { value: 'floor_plan', label: 'Home has a bad floor plan' },
      { value: 'yard_outdoor', label: "You don't like your yard/outdoor space" },
      { value: 'remodel_costs', label: 'Remodeling costs are too high' },
      { value: 'home_largest', label: "Your home is already the largest/nicest in the neighborhood" },
      { value: 'move_anyway', label: "You're likely to move in the next few years anyway" },
      { value: 'other', label: 'Other' },
    ],
    improveWeight: 0.3,
    moveWeight: 0.7,
  }, 1);

  console.log('  ✓ 1 question created\n');

  // ────────────────────────────────────────────────────────────────────────────────
  // SECTION 1: LOCATION & LIFESTYLE FIT (21 questions)
  // ────────────────────────────────────────────────────────────────────────────────

  console.log('Creating: Location & Lifestyle Fit (21 questions)...');

  const locationQuestions: QuestionData[] = [
    {
      text: 'How safe do you feel in your current neighborhood? (1=Very Unsafe, 10=Very Safe)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Very Unsafe', '10': 'Very Safe' },
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
    {
      text: 'How satisfied are you with your current school district?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Very Dissatisfied', '10': 'Very Satisfied' },
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'Could your home floor plan be adequately modified to meet your needs?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Is your neighborhood improving and becoming more desirable?',
      type: 'yes_no',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Are there zoning or HOA restrictions that limit renovation options?',
      type: 'yes_no',
      improveWeight: 0.3,
      moveWeight: 0.7,
      reverseScored: true,
    },
    {
      text: 'How satisfied are you with your commute? (1=Very Dissatisfied, 10=Very Satisfied)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Very Dissatisfied', '10': 'Very Satisfied' },
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
    {
      text: 'Are there good schools nearby (if relevant to your family)?',
      type: 'yes_no',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'Is your property size adequate for your needs?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Is the indoor living space (bedrooms, bathrooms, kitchen) adequate?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Are you satisfied with your yard and outdoor space?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'How is the overall condition of your property? (1=Poor, 10=Excellent)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Poor', '10': 'Excellent' },
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Are utility costs (electricity, gas, water) reasonable compared to other homes?',
      type: 'yes_no',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'How modern are the systems in your home (HVAC, plumbing, electrical)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Very Outdated', '10': 'Very Modern' },
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Do you find the neighborhood appealing and walkable?',
      type: 'yes_no',
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
    {
      text: 'Are there adequate local amenities (restaurants, shops, parks)?',
      type: 'yes_no',
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
    {
      text: 'Do you believe the neighborhood will continue growing and improving?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Is the real estate market in your area healthy (not declining)?',
      type: 'yes_no',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Are there homes in your neighborhood similar to yours in age and style?',
      type: 'yes_no',
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
    {
      text: 'Does your home align with your long-term lifestyle goals?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Could renovations significantly improve your home appeal and value?',
      type: 'yes_no',
      improveWeight: 0.9,
      moveWeight: 0.1,
    },
    {
      text: 'Do you feel your home fits the overall neighborhood aesthetic?',
      type: 'yes_no',
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
  ];

  for (let i = 0; i < locationQuestions.length; i++) {
    await createQuestion(catMap.locationLifestyle.id, locationQuestions[i], i + 1);
  }

  console.log(`  ✓ ${locationQuestions.length} questions created\n`);

  // ────────────────────────────────────────────────────────────────────────────────
  // SECTION 2: ATTACHMENT & OPENNESS TO MOVING (12 questions)
  // ────────────────────────────────────────────────────────────────────────────────

  console.log('Creating: Attachment & Openness to Moving (12 questions)...');

  const attachmentQuestions: QuestionData[] = [
    {
      text: 'How open are you to the idea of moving? (1=Not Open, 10=Very Open)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Open', '10': 'Very Open' },
      improveWeight: 0.2,
      moveWeight: 0.8,
    },
    {
      text: 'Do you feel emotionally attached to your neighborhood?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Do you feel emotionally attached to your home itself?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Would you enjoy the process of renovating your home?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'How stressed would moving make you? (1=Not Stressed, 10=Very Stressed)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Stressed', '10': 'Very Stressed' },
      improveWeight: 0.5,
      moveWeight: 0.5,
      reverseScored: true,
    },
    {
      text: 'Have you lived in your home for a significant period (10+ years)?',
      type: 'yes_no',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Do you have deep community roots (friends, activities, involvement)?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'How well would your family tolerate moving disruption? (1=Poor, 10=Excellent)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Poor', '10': 'Excellent' },
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
    {
      text: 'Does your family prefer to stay in this area long-term?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Do you plan to stay in your home 10+ more years if you renovate?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Do you feel connected to your neighbors and local community?',
      type: 'yes_no',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Do you take pride in your home and want to maintain it?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
  ];

  for (let i = 0; i < attachmentQuestions.length; i++) {
    await createQuestion(catMap.attachmentMoving.id, attachmentQuestions[i], i + 1);
  }

  console.log(`  ✓ ${attachmentQuestions.length} questions created\n`);

  // ────────────────────────────────────────────────────────────────────────────────
  // SECTION 3: MARKET CONTEXT & TIMING (6 questions)
  // ────────────────────────────────────────────────────────────────────────────────

  console.log('Creating: Market Context & Timing (6 questions)...');

  const marketQuestions: QuestionData[] = [
    {
      text: 'Is your current home in a market where you could sell quickly?',
      type: 'yes_no',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'Is there buyer interest in homes like yours in your area?',
      type: 'yes_no',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'Is inventory in your market low (indicating good selling opportunity)?',
      type: 'yes_no',
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
    {
      text: 'How confident are you about your moving timeline? (1=Not Confident, 10=Very Confident)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Confident', '10': 'Very Confident' },
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
    {
      text: 'Do you plan to stay in your current location long-term (10+ years)?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Is the housing market in your area currently favorable for sellers?',
      type: 'yes_no',
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
  ];

  for (let i = 0; i < marketQuestions.length; i++) {
    await createQuestion(catMap.marketTiming.id, marketQuestions[i], i + 1);
  }

  console.log(`  ✓ ${marketQuestions.length} questions created\n`);

  // ────────────────────────────────────────────────────────────────────────────────
  // SECTION 4: TIME, STRESS & DISRUPTION (~18 questions)
  // ────────────────────────────────────────────────────────────────────────────────

  console.log('Creating: Time, Stress & Disruption (18 questions)...');

  const timeStressQuestions: QuestionData[] = [
    // Moving subsection
    {
      text: 'How many weeks can you dedicate to preparing for a move?',
      type: 'numeric_input',
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
    {
      text: 'How stressful would moving be for you? (1=Not Stressful, 10=Very Stressful)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Stressful', '10': 'Very Stressful' },
      improveWeight: 0.4,
      moveWeight: 0.6,
      reverseScored: true,
    },
    {
      text: 'Would moving cause significant family disruption?',
      type: 'yes_no',
      improveWeight: 0.4,
      moveWeight: 0.6,
      reverseScored: true,
    },
    {
      text: 'Do you have adequate temporary housing options if needed?',
      type: 'yes_no',
      improveWeight: 0.3,
      moveWeight: 0.7,
    },

    // Renovating subsection
    {
      text: 'How many weeks would renovation realistically take?',
      type: 'numeric_input',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'How stressful would the renovation process be? (1=Not Stressful, 10=Very Stressful)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Stressful', '10': 'Very Stressful' },
      improveWeight: 0.7,
      moveWeight: 0.3,
      reverseScored: true,
    },
    {
      text: 'Can your family tolerate living in the home during renovation?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Have you identified reliable contractors for renovation work?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },

    // General disruption
    {
      text: 'Are you concerned about cost overruns in any project?',
      type: 'yes_no',
      improveWeight: 0.5,
      moveWeight: 0.5,
      reverseScored: true,
    },
    {
      text: 'How confident are you in your project timeline? (1=Not Confident, 10=Very Confident)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Confident', '10': 'Very Confident' },
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Is contractor availability adequate in your area?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Do you have adequate cash reserves for unexpected expenses?',
      type: 'yes_no',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Would temporary housing be needed during renovations?',
      type: 'yes_no',
      improveWeight: 0.4,
      moveWeight: 0.6,
      reverseScored: true,
    },
    {
      text: 'How comfortable are you managing a complex project? (1=Not Comfortable, 10=Very Comfortable)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Comfortable', '10': 'Very Comfortable' },
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Are you satisfied with financing options available for renovation?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Have you experienced home renovation before?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Would your family be disrupted by construction and noise?',
      type: 'yes_no',
      improveWeight: 0.5,
      moveWeight: 0.5,
      reverseScored: true,
    },
    {
      text: 'Do you have a clear vision for your renovation goals?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
  ];

  for (let i = 0; i < timeStressQuestions.length; i++) {
    await createQuestion(catMap.timeStressDisruption.id, timeStressQuestions[i], i + 1);
  }

  console.log(`  ✓ ${timeStressQuestions.length} questions created\n`);

  // ────────────────────────────────────────────────────────────────────────────────
  // SECTION 5: FINANCIAL ANALYSIS (~30 questions)
  // ────────────────────────────────────────────────────────────────────────────────

  console.log('Creating: Financial Analysis (30 questions)...');

  const financialQuestions: QuestionData[] = [
    // Current home assessment
    {
      text: 'What is the estimated current value of your home?',
      type: 'numeric_input',
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
    {
      text: 'What is your remaining mortgage balance?',
      type: 'numeric_input',
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
    {
      text: 'What percentage of your home do you own (equity)?',
      type: 'numeric_input',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'How much do you need to spend to achieve your renovation goals?',
      type: 'numeric_input',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'What price do you estimate for selling your current home?',
      type: 'numeric_input',
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
    {
      text: 'What percentage of selling price will costs (commission, closing) consume?',
      type: 'numeric_input',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },

    // Move scenario
    {
      text: 'What price range are you targeting for a new home?',
      type: 'numeric_input',
      improveWeight: 0.2,
      moveWeight: 0.8,
    },
    {
      text: 'What percentage down payment can you make on a new home?',
      type: 'numeric_input',
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
    {
      text: 'How much would your monthly mortgage payment increase/decrease?',
      type: 'numeric_input',
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
    {
      text: 'What will new property taxes be monthly/annually?',
      type: 'numeric_input',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'What are estimated home insurance costs in new location?',
      type: 'numeric_input',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },

    // Expense comparison
    {
      text: 'What are current monthly utility costs?',
      type: 'numeric_input',
      improveWeight: 0.5,
      moveWeight: 0.5,
    },
    {
      text: 'What are estimated utilities in a new home?',
      type: 'numeric_input',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'What are current annual maintenance costs?',
      type: 'numeric_input',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'What are estimated maintenance costs in a new home?',
      type: 'numeric_input',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'What other monthly expenses would change (HOA, parking, etc)?',
      type: 'numeric_input',
      improveWeight: 0.4,
      moveWeight: 0.6,
    },

    // Financial comfort & reserves
    {
      text: 'How much liquid savings do you have for emergencies?',
      type: 'numeric_input',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'How comfortable are you with debt financing? (1=Not Comfortable, 10=Very Comfortable)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Comfortable', '10': 'Very Comfortable' },
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Is there flexibility in your monthly budget for unexpected costs?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'How concerned are you about cost surprises? (1=Not Concerned, 10=Very Concerned)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Concerned', '10': 'Very Concerned' },
      improveWeight: 0.5,
      moveWeight: 0.5,
      reverseScored: true,
    },

    // ROI & value considerations
    {
      text: 'How important is ROI (return on investment) for your decision?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Important', '10': 'Very Important' },
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Do you expect renovations to significantly increase home value?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Would a new home appreciate faster than your current area?',
      type: 'yes_no',
      improveWeight: 0.3,
      moveWeight: 0.7,
    },
    {
      text: 'How important is it to live in an appreciating market?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Important', '10': 'Very Important' },
      improveWeight: 0.4,
      moveWeight: 0.6,
    },
    {
      text: 'Can you comfortably afford your preferred option without financial strain?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'How confident are you in your financial analysis? (1=Not Confident, 10=Very Confident)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Confident', '10': 'Very Confident' },
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Have you modeled out both scenarios (move vs renovate) financially?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
  ];

  for (let i = 0; i < financialQuestions.length; i++) {
    await createQuestion(catMap.financialAnalysis.id, financialQuestions[i], i + 1);
  }

  console.log(`  ✓ ${financialQuestions.length} questions created\n`);

  // ────────────────────────────────────────────────────────────────────────────────
  // SECTION 6: FINANCING STRATEGY (~15 questions)
  // ────────────────────────────────────────────────────────────────────────────────

  console.log('Creating: Financing Strategy (15 questions)...');

  const financingQuestions: QuestionData[] = [
    {
      text: 'What financing method are you considering for renovation?',
      type: 'dropdown',
      options: [
        { value: 'cash', label: 'Cash (no financing)' },
        { value: 'heloc', label: 'HELOC (Home Equity Line of Credit)' },
        { value: 'personal_loan', label: 'Personal Loan' },
        { value: 'refinance', label: 'Refinance Mortgage' },
        { value: 'construction_loan', label: 'Construction Loan' },
        { value: 'savings', label: 'Savings + some financing' },
        { value: 'unsure', label: 'Unsure' },
      ],
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'What percentage of renovation will you pay in cash?',
      type: 'numeric_input',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Is a HELOC available and suitable for you?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Would refinancing your mortgage be a viable option?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Are you considering a construction loan for staged work?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'How much would monthly payments increase with new financing?',
      type: 'numeric_input',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Can you comfortably afford increased monthly payments?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'How important is locking in a low interest rate?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Important', '10': 'Very Important' },
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Is your credit score strong enough for favorable terms?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'Would you prefer a fixed-rate or variable-rate loan?',
      type: 'dropdown',
      options: [
        { value: 'fixed', label: 'Fixed-rate (stable, higher initial rate)' },
        { value: 'variable', label: 'Variable-rate (lower initial, but variable)' },
        { value: 'unsure', label: 'Unsure' },
      ],
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'How long do you plan to keep the loan (years)?',
      type: 'numeric_input',
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Are you comfortable with a shorter loan term (higher payments)?',
      type: 'yes_no',
      improveWeight: 0.7,
      moveWeight: 0.3,
    },
    {
      text: 'How important is payment flexibility and adjustment options?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { '1': 'Not Important', '10': 'Very Important' },
      improveWeight: 0.6,
      moveWeight: 0.4,
    },
    {
      text: 'Have you compared rates from multiple lenders?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
    {
      text: 'Do you understand all terms and fees associated with your financing?',
      type: 'yes_no',
      improveWeight: 0.8,
      moveWeight: 0.2,
    },
  ];

  for (let i = 0; i < financingQuestions.length; i++) {
    await createQuestion(catMap.financingStrategy.id, financingQuestions[i], i + 1);
  }

  console.log(`  ✓ ${financingQuestions.length} questions created\n`);

  // ════════════════════════════════════════════════════════════════════════════════
  // 4. CREATE OUTCOMES
  // ════════════════════════════════════════════════════════════════════════════════

  console.log('Creating: Outcomes (6 total)...');

  const outcomes = [
    {
      name: 'strong_renovate',
      label: 'Strong Renovate',
      description:
        'Your situation strongly favors renovating. Your home has good bones, you love your location, and the financial case for staying is compelling.',
    },
    {
      name: 'strong_move',
      label: 'Strong Move',
      description:
        'Your situation strongly favors moving. Your current home/location is misaligned with your needs, and finding a better fit is the best path forward.',
    },
    {
      name: 'renovate_refine',
      label: 'Renovate but Refine Your Plan',
      description:
        'Renovation is the right direction, but you need a clearer plan. Focus on prioritizing which renovations matter most and getting detailed quotes.',
    },
    {
      name: 'move_guardrails',
      label: 'Move but With Clear Guardrails',
      description:
        'Moving makes sense, but success depends on careful execution. Establish clear criteria for your new home and be disciplined in your search.',
    },
    {
      name: 'true_fork',
      label: 'At a True Fork - Need More Information',
      description:
        'Both options have merit in your situation. Before deciding, gather more information on one or more key factors (financial analysis, market conditions, contractor quotes).',
    },
    {
      name: 'not_ready',
      label: 'Not Ready to Decide Yet',
      description:
        'You may not have enough clarity or stability to make this decision right now. Consider revisiting this assessment in 6-12 months when circumstances may be clearer.',
    },
  ];

  console.log(`  ✓ ${outcomes.length} outcomes registered\n`);

  // ════════════════════════════════════════════════════════════════════════════════
  // 5. CREATE SCORING CONFIG
  // ════════════════════════════════════════════════════════════════════════════════

  console.log('Creating: Scoring Configuration...');

  await prisma.scoringConfig.create({
    data: {
      versionId: version.id,
      equalWeighting: true,
      neutralZoneMin: -0.5,
      neutralZoneMax: 0.5,
      strongLeanThreshold: 1.5,
      moderateLeanThreshold: 0.75,
      slightLeanThreshold: 0.3,
      naHandling: 'EXCLUDE_FROM_DENOMINATOR',
    },
  });

  console.log('  ✓ Scoring config created\n');

  // ════════════════════════════════════════════════════════════════════════════════
  // SUMMARY & REPORT
  // ════════════════════════════════════════════════════════════════════════════════

  const totalQuestions = 1 + locationQuestions.length + attachmentQuestions.length +
    marketQuestions.length + timeStressQuestions.length + financialQuestions.length +
    financingQuestions.length;

  console.log('═'.repeat(80));
  console.log('✅ DATABASE SEEDING COMPLETE');
  console.log('═'.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   • Questionnaire Version: ${version.version} (ID: ${version.id})`);
  console.log(`   • Status: Active/Published ✓`);
  console.log(`   • Total Questions: ${totalQuestions}`);
  console.log(`   • Total Outcomes: ${outcomes.length}`);
  console.log(`   • Total Categories: ${categories.length}`);
  console.log(`\n📋 Question Breakdown:`);
  console.log(`   • Quick Self-Diagnosis: 1`);
  console.log(`   • Location & Lifestyle Fit: ${locationQuestions.length}`);
  console.log(`   • Attachment & Openness to Moving: ${attachmentQuestions.length}`);
  console.log(`   • Market Context & Timing: ${marketQuestions.length}`);
  console.log(`   • Time, Stress & Disruption: ${timeStressQuestions.length}`);
  console.log(`   • Financial Analysis: ${financialQuestions.length}`);
  console.log(`   • Financing Strategy: ${financingQuestions.length}`);
  console.log(`\n🎯 Outcomes Available:`);
  outcomes.forEach((o) => console.log(`   • ${o.label}`));
  console.log(`\n🔑 Admin Credentials:`);
  console.log(`   Email: admin@moveimprove.local`);
  console.log(`   Password: demo123456`);
  console.log(`\n✨ Next Steps:`);
  console.log(`   1. npm run dev (start development server)`);
  console.log(`   2. Visit http://localhost:3000/api/quiz/start to test`);
  console.log(`   3. Admin panel: http://localhost:3000/admin/login`);
  console.log('\n' + '═'.repeat(80));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
