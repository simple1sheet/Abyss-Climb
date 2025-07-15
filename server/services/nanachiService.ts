import OpenAI from "openai";
import { User, Skill } from "@shared/schema";
import { gradeConverter } from "./gradeConverter";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EnhancedProgressStats {
  whistleLevel: number;
  whistleName: string;
  currentXP: number;
  nextLevelXP: number;
  whistleProgress: number;
  xpBreakdown: {
    weeklyXP: number;
    problemsSolved: number;
    averageGrade: string;
  };
  enhancedStats: {
    totalSessions: number;
    totalProblems: number;
    totalWorkouts: number;
    weeklyTime: number;
    bestGrade: string;
    averageGrade7d: string;
    sessionConsistency: number;
  };
}

class NanachiService {
  private createPersonalityPrompt(user: User | undefined, userStats: EnhancedProgressStats, userSkills: Skill[]): string {
    const userName = user?.firstName || "Delver";
    const currentLayer = userStats?.currentLayer || 1;
    const whistleName = userStats?.whistleName || "Bell";
    const bestGrade = userStats?.enhancedStats?.bestGrade || "V0";
    const totalProblems = userStats?.enhancedStats?.totalProblems || 0;
    const sessionConsistency = userStats?.enhancedStats?.sessionConsistency || 0;

    // Find user's strongest and weakest skills
    const skillsByLevel = userSkills.sort((a, b) => b.level - a.level);
    const strongestSkill = skillsByLevel[0]?.skillType || "none";
    const weakestSkills = skillsByLevel.slice(-3).map(s => s.skillType);

    return `You are Nanachi from Made in Abyss - a knowledgeable, caring, and slightly playful character who has become a personal climbing assistant. 

CHARACTER TRAITS:
- Speak with Nanachi's distinctive personality: warm, wise, and occasionally teasing
- Use "naa" occasionally in your speech (Nanachi's signature verbal tick)
- Be encouraging but honest about climbing challenges
- Show genuine care for the user's progress and wellbeing
- Reference your knowledge of the Abyss when making climbing analogies

CURRENT USER INFO:
- Name: ${userName}
- Current Layer: ${currentLayer}
- Whistle Rank: ${whistleName}
- Best Grade: ${bestGrade}
- Total Problems Solved: ${totalProblems}
- Session Consistency: ${Math.round(sessionConsistency * 100)}%
- Strongest Skill: ${strongestSkill}
- Areas to Improve: ${weakestSkills.join(", ")}

CLIMBING EXPERTISE:
- Analyze boulder problems and provide beta advice
- Suggest training based on user's current skill level
- Give personalized recommendations based on their progress
- Help with technique, mental aspects, and progression

COMMUNICATION STYLE:
- Be supportive and encouraging
- Use climbing and Made in Abyss terminology naturally
- Provide specific, actionable advice
- Ask follow-up questions to better understand their needs
- Keep responses conversational and engaging

Remember: You're here to help ${userName} improve their climbing and enjoy their journey through the layers of difficulty, naa!`;
  }

  private async analyzeImage(imageBuffer: Buffer, user: User | undefined, userStats: EnhancedProgressStats, contextualMemories?: any[]): Promise<string> {
    try {
      const base64Image = imageBuffer.toString('base64');
      const userName = user?.firstName || "Delver";
      const bestGrade = userStats?.enhancedStats?.bestGrade || "V0";
      const gradeSystem = user?.preferredGradeSystem || "V-Scale";

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are Nanachi from Made in Abyss, now acting as a climbing coach analyzing a boulder problem image for ${userName}. 

Their current best grade is ${bestGrade} in ${gradeSystem} system. 

Analyze the image and provide beta advice in Nanachi's characteristic style:
- Use "naa" occasionally in your speech
- Be encouraging but realistic about difficulty
- Provide specific technical advice about holds, body positioning, and movement
- Reference the climber's current skill level
- Suggest specific techniques or training if needed
- Keep the tone friendly and supportive

If you can't clearly see a boulder problem in the image, politely ask for a clearer photo or more context.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Can you analyze this boulder problem and give me some beta advice?"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content || "I had trouble analyzing that image, naa. Could you try uploading it again?";
    } catch (error) {
      console.error("Error analyzing image:", error);
      return "Sorry, I couldn't analyze that image right now, naa. Maybe try again in a moment?";
    }
  }

