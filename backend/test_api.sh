#!/bin/bash

echo "=== Testing Solance API ==="

echo "1. Health Check:"
curl -s http://localhost:8000/health
echo -e "\n"

echo "2. Question Generation - First Time User:"


curl -X POST "http://localhost:8000/api/v1/generate-question" \
     -H "Content-Type: application/json" \
     -d '{
           "model_name": "gemini-2.5-flash",
           "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
           "subject_id": "wtle4d",
           "previous_questions": []
         }'
         

curl -s -X POST http://localhost:8000/api/v1/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "subject_id": "wtle4d",
    "previous_questions": [
      {
        "question": "Solve: 2x + 4 = 10",
        "score": 7,
        "remarks": ["Division error in final step"]
      }
    ]
  }'







echo "3. Question Generation - With History:"


curl -s -X POST http://localhost:8000/api/v1/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "subject_id": "wtle4d",
    "previous_questions": [
      {
        "question": "Solve: 2x + 4 = 10",
        "score": 7,
        "remarks": ["Division error in final step"]
      }
    ]
  }'





echo "4. Steps Generation - Initial Step:"
curl -s -X POST http://localhost:8000/api/v1/generate-steps \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "question": "Solve for x: 2x + 4 = 10"
  }'
echo -e "\n"





echo "5. Steps Generation - With Conversation History:"
curl -s -X POST http://localhost:8000/api/v1/generate-steps \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "question": "Solve for x: 2x + 4 = 10",
    "conversation_history": [
      {
        "step": 1,
        "your_prompt": "Move +4 to the other side. What is 2x = ?",
        "student_answer": "6"
      }
    ]
  }'



curl -X POST "http://localhost:8000/api/v1/subjects" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "display_name": "Advanced Algebra",
      "subject": "mathematics",
      "description": "Advanced algebraic concepts including quadratic equations and polynomials",
      "created_by": "user_nilesh123",
      "public": false
    },
    "curriculum": [
      {
        "level": 1,
        "name": "Basic Equations",
        "concepts": ["Linear equations", "Simple factoring"],
        "question_style": "Multiple Choice"
      },
      {
        "level": 2,
        "name": "Quadratic Equations",
        "concepts": ["Quadratic formula", "Completing the square"],
        "question_style": "Problem Solving"
      }
    ]
  }'




curl -X GET "http://localhost:8000/api/v1/subjects?user_id=YOUR_USER_ID"




curl -X POST "http://localhost:8000/api/v1/subjects" \
  -H "Content-Type: application/json" \
  -d '{
  "meta": {
    "subject": "Cognitive Science",
    "display_name": "Applied Rationality & Decision Making",
    "description": "A tactical guide to not being fooled by data, people, or your own brain. Focuses on high-stakes decision making.",
    "created_by": "647ced21-aa26-400a-b272-84a6547cfcde",
    "public": true
  },
  "curriculum": [
    {
      "level": 1,
      "name": "The Trap of the Visible (Selection Effects)",
      "concepts": [
        "Survivorship Bias (Ignoring the failures that aren'\''t visible)",
        "The Halo Effect (Assuming competence in one area equals competence in all)",
        "Correlation vs. Causation (Identifying the third hidden variable)"
      ],
      "question_style": "Data Analysis Scenario: Present a dataset or success story that leads to an obvious but WRONG conclusion. Ask the user to identify the specific missing data point that invalidates the conclusion."
    },
    {
      "level": 2,
      "name": "Verbal Judo (Defeating Manipulation)",
      "concepts": [
        "The False Dilemma (You are given two bad options, identify the third)",
        "The Strawman (Spotting when your argument was distorted)",
        "Reframing (Identifying when emotional language is replacing evidence)"
      ],
      "question_style": "Conflict Simulation: You are in a negotiation or argument. The opponent makes a compelling statement. You must identify the specific logical gap or the hidden third option they are suppressing."
    },
    {
      "level": 3,
      "name": "Statistical Self-Defense (Numbers Lie)",
      "concepts": [
        "Base Rate Neglect (Confusing probability with accuracy)",
        "Relative vs. Absolute Risk (Marketing manipulation)",
        "Regression to the Mean (Mistaking luck for skill trend)"
      ],
      "question_style": "Risk Assessment: You are given scary medical or financial statistics (e.g., '\''100% increase in risk'\''). You must calculate the REAL risk or decision based on the absolute numbers provided."
    },
    {
      "level": 4,
      "name": "The Sunk Cost & Opportunity Cost",
      "concepts": [
        "Sunk Cost Fallacy (Ignoring past investment for future value)",
        "Opportunity Cost (The invisible cost of the path not taken)",
        "Status Quo Bias (The cost of doing nothing)"
      ],
      "question_style": "Investment Decision: You are in a deep hole with a project or investment. Present a scenario where '\''quitting'\'' feels like losing, but is mathematically the winning move. Ask for the decision: Stick or Quit?"
    },
    {
      "level": 5,
      "name": "Second-Order Thinking (Systems)",
      "concepts": [
        "The Cobra Effect (Perverse Incentives)",
        "Chesterton'\''s Fence (Don'\''t remove a rule until you know why it exists)",
        "Feedback Loops (Compounding errors)"
      ],
      "question_style": "Policy Implementation: You implement a solution to a problem. Ask the user to predict the specific catastrophic unintended consequence that naturally follows the incentive structure you created."
    },
    {
      "level": 6,
      "name": "Inversion & First Principles",
      "concepts": [
        "Inversion (Solving problems backwards)",
        "First Principles (Stripping away analogy)",
        "Occam'\''s Razor vs. Hickam'\''s Dictum"
      ],
      "question_style": "Impossible Problem: You are faced with a complex, unsolvable real-world mess. Ask the user to identify the one fundamental truth that, if solved, makes the rest of the complexity irrelevant."
    }
  ]
}'

