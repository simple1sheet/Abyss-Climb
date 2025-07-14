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

  private async analyzeImage(imageBuffer: Buffer, user: User | undefined, userStats: EnhancedProgressStats): Promise<string> {
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
    userSkills: Skill[]
  ): Promise<string> {
    try {
      const personalityPrompt = this.createPersonalityPrompt(user, userStats, userSkills);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: personalityPrompt
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
    imageFile?: Express.Multer.File
  ): Promise<string> {
    try {
      // If there's an image, analyze it
      if (imageFile) {
        return await this.analyzeImage(imageFile.buffer, user, userStats);
      }
      
      // Otherwise, generate a chat response
      return await this.generateChatResponse(message, user, userStats, userSkills);
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
}

export const nanachiService = new NanachiService();