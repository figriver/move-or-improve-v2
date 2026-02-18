export function calculateScore(answers) {
  // Section 1: Location & Lifestyle scores
  const locationIssues = [
    10 - answers.s1_q1, // Low safety feeling = problem
    10 - answers.s1_q2, // Hard to fix safety = problem
    answers.s1_q3, // Environmental issues = problem
    10 - answers.s1_q4, // Hard to mitigate = problem
    answers.s1_q5, // Negative location impact = problem
    10 - answers.s1_q6, // Hard to improve without moving = problem
    10 - answers.s1_q7, // Poor school district = problem
    10 - answers.s1_q8, // Hard to meet educational needs = problem
  ].filter(v => v !== undefined);

  const locationScore = locationIssues.length > 0 
    ? Math.round(locationIssues.reduce((a, b) => a + b) / locationIssues.length)
    : 5;

  // How fixable through renovation
  const propertyTypeScore = answers.s1_q10 || 5;
  const propertyModifiableScore = answers.s1_q11 || 5;
  const floorPlanScore = answers.s1_q12 || 5;
  
  let floorPlanFixability = 7; // Default
  if (answers.s1_q13 === 'Easily fixable') floorPlanFixability = 9;
  if (answers.s1_q13 === 'Moderately fixable') floorPlanFixability = 6;
  if (answers.s1_q13 === 'Very difficult') floorPlanFixability = 3;
  if (answers.s1_q13 === 'Not fixable') floorPlanFixability = 1;

  const yardScore = answers.s1_q14 || 5;
  let yardFixability = 5; // Default
  if (answers.s1_q15 === 'Yes, easily') yardFixability = 8;
  if (answers.s1_q15 === 'Yes, with effort') yardFixability = 5;
  if (answers.s1_q15 === 'No, would need different property') yardFixability = 2;

  const fixableScore = Math.round(
    (propertyTypeScore + propertyModifiableScore + floorPlanScore + 
     floorPlanFixability + yardScore + yardFixability) / 6
  );

  // Neighborhood concerns
  const neighborhoodSatisfaction = answers.s1_q16 || 5;
  const fitWithCharacter = answers.s1_q17 || 5;
  const overImprovementConcern = answers.s1_q18 || 5;

  // Section 2: Attachment & Openness
  const openToMoving = answers.s2_q1 === 'Yes' ? 8 : 2;
  const likeNeighborhood = answers.s2_q2 || 5;
  const attachedToNeighborhood = answers.s2_q3 || 5;
  const otherNeighborhoodsWork = answers.s2_q4 || 5;
  const attachedToHome = answers.s2_q6 || 5;
  const preferStay = answers.s2_q7 || 5;
  const wouldStayIfIdeal = answers.s2_q8 === 'Yes' ? 8 : 3;
  const enjoyRenovationProcess = answers.s2_q9 || 5;
  const confidentBuyingNew = answers.s2_q10 || 5;
  const hadRegrets = answers.s2_q11 === 'Yes' ? 2 : 5;

  const attachmentScore = Math.round(
    (attachedToNeighborhood + attachedToHome + preferStay + wouldStayIfIdeal) / 4
  );

  const opennessScore = Math.round(
    (openToMoving + otherNeighborhoodsWork + confidentBuyingNew + hadRegrets) / 4
  );

  // Determine recommendation type
  let type = 'uncertain';
  let reasoning = [];

  // Logic: 
  // High location problems + Low fixability → MOVE
  // Low location problems + High fixability + High attachment → RENOVATE
  // Not open to moving + Issues fixable → RENOVATE
  // Open to moving + Low attachment + Low fixability → MOVE
  // Mixed signals → UNCERTAIN

  const hasSignificantLocationIssues = locationScore > 6;
  const isEasyToFix = fixableScore > 6;
  const isHighlyAttached = attachmentScore > 6;
  const isOpenToMoving = opennessScore > 5;
  const enjoysRenovation = enjoyRenovationProcess > 5;

  if (!isOpenToMoving && isEasyToFix) {
    type = 'renovate';
    reasoning = [
      'You\'re not open to moving, which simplifies the decision',
      'Your issues appear fixable through renovation',
      'Staying in place preserves your neighborhood attachment'
    ];
  } else if (hasSignificantLocationIssues && !isEasyToFix) {
    type = 'move';
    reasoning = [
      'Your core issues are location-based, not fixable by renovation',
      'Attempting to fix location problems through renovation risks expensive regret',
      'Moving addresses the fundamental problem'
    ];
  } else if (!hasSignificantLocationIssues && isEasyToFix && isHighlyAttached && enjoysRenovation) {
    type = 'renovate';
    reasoning = [
      'Your location works well for you',
      'Your home\'s issues are solvable through thoughtful design',
      'You\'re emotionally attached to your home and neighborhood',
      'You enjoy the renovation process'
    ];
  } else if (isOpenToMoving && !isHighlyAttached && !enjoysRenovation) {
    type = 'move';
    reasoning = [
      'You\'re open to moving and not strongly anchored to your current home',
      'You don\'t enjoy the renovation process',
      'A fresh-start approach aligns with your preferences'
    ];
  } else if (!hasSignificantLocationIssues && isEasyToFix && isHighlyAttached && !enjoysRenovation) {
    type = 'renovate';
    reasoning = [
      'Your location and home are working for you emotionally',
      'Your issues are fixable through renovation',
      'Despite not enjoying the process, staying is the stronger choice financially and emotionally'
    ];
  } else {
    type = 'uncertain';
    reasoning = [
      'Your situation doesn\'t clearly favor one path over the other',
      'You may benefit from clarifying specific priorities or getting professional input',
      'Both moving and renovating could work—it depends on variables you haven\'t fully pinned down'
    ];
  }

  // Generate headline and message based on type
  let headline, message, nextSteps;

  if (type === 'renovate') {
    headline = 'Your Best Path: Renovate and Stay Put';
    message = `Your assessment reveals that your location and neighborhood are working well. The issues you're facing are rooted in how the house functions and how space flows. These are exactly the problems that thoughtful design and skilled construction can solve. Financially and emotionally, investing in your current home is the more strategic choice.`;
    nextSteps = 'Define your non-negotiables, gather cost estimates, and schedule a consultation with a reputable design-build firm to explore feasibility and creative solutions.';
  } else if (type === 'move') {
    headline = 'Your Best Path: Plan a Move';
    message = `Your assessment indicates that your biggest challenges are rooted in factors that renovation fundamentally cannot solve—whether location, commute, schools, or property constraints. Trying to force a renovation when the core problem is unfixable leads to expensive regret. A move addresses the real issue.`;
    nextSteps = 'Define your target home and neighborhood, calculate true costs including all transaction expenses, research inventory in your target area, and connect with a trusted real estate agent.';
  } else {
    headline = 'You\'re at a True Fork in the Road';
    message = `Your responses don't clearly favor moving or renovating. Either option could work depending on how certain unknowns resolve. This is valuable: your next step is removing uncertainty in 1-2 critical areas so the better choice becomes clear.`;
    nextSteps = 'Clarify your time horizon (3-5 years vs. 10-15+ years), resolve any external uncertainties (job, schools, family), get professional cost estimates, and firm up your financial picture.';
  }

  return {
    type,
    headline,
    message,
    reasoning,
    nextSteps,
    locationScore,
    attachmentScore,
    opennessScore,
    fixableScore
  };
}
