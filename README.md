# Move or Improve Assessment - MVP

A decision-support tool to help homeowners determine whether they should move or renovate their current home.

## Quick Start

```bash
npm install
npm start
```

Opens on http://localhost:3000

## What's Included (MVP)

- **Section 1: Location & Lifestyle Fit** (18 questions)
  - Safety, commute, schools, property type, floor plan, yard
  - Scoring: How solvable are these issues without moving?

- **Section 2: Attachment & Openness to Moving** (11 questions)
  - Emotional attachment to home and neighborhood
  - Willingness and confidence about moving
  - Preference for renovation vs. move

- **Scoring Algorithm**
  - Calculates 4 key scores: Location issues, Fixability, Attachment, Openness
  - Generates one of 3 outcomes: RENOVATE, MOVE, UNCERTAIN

- **Results Page**
  - Personalized recommendation with reasoning
  - Score breakdown
  - Next steps tailored to recommendation

- **LocalStorage**
  - Auto-saves answers, survive browser close/reload

## Current Limitations (MVP)

- ❌ No financial calculations (Sections 3-6)
- ❌ No HubSpot integration yet
- ❌ No styling/branding (functional only)
- ❌ Scoring algorithm is simplified (can refine after testing)

## Next Steps

1. **Test the scoring** — Run through with real scenarios, see if recommendations feel right
2. **Add Sections 3-6** — Market context, time/stress, financial analysis, financing strategy
3. **Refine scoring algorithm** — Adjust weights based on feedback
4. **HubSpot integration** — Send results to contacts + custom properties
5. **Styling & branding** — Make it look good

## Scoring Logic (Current)

### Type: RENOVATE
When:
- You're not open to moving, OR
- Location issues are low + fixability is high + strong emotional attachment

### Type: MOVE
When:
- Significant location issues + hard to fix + willing to move

### Type: UNCERTAIN
When:
- Mixed signals across different dimensions
- More information needed to decide

## Files

```
src/
├── App.js                 Main app component
├── sections/
│   ├── Section1.js        Location & Lifestyle
│   └── Section2.js        Attachment & Openness
├── components/
│   ├── ScaleQuestion.js   1-10 slider
│   ├── YesNoQuestion.js   Yes/No buttons
│   ├── MultiSelectQuestion.js  Multiple choice
│   └── Results.js         Final recommendation
└── utils/
    └── scoring.js         Recommendation algorithm
```

## Notes for Refinement

- Section 1 questions focus on: Can these problems be solved without moving?
- Section 2 questions focus on: Would the person actually want to move?
- Scoring currently unweighted — can adjust based on importance
- Results messaging can be more personalized based on specific answer patterns

