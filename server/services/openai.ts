import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

// Helper function to convert grade to numeric value
function getGradeNumeric(grade: string): number {
  if (!grade || grade === "V0") return 0;
  const match = grade.match(/V(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

export async function analyzeQuestCompletion(
  questTitle: string,
  questDescription: string,
  userSkills: any[],
  questType: string
): Promise<{
  skillImprovements: {
    skillType: string;
    mainCategory: string;
    subCategory: string;
    improvement: string;
    xpGain: number;
  }[];
  summary: string;
}> {
  const prompt = `Analyze this completed climbing quest and determine which skills should be improved based on the quest's focus and requirements.

Quest Details:
- Title: ${questTitle}
- Description: ${questDescription}
- Type: ${questType}

Current User Skills:
${userSkills.map(skill => `- ${skill.skillType}: Level ${skill.level || 1}, Max Grade: ${skill.maxGrade || 'V0'}, Problems: ${skill.totalProblems || 0}`).join('\n')}

Available Skill Categories (use exact skillType names from this list):

MOVEMENT:
- Balance: slab, balance_beam, mantles, highsteps
- Coordination: cross_through, heel_hooks, toe_hooks, flagging  
- Flexibility: high_steps, wide_spans, hip_flexibility, shoulder_mobility
- Dynamic: dynos, dead_points, matching, jumping
- Footwork: smearing, edging, foot_jams, precise_placement

STRENGTH:
- Finger Strength: crimps, pinches, slopers, pockets
- Core Strength: compression, tension, body_positioning, overhangs
- Upper Body: pull_ups, lockoffs, mantles, pressing
- Contact Strength: dead_points, latching, first_moves, power_endurance

MENTAL:
- Focus: route_reading, sequencing, precision, mindfulness
- Confidence: commitment, risk_taking, bold_moves, trust
- Fear Management: high_balls, exposure, falling, composure
- Persistence: projecting, working_moves, patience, grit

TECHNICAL:
- Route Reading: beta_reading, sequence_planning, hold_identification, movement_preview
- Efficiency: rest_positions, flow, energy_management, relaxation
- Technique Refinement: body_positioning, weight_distribution, timing, precision
- Adaptation: style_switching, conditions, rock_types, hold_variations

ENDURANCE:
- Power Endurance: circuits, linked_problems, volume, pump_tolerance
- Aerobic Capacity: long_sessions, base_fitness, recovery, breathing
- Recovery: active_recovery, rest_positions, shaking_out, pacing

STRATEGY:
- Problem Solving: beta_development, alternative_sequences, creative_solutions, troubleshooting
- Risk Assessment: safety_awareness, fall_consequences, gear_placement, conditions
- Training Planning: periodization, weakness_identification, goal_setting, progress_tracking
- Competition Strategy: time_management, energy_allocation, pressure_handling, observation

Based on the quest completion, suggest 2-3 specific skills that would have been developed. Use EXACT skillType names from the list above.

Consider:
- What climbing skills were likely practiced during this quest?
- Which skills align with the quest's focus and requirements?
- How would completing this quest improve the climber's abilities?

Respond with JSON:
{
  "skillImprovements": [
    {
      "skillType": "exact_skill_name_from_list",
      "mainCategory": "movement/strength/mental/technical/endurance/strategy",
      "subCategory": "balance/finger_strength/focus/route_reading/power_endurance/problem_solving",
      "improvement": "Brief description of how this skill improved",
      "xpGain": 20
    }
  ],
  "summary": "Brief summary of overall skill development from this quest"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a climbing coach analyzing quest completion for skill development. Provide practical, climbing-specific skill improvements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error analyzing quest completion:", error);
    return {
      skillImprovements: [],
      summary: "Unable to analyze quest completion at this time."
    };
  }
}

export async function generateQuest(
  layer: number,
  whistleLevel: number,
  userSkills: any[],
  recentGrades: string[]
): Promise<{
  title: string;
  description: string;
  requirements: {
    type: string;
    count: number;
    grade?: string;
    style?: string;
    gradeRange?: string;
  };
  xpReward: number;
  difficulty: string;
  difficultyRating: number;
}> {
  const maxGrade = Math.max(...userSkills.map(s => getGradeNumeric(s.maxGrade || "V0")));
  const challengeGrade = Math.min(maxGrade + 1, 17); // Don't exceed V17
  const comfortGrade = Math.max(maxGrade - 1, 0); // Don't go below V0
  
  const weakestSkills = userSkills
    .filter(s => s.totalProblems < 5)
    .map(s => s.skillType)
    .slice(0, 3);

  const prompt = `Generate a FUN and VERSATILE climbing quest that targets specific skills and encourages diverse climbing development. Mix practical challenges with creative, engaging activities.

  User Profile:
  - Current Layer: ${layer}/7
  - Whistle Level: ${whistleLevel} (0=Bell, 1=Red, 2=Blue, 3=Moon, 4=Black, 5=White)
  - Highest Grade: V${maxGrade}
  - Challenge Grade: V${challengeGrade}
  - Comfort Grade: V${comfortGrade}
  - Weakest Skills: ${weakestSkills.join(", ") || "None identified"}
  - Recent Grades: ${recentGrades.join(", ") || "None"}

  Grade Scale: V0-V17 (V0=Beginner, V3-V5=Intermediate, V6-V8=Advanced, V9+=Expert)

  VERSATILE QUEST TYPES (randomly select one approach):

  1. SKILL-SPECIFIC CHALLENGES:
     - Mental Skills: "Practice route reading by analyzing 3 problems before attempting", "Set a 5-minute focus timer and complete problems without looking away"
     - Strategy Skills: "Plan your session by identifying 3 different problem types to attempt", "Create and follow a warm-up routine for your next session"
     - Endurance Skills: "Complete a 20-minute non-stop climbing circuit", "Do active recovery stretches between every problem"
     - Technique Skills: "Practice energy management by resting in specific positions", "Work on efficiency by repeating the same route 3 times"

  2. CREATIVE MOVEMENT CHALLENGES:
     - "Silent Feet Challenge: Complete 3 problems without making foot noise"
     - "Style Switch: Complete the same problem using two different movement styles"
     - "Beta Breaker: Find an alternative sequence for a problem you've done before"
     - "Opposite Hand Start: Begin 3 problems with your non-dominant hand"

  3. MINDFULNESS & MENTAL TRAINING:
     - "Visualization Quest: Spend 5 minutes visualizing a challenging route before attempting"
     - "Breathing Focus: Practice controlled breathing during 3 rest positions"
     - "Patience Training: Take 30-second breaks between each attempt"
     - "Confidence Building: Attempt 2 problems that seem just beyond your comfort zone"

  4. SOCIAL & OBSERVATIONAL:
     - "Teaching Challenge: Explain beta to another climber or practice explaining out loud"
     - "Observation Quest: Watch and analyze 3 other climbers' techniques"
     - "Encouragement Mission: Give positive feedback to 3 other climbers"
     - "Learning Quest: Ask for advice on technique from an experienced climber"

  5. ADAPTIVE & PROBLEM-SOLVING:
     - "Conditions Challenge: Adapt your technique to current gym/rock conditions"
     - "Hold Variation: Complete problems using different grip types than usual"
     - "Troubleshooting: Work through a problem you've failed before by trying 3 different approaches"
     - "Creative Solutions: Find unconventional beta for a standard problem"

  6. PHYSICAL CONDITIONING:
     - "Recovery Focus: Practice active recovery and rest position techniques"
     - "Strength Endurance: Complete 5 problems with minimal rest between attempts"
     - "Base Fitness: Incorporate 10 minutes of cardio before climbing"
     - "Flexibility Work: Do 15 minutes of climbing-specific stretches"

  SKILL TYPES TO TARGET (prioritize these based on weakest skills):
  
  MOVEMENT: slab, balance_beam, mantles, highsteps, cross_through, heel_hooks, toe_hooks, flagging, high_steps, wide_spans, hip_flexibility, shoulder_mobility, dynos, dead_points, matching, jumping, smearing, edging, foot_jams, precise_placement
  
  STRENGTH: crimps, pinches, slopers, pockets, compression, tension, body_positioning, overhangs, pull_ups, lockoffs, mantles, pressing, dead_points, latching, first_moves, power_endurance
  
  MENTAL: route_reading, sequencing, precision, mindfulness, commitment, risk_taking, bold_moves, trust, high_balls, exposure, falling, composure, projecting, working_moves, patience, grit
  
  TECHNICAL: beta_reading, sequence_planning, hold_identification, movement_preview, rest_positions, flow, energy_management, relaxation, body_positioning, weight_distribution, timing, precision, style_switching, conditions, rock_types, hold_variations
  
  ENDURANCE: circuits, linked_problems, volume, pump_tolerance, long_sessions, base_fitness, recovery, breathing, active_recovery, rest_positions, shaking_out, pacing
  
  STRATEGY: beta_development, alternative_sequences, creative_solutions, troubleshooting, safety_awareness, fall_consequences, gear_placement, conditions, periodization, weakness_identification, goal_setting, progress_tracking, time_management, energy_allocation, pressure_handling, observation

  Requirements:
  - Make quests FUN and ENGAGING, not just "complete X problems"
  - Target skills that are hard to level through normal boulder problems (especially mental, technical, endurance, strategy skills)
  - Include specific, measurable goals with clear completion criteria
  - Scale difficulty to user's current ability
  - Create quests that develop skills not commonly trained through regular climbing
  - XP rewards: 50-150 for skill development, 200-350 for creative challenges, 400-500 for comprehensive quests

  Respond with JSON:
  {
    "title": "Practical title (no mystical themes)",
    "description": "Clear, trackable description",
    "requirements": {
      "type": "problems|routes|style|grade_range",
      "count": number,
      "grade": "VX (optional single grade)",
      "gradeRange": "VX-VY (optional range)",
      "style": "overhangs|slabs|crimps|dynos|outdoor (optional)"
    },
    "xpReward": number,
    "difficulty": "easy|medium|hard|extreme",
    "difficultyRating": number (1-10)
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a practical climbing quest generator. Create clear, trackable climbing goals that match the user's skill level. No mystical themes - use direct, actionable language."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content!);
  } catch (error) {
    throw new Error("Failed to generate quest: " + (error as Error).message);
  }
}

export async function analyzeClimbingProgress(
  sessions: any[],
  problems: any[]
): Promise<{
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextLayerReadiness: boolean;
}> {
  const prompt = `Analyze this climbing progress data and provide insights.
  
  Sessions: ${JSON.stringify(sessions)}
  Problems: ${JSON.stringify(problems)}
  
  Provide analysis on:
  - Strengths (what the climber excels at)
  - Weaknesses (areas for improvement)
  - Recommendations (specific training advice)
  - Next layer readiness (boolean - ready for next difficulty layer)
  
  Respond with JSON in this format:
  {
    "strengths": ["string"],
    "weaknesses": ["string"], 
    "recommendations": ["string"],
    "nextLayerReadiness": boolean
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a climbing coach AI that analyzes climbing data to provide personalized insights and recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content!);
  } catch (error) {
    throw new Error("Failed to analyze climbing progress: " + (error as Error).message);
  }
}

export async function generateWorkout(
  userStats: {
    userId: string;
    whistleLevel: number;
    currentLayer: number;
    highestGrade: string;
    recentSessions: any[];
    skills: any[];
    weakestSkills: string[];
    recentActivity: number; // sessions in last 7 days
  }
): Promise<{
  workoutType: string;
  title: string;
  description: string;
  duration: number;
  intensity: string;
  intensityRating: number;
  targetAreas: string[];
  exercises: any[];
  xpReward: number;
  generationReason: string;
}> {
  const { whistleLevel, currentLayer, highestGrade, skills, weakestSkills, recentActivity } = userStats;

  const prompt = `Generate a personalized home workout for a climber based on their stats and needs.

  User Profile:
  - Whistle Level: ${whistleLevel}/5 (0=Bell, 1=Red, 2=Blue, 3=Moon, 4=Black, 5=White)
  - Current Layer: ${currentLayer}/7 
  - Highest Grade: ${highestGrade}
  - Weakest Skills: ${weakestSkills.join(", ") || "None identified"}
  - Recent Activity: ${recentActivity} sessions in last 7 days
  - Total Skills: ${skills.length}

  Workout Type Priority Logic:
  1. If recent activity < 2 sessions: STRETCHING (recovery/maintenance)
  2. If weakest skills include "mental" or "focus": MEDITATION (mental training)
  3. If weakest skills include "strength" or "power": STRENGTH (physical training)
  4. If balanced but recent activity > 5: COMBO (active recovery)
  5. Default: STRETCHING or STRENGTH based on grade level

  Intensity Scaling:
  - Bell/Red Whistle (V0-V2): Low intensity, focus on basics
  - Blue Whistle (V3-V4): Medium intensity, technique focus
  - Moon+ Whistle (V5+): High intensity, advanced training

  Duration Guidelines:
  - Stretching: 15-30 minutes
  - Meditation: 10-20 minutes  
  - Strength: 20-40 minutes
  - Combo: 25-45 minutes

  XP Rewards:
  - Low intensity: 25-50 XP
  - Medium intensity: 50-100 XP
  - High intensity: 100-200 XP
  - Combo sessions: +25% bonus

  Create practical, actionable exercises. For stretching: specific stretches. For strength: bodyweight exercises. For meditation: mindfulness techniques.

  Respond with JSON:
  {
    "workoutType": "stretching|meditation|strength|combo",
    "title": "Engaging workout title",
    "description": "Clear workout description and benefits",
    "duration": number (minutes),
    "intensity": "low|medium|high|extreme",
    "intensityRating": number (1-10),
    "targetAreas": ["flexibility", "core", "shoulders", "mental_focus", "etc"],
    "exercises": [
      {
        "name": "Exercise name",
        "description": "How to perform it",
        "duration": "2 minutes" or "10 reps",
        "targetArea": "core|shoulders|flexibility|mental"
      }
    ],
    "xpReward": number,
    "generationReason": "Why this workout was recommended"
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a climbing coach AI that creates personalized home workouts. Focus on practical, actionable exercises that complement climbing training."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const workoutData = JSON.parse(response.choices[0].message.content!);
    
    // Ensure workoutType is always present and valid
    if (!workoutData.workoutType || !['stretching', 'meditation', 'strength', 'combo'].includes(workoutData.workoutType)) {
      workoutData.workoutType = 'combo'; // Default fallback
    }
    
    // Ensure other required fields have defaults
    workoutData.title = workoutData.title || 'Personalized Workout';
    workoutData.description = workoutData.description || 'A customized workout based on your climbing profile.';
    workoutData.duration = workoutData.duration || 20;
    workoutData.intensity = workoutData.intensity || 'medium';
    workoutData.intensityRating = workoutData.intensityRating || 5;
    workoutData.targetAreas = workoutData.targetAreas || ['general'];
    workoutData.exercises = workoutData.exercises || [];
    workoutData.xpReward = workoutData.xpReward || 50;
    workoutData.generationReason = workoutData.generationReason || 'Generated based on your climbing profile.';
    
    return workoutData;
  } catch (error) {
    // Return a fallback workout if OpenAI fails
    return {
      workoutType: 'combo',
      title: 'Basic Climbing Workout',
      description: 'A general workout routine for climbers.',
      duration: 20,
      intensity: 'medium',
      intensityRating: 5,
      targetAreas: ['general'],
      exercises: [
        {
          name: 'Warm-up Stretches',
          description: 'Light stretching to prepare for activity',
          duration: '5 minutes',
          targetArea: 'general'
        },
        {
          name: 'Basic Strength Training',
          description: 'Core and upper body exercises',
          duration: '15 minutes',
          targetArea: 'strength'
        }
      ],
      xpReward: 50,
      generationReason: 'Fallback workout generated due to service unavailability.'
    };
  }
}

export async function generateClimbingLocations(
  location: { lat: number; lng: number; address?: string },
  radiusKm: number = 10,
  type: 'all' | 'indoor' | 'outdoor' = 'all'
): Promise<{
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  address: string;
  location: { lat: number; lng: number };
  distance: number;
  rating: number;
  difficulty: string;
  routes: number;
  openingHours?: string;
  phone?: string;
  website?: string;
  features: string[];
  description: string;
}[]> {
  try {
    const prompt = `Generate realistic climbing locations within ${radiusKm}km of coordinates ${location.lat}, ${location.lng}. 
    
Location type filter: ${type}
Search radius: ${radiusKm}km
Area context: ${location.address || 'Unknown area'}

Generate 3-8 realistic climbing locations that would exist in this area. For each location, provide:
- Realistic name that fits the local geography/culture
- Type (indoor gym OR outdoor crag/area)
- Realistic address near the coordinates
- GPS coordinates within the search radius
- Distance from search center (calculate based on coordinates)
- Rating (1-5 stars)
- Difficulty range (V-scale for bouldering)
- Number of routes/problems
- Opening hours (for indoor gyms only)
- Phone number (realistic format)
- Website URL (realistic domain)
- Features array (specific climbing features)
- Description (2-3 sentences)

Make locations diverse and realistic for the geographic area. Consider local geography, population density, and climbing culture.

Return as JSON array with exact format:
[
  {
    "id": "unique-id-1",
    "name": "Location Name",
    "type": "indoor" | "outdoor",
    "address": "Street Address, City, State/Province",
    "location": {"lat": 40.123, "lng": -74.456},
    "distance": 2.3,
    "rating": 4.5,
    "difficulty": "V0-V8",
    "routes": 120,
    "openingHours": "6:00 AM - 10:00 PM",
    "phone": "(555) 123-4567",
    "website": "https://example.com",
    "features": ["Bouldering", "Lead Climbing", "Training Area"],
    "description": "Modern climbing facility with excellent route setting and training facilities."
  }
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a climbing location expert. Generate realistic climbing locations based on geographic data and local climbing culture. Return only valid JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || '[]');
    return Array.isArray(result) ? result : result.locations || [];
    
  } catch (error) {
    console.error('Error generating climbing locations:', error);
    return [];
  }
}
