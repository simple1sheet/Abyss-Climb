import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function generateQuest(
  layer: number,
  userLevel: number,
  climbingStyle: string,
  recentGrades: string[]
): Promise<{
  title: string;
  description: string;
  requirements: {
    type: string;
    count: number;
    grade?: string;
    style?: string;
  };
  xpReward: number;
  difficulty: string;
}> {
  const prompt = `Generate a climbing quest for a Made in Abyss-themed app. 
  
  Context:
  - Layer: ${layer} (1-7, where 1 is easiest and 7 is legendary)
  - User Level: ${userLevel}
  - Preferred Climbing Style: ${climbingStyle}
  - Recent Grades: ${recentGrades.join(", ")}
  
  Layer themes:
  - Layer 1: Edge of the Abyss (Beginner - V0-V2)
  - Layer 2: Forest of Temptation (Intermediate - V3-V5)
  - Layer 3: Great Fault (Advanced - V6-V8)
  - Layer 4: Goblets of Giants (Expert - V9-V11)
  - Layer 5: Sea of Corpses (Elite - V12-V14)
  - Layer 6: Capital of the Unreturned (Master - V15+)
  - Layer 7: Final Maelstrom (Legendary - Project grades)
  
  Generate a quest with:
  - A mystical title related to the layer theme
  - An engaging description that feels like an adventure
  - Specific climbing requirements (number of problems, grade, style)
  - Appropriate XP reward (50-500 based on difficulty)
  - Difficulty level (easy, medium, hard, extreme)
  
  Respond with JSON in this format:
  {
    "title": "string",
    "description": "string", 
    "requirements": {
      "type": "problems|routes|style",
      "count": number,
      "grade": "string (optional)",
      "style": "string (optional)"
    },
    "xpReward": number,
    "difficulty": "string"
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a quest generator for a Made in Abyss-themed climbing app. Generate engaging, balanced quests that match the user's skill level and the mystical atmosphere of the anime."
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

export async function provideCoachFeedback(
  type: "session" | "quest" | "skills",
  data: any
): Promise<{
  feedback: string;
  encouragement: string;
  nextSteps: string[];
}> {
  let prompt = "";

  switch (type) {
    case "session":
      prompt = `Provide coaching feedback for this climbing session:
      
      Session: ${JSON.stringify(data)}
      
      Give:
      - Feedback on performance (what went well, what could improve)
      - Encouragement (motivational message)
      - Next steps (specific actionable advice)`;
      break;
    
    case "quest":
      prompt = `Provide coaching feedback for this quest completion:
      
      Quest: ${JSON.stringify(data)}
      
      Give:
      - Feedback on quest achievement
      - Encouragement for continued progress
      - Next steps for skill development`;
      break;
    
    case "skills":
      prompt = `Provide coaching feedback for these climbing skills:
      
      Skills: ${JSON.stringify(data)}
      
      Give:
      - Feedback on skill development
      - Encouragement on progress
      - Next steps for improvement`;
      break;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an encouraging climbing coach AI. Provide supportive, actionable feedback that motivates climbers to improve. Keep responses concise and practical."
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
    throw new Error("Failed to provide coach feedback: " + (error as Error).message);
  }
}