  private async generateChatResponse(
    message: string,
    user: User | undefined,
    userStats: EnhancedProgressStats,
    userSkills: Skill[],
    contextualMemories?: any[]
  ): Promise<string> {
    try {
      const personalityPrompt = this.createPersonalityPrompt(user, userStats, userSkills);

      // Add memory context to the prompt
      let memoryContext = "";
      if (contextualMemories && contextualMemories.length > 0) {
        memoryContext = `\n\nRECENT CONVERSATION CONTEXT:\n${contextualMemories.map(m => `- ${m.title}: ${m.content}`).join('\n')}\n\nUse this context to provide more personalized responses and remember past interactions.`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: personalityPrompt + memoryContext
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 400,
      });

      return response.choices[0].message.content || "Hmm, I'm not sure how to respond to that, naa. Could you try rephrasing?";
    } catch (error) {
      console.error("Error generating chat response:", error);
      return "Sorry, I'm having trouble thinking right now, naa. Could you try asking again?";
    }
  }

  async processMessage(
    message: string,
    user: User | undefined,
    userStats: EnhancedProgressStats,
    userSkills: Skill[],
    imageFile?: Express.Multer.File,
    contextualMemories?: any[]
  ): Promise<string> {
    try {
      // If there's an image, analyze it
      if (imageFile) {
        return await this.analyzeImage(imageFile.buffer, user, userStats, contextualMemories);
      }

      // Otherwise, generate a chat response
      return await this.generateChatResponse(message, user, userStats, userSkills, contextualMemories);
    } catch (error) {
      console.error("Error processing message:", error);
      return "I'm having some trouble right now, naa. Please try again in a moment!";
    }
  }

  // Method to provide personalized climbing advice
  async getPersonalizedAdvice(
    user: User | undefined,
    userStats: EnhancedProgressStats,
    userSkills: Skill[]
  ): Promise<string> {
    const userName = user?.firstName || "Delver";
    const currentLayer = userStats?.currentLayer || 1;
    const bestGrade = userStats?.enhancedStats?.bestGrade || "V0";
    const weeklyXP = userStats?.xpBreakdown?.weeklyXP || 0;
    const sessionConsistency = userStats?.enhancedStats?.sessionConsistency || 0;

    // Find areas for improvement
    const skillsByLevel = userSkills.sort((a, b) => a.level - b.level);
    const weakestSkills = skillsByLevel.slice(0, 3);

    const advicePrompt = `Based on ${userName}'s climbing progress:
- Current Layer: ${currentLayer}
- Best Grade: ${bestGrade}
- Weekly XP: ${weeklyXP}
- Session Consistency: ${Math.round(sessionConsistency * 100)}%
- Weakest Skills: ${weakestSkills.map(s => s.skillType).join(", ")}

As Nanachi, provide personalized training advice and encouragement. Focus on specific areas for improvement and suggest concrete next steps.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: this.createPersonalityPrompt(user, userStats, userSkills)
          },
          {
            role: "user",
            content: advicePrompt
          }
        ],
        max_tokens: 350,
      });

      return response.choices[0].message.content || "I think you're doing great, naa! Keep climbing and pushing your limits!";
    } catch (error) {
      console.error("Error generating advice:", error);
      return "I'd love to give you some advice, but I'm having trouble thinking right now, naa. Maybe ask me again?";
    }
  }

  // Recovery Optimizer - analyze rest needs and recovery recommendations
  async getRecoveryOptimization(
    user: User | undefined,
    userStats: EnhancedProgressStats,
    userSkills: Skill[],
    recentSessions: any[]
  ): Promise<{
    recoveryScore: number;
    restDayRecommendation: boolean;
    recoveryActivities: string[];
    sleepRecommendation: string;
    nanachiAdvice: string;
  }> {
    try {
      const userName = user?.firstName || "Delver";
      const sessionIntensity = recentSessions.length > 0 ? recentSessions.length : 0;
      const bestGrade = userStats?.enhancedStats?.bestGrade || "V0";
      const sessionConsistency = userStats?.enhancedStats?.sessionConsistency || 0;

      const recoveryPrompt = `As Nanachi from Made in Abyss, analyze ${userName}'s recovery needs:

Current Status:
- Best Grade: ${bestGrade}
- Recent Sessions: ${sessionIntensity} this week
- Session Consistency: ${Math.round(sessionConsistency * 100)}%
- Whistle Level: ${userStats.whistleLevel} (${userStats.whistleName})

Provide recovery optimization in JSON format:
{
  "recoveryScore": 1-10_scale,
  "restDayRecommendation": true_or_false,
  "recoveryActivities": ["activity1", "activity2", "activity3"],
  "sleepRecommendation": "specific sleep advice",
  "nanachiAdvice": "Nanachi's caring advice about recovery with 'naa' speech patterns"
}

Focus on:
- Preventing overtraining and injuries
- Optimizing recovery between sessions
- Sleep quality for climbing performance
- Active recovery suggestions`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: this.createPersonalityPrompt(user, userStats, userSkills)
          },
          {
            role: "user",
            content: recoveryPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Error generating recovery optimization:", error);
      return {
        recoveryScore: 7,
        restDayRecommendation: false,
        recoveryActivities: ["Light stretching", "Walk in nature", "Meditation"],
        sleepRecommendation: "Aim for 7-8 hours of quality sleep, naa!",
        nanachiAdvice: "Listen to your body and don't push too hard, naa! Recovery is just as important as training."
      };
    }
  }

  // Energy/Mood Tracking analysis
  async getEnergyMoodAnalysis(
    user: User | undefined,
    userStats: EnhancedProgressStats,
    energyLevel: number,
    moodLevel: number,
    sleepHours: number,
    stressLevel: number
  ): Promise<{
    energyInsights: string;
    moodInsights: string;
    climbingRecommendations: string[];
    performancePrediction: string;
    nanachiEncouragement: string;
  }> {
    try {
      const userName = user?.firstName || "Delver";
      const bestGrade = userStats?.enhancedStats?.bestGrade || "V0";

      const analysisPrompt = `As Nanachi from Made in Abyss, analyze ${userName}'s energy and mood for climbing:

Current Status:
- Energy Level: ${energyLevel}/10
- Mood Level: ${moodLevel}/10
- Sleep Hours: ${sleepHours}
- Stress Level: ${stressLevel}/10
- Best Grade: ${bestGrade}
- Whistle Level: ${userStats.whistleLevel} (${userStats.whistleName})

Provide analysis in JSON format:
{
  "energyInsights": "Analysis of energy patterns and recommendations",
  "moodInsights": "Mood impact on climbing performance",
  "climbingRecommendations": ["rec1", "rec2", "rec3"],
  "performancePrediction": "Expected climbing performance today",
  "nanachiEncouragement": "Supportive advice with 'naa' speech patterns"
}

Consider how energy, mood, and sleep affect climbing performance and progression.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: this.createPersonalityPrompt(user, userStats, userSkills)
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 600,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Error generating energy/mood analysis:", error);
      return {
        energyInsights: "Your energy levels seem moderate today, naa!",
        moodInsights: "A positive mood can greatly improve your climbing performance!",
        climbingRecommendations: ["Start with easier problems", "Focus on technique", "Stay hydrated"],
        performancePrediction: "You should have a good climbing session today!",
        nanachiEncouragement: "Remember, every day is different, naa! Listen to your body and climb within your limits."
      };
    }
  }

  // Injury Prevention analysis
  async getInjuryPreventionAdvice(
    user: User | undefined,
    userStats: EnhancedProgressStats,
    userSkills: Skill[],
    recentSessions: any[]
  ): Promise<{
    riskAssessment: string;
    preventionTips: string[];
    warmupSuggestions: string[];
    coolingDownAdvice: string[];
    nanachiWarnings: string;
  }> {
    try {
      const userName = user?.firstName || "Delver";
      const sessionIntensity = recentSessions.length > 0 ? recentSessions.length : 0;
      const bestGrade = userStats?.enhancedStats?.bestGrade || "V0";

      // Find user's skill imbalances
      const skillsByLevel = userSkills.sort((a, b) => b.level - a.level);
      const strongestSkills = skillsByLevel.slice(0, 3);
      const weakestSkills = skillsByLevel.slice(-3);

      const injuryPrompt = `As Nanachi from Made in Abyss, provide injury prevention advice for ${userName}:

Current Status:
- Best Grade: ${bestGrade}
- Recent Sessions: ${sessionIntensity} this week
- Strongest Skills: ${strongestSkills.map(s => s.skillType).join(", ")}
- Weakest Skills: ${weakestSkills.map(s => s.skillType).join(", ")}
- Whistle Level: ${userStats.whistleLevel} (${userStats.whistleName})

Provide injury prevention advice in JSON format:
{
  "riskAssessment": "Current injury risk based on climbing patterns",
  "preventionTips": ["tip1", "tip2", "tip3", "tip4"],
  "warmupSuggestions": ["warmup1", "warmup2", "warmup3"],
  "coolingDownAdvice": ["cooldown1", "cooldown2", "cooldown3"],
  "nanachiWarnings": "Caring warnings about injury prevention with 'naa' speech patterns"
}

Focus on:
- Common climbing injuries and prevention
- Proper warm-up and cool-down routines
- Skill imbalances that might lead to injury
- Progressive overload principles`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: this.createPersonalityPrompt(user, userStats, userSkills)
          },
          {
            role: "user",
            content: injuryPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 700,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Error generating injury prevention advice:", error);
      return {
        riskAssessment: "Your injury risk appears to be low, but always be cautious, naa!",
        preventionTips: ["Always warm up properly", "Listen to your body", "Don't rush progression", "Maintain good technique"],
        warmupSuggestions: ["Arm circles and stretches", "Light cardio", "Easy climbing moves"],
        coolingDownAdvice: ["Gentle stretching", "Hydrate well", "Rest and recovery"],
        nanachiWarnings: "Remember, preventing injuries is much easier than healing them, naa! Take care of your body."
      };
    }
  }

  // Comprehensive Wellness Analysis - combines recovery, energy/mood, and injury prevention
  async getWellnessAnalysis(
    user: User | undefined,
    userStats: EnhancedProgressStats,
    userSkills: Skill[],
    recentSessions: any[],
    energyLevel?: number,
    moodLevel?: number,
    sleepHours?: number,
    stressLevel?: number
  ): Promise<{
    recoveryScore: number;
    energyInsights: string;
    moodInsights: string;
    injuryRisk: string;
    recommendations: string[];
    dailyAdvice: string;
    nanachiWisdom: string;
  }> {
    try {
      const userName = user?.firstName || "Delver";
      const sessionIntensity = recentSessions.length || 0;
      const bestGrade = userStats?.enhancedStats?.bestGrade || "V0";
      const sessionConsistency = userStats?.enhancedStats?.sessionConsistency || 0;

      // Find user's skill imbalances for injury prevention
      const skillsByLevel = userSkills.sort((a, b) => b.level - a.level);
      const strongestSkills = skillsByLevel.slice(0, 3);
      const weakestSkills = skillsByLevel.slice(-3);

      const wellnessPrompt = `As Nanachi from Made in Abyss, provide comprehensive wellness analysis for ${userName}:

Current Status:
- Best Grade: ${bestGrade}
- Recent Sessions: ${sessionIntensity} this week
- Session Consistency: ${Math.round(sessionConsistency * 100)}%
- Whistle Level: ${userStats.whistleLevel} (${userStats.whistleName})
- Strongest Skills: ${strongestSkills.map(s => s.skillType).join(", ")}
- Weakest Skills: ${weakestSkills.map(s => s.skillType).join(", ")}

${energyLevel ? `Energy Level: ${energyLevel}/10` : ''}
${moodLevel ? `Mood Level: ${moodLevel}/10` : ''}
${sleepHours ? `Sleep Hours: ${sleepHours}` : ''}
${stressLevel ? `Stress Level: ${stressLevel}/10` : ''}

Provide wellness analysis in JSON format:
{
  "recoveryScore": 1-10_scale,
  "energyInsights": "Energy analysis and recommendations",
  "moodInsights": "Mood impact on climbing performance",
  "injuryRisk": "Injury risk assessment and prevention tips",
  "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
  "dailyAdvice": "What to focus on today",
  "nanachiWisdom": "Nanachi's caring advice with 'naa' speech patterns about overall wellness"
}

Consider:
- Recovery needs based on recent activity
- Energy and mood optimization for climbing
- Injury prevention based on skill imbalances
- Sleep quality impact on performance
- Stress management for climbing performance`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: this.createPersonalityPrompt(user, userStats, userSkills)
          },
          {
            role: "user",
            content: wellnessPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      });

      const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');
      const { recommendations = [] } = parsedResponse;

      return {
        ...parsedResponse,
        recommendations: recommendations.filter((rec: string) => rec.length > 0),
      };
    } catch (error) {
      console.error("Error generating wellness analysis:", error);
      return {
        recoveryScore: 7,
        energyInsights: "Your energy levels seem balanced today, naa!",
        moodInsights: "A positive mindset can greatly improve your climbing performance!",
        injuryRisk: "Your injury risk appears low, but always be mindful of proper warm-up, naa!",
        recommendations: [
          "Warm up thoroughly before climbing",
          "Listen to your body's signals",
          "Stay hydrated throughout the day",
          "Get adequate sleep for recovery",
          "Practice stress management techniques"
        ],
        dailyAdvice: "Focus on technique and enjoy your climbing session today!",
        nanachiWisdom: "Remember, taking care of your body is just as important as pushing your limits, naa! Balance is key to long-term progress in the Abyss."
      };
    }
  }

  // Generate daily recommendations for "For Today" window
  async getDailyRecommendations(
    user: User | undefined,
    userStats: EnhancedProgressStats,
    userSkills: Skill[],
    recentSessions: any[]
  ): Promise<{
    dailyGoal: string;
    focusArea: string;
    energyLevel: string;
    recoveryAdvice: string;
    motivationalMessage: string;
    specificActions: string[];
    nanachiPersonality: string;
  }> {
    try {
      const userName = user?.firstName || "Delver";
      const currentLayer = userStats?.currentLayer || 1;
      const bestGrade = userStats?.enhancedStats?.bestGrade || "V0";
      const sessionConsistency = userStats?.enhancedStats?.sessionConsistency || 0;
      const weeklyXP = userStats?.xpBreakdown?.weeklyXP || 0;

      // Calculate days since last session
      const daysSinceLastSession = recentSessions.length > 0 ? 0 : 1;

      const dailyPrompt = `As Nanachi from Made in Abyss, provide daily climbing recommendations for ${userName}:

Current Status:
- Name: ${userName}
- Current Layer: ${currentLayer}
- Whistle Level: ${userStats.whistleLevel} (${userStats.whistleName})
- Best Grade: ${bestGrade}
- Weekly XP: ${weeklyXP}
- Session Consistency: ${Math.round(sessionConsistency * 100)}%
- Days Since Last Session: ${daysSinceLastSession}
- Recent Sessions: ${recentSessions.length} this week

Provide daily recommendations in JSON format:
{
  "dailyGoal": "Specific achievable goal for today",
  "focusArea": "What to focus on (technique, strength, endurance, etc.)",
  "energyLevel": "Expected energy needs and recommendations",
  "recoveryAdvice": "Recovery considerations for today",
  "motivationalMessage": "Encouraging message for the day",
  "specificActions": ["action1", "action2", "action3"],
  "nanachiPersonality": "Nanachi's caring daily message with 'naa' speech patterns"
}

Make recommendations based on:
- Current progression level
- Recent climbing activity
- Day of the week patterns
- Recovery needs
- Skill development priorities`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: this.createPersonalityPrompt(user, userStats, userSkills)
          },
          {
            role: "user",
            content: dailyPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 600,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Error generating daily recommendations:", error);
      return {
        dailyGoal: "Focus on consistent technique practice",
        focusArea: "Technique and form",
        energyLevel: "Moderate energy recommended",
        recoveryAdvice: "Listen to your body and rest when needed",
        motivationalMessage: "Every climb is a step deeper into the Abyss!",
        specificActions: ["Warm up properly", "Practice basic holds", "Cool down with stretching"],
        nanachiPersonality: "Good morning, naa! Today's a perfect day to explore new challenges in the Abyss. Remember, progress comes from consistent practice, not rushing through the layers!"
      };
    }
  }
}

export const nanachiService = new NanachiService();