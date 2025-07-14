import OpenAI from "openai";
import { nanachiMemoryService } from "./nanachiMemory";
import { storage } from "../storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class NanachiAnalysisService {
  // Generate Nanachi's personalized progress analysis
  async generateProgressAnalysis(userId: string): Promise<{
    personalizedGreeting: string;
    progressInsights: string;
    encouragement: string;
    nextSteps: string;
    personalTouch: string;
  }> {
    // Get user data
    const [userStats, userSkills, userMemories] = await Promise.all([
      storage.getEnhancedProgressStats(userId),
      storage.getUserSkills(userId),
      nanachiMemoryService.getUserClimbingProfile(userId)
    ]);

    // Get recent achievements and memories
    const recentMemories = await nanachiMemoryService.getRecentConversations(userId, 5);
    const importantMemories = await nanachiMemoryService.getImportantMemories(userId, 3);

    // Build context for Nanachi
    const context = {
      userStats,
      userSkills: userSkills.slice(0, 10), // Top 10 skills
      preferences: userMemories.preferences,
      goals: userMemories.goals,
      achievements: userMemories.achievements,
      recentConversations: recentMemories,
      importantMemories,
      patterns: userMemories.patterns
    };

    const prompt = `You are Nanachi from Made in Abyss - a knowledgeable, caring, and slightly mischievous character who has become this user's personal climbing assistant. You remember past conversations and care deeply about the user's progress.

Character traits to embody:
- Use "naa" occasionally in speech (but not excessively)
- Be encouraging but also realistic
- Reference the Abyss layers when talking about progress
- Show genuine care for the user's wellbeing
- Use your knowledge of climbing to give specific advice
- Remember and reference past conversations when relevant

User's Climbing Data:
- Current Layer: ${userStats.enhancedStats.totalSessions > 0 ? Math.floor(userStats.whistleLevel / 2) + 1 : 1}
- Whistle Level: ${userStats.whistleLevel} (${userStats.whistleName})
- Total XP: ${userStats.currentXP}
- Best Grade: ${userStats.enhancedStats.bestGrade}
- Recent Problems: ${userStats.enhancedStats.weeklyStats.problems}
- Session Consistency: ${userStats.enhancedStats.sessionConsistency}%

Skills Progress:
${userSkills.map(skill => `- ${skill.skillType}: Level ${skill.level}, Max Grade: ${skill.maxGrade}`).join('\n')}

Memory Context:
- Previous conversations: ${recentMemories.length > 0 ? recentMemories.map(m => m.title).join(', ') : 'None yet'}
- User patterns: ${userMemories.patterns.join(', ') || 'Still learning about you'}
- Recent achievements: ${userMemories.achievements.length > 0 ? userMemories.achievements.map(a => a.title).join(', ') : 'None recorded'}

Provide a personalized analysis in JSON format with these sections:
{
  "personalizedGreeting": "A warm greeting that references our past interactions if any",
  "progressInsights": "Detailed analysis of their climbing progress with specific observations",
  "encouragement": "Motivational words that show you care about their journey",
  "nextSteps": "Specific, actionable advice for their next climbing goals",
  "personalTouch": "A personal comment that shows you remember them and their preferences"
}

Keep responses authentic to Nanachi's character - caring but not overly sweet, knowledgeable but approachable, and always with that hint of Abyss mystery, naa~`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are Nanachi from Made in Abyss, now serving as a personal climbing assistant. You remember conversations and care deeply about the user's progress. Use 'naa' occasionally and reference the Abyss layers when appropriate."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8, // Higher temperature for more personality
      });

      const analysis = JSON.parse(response.choices[0].message.content!);
      
      // Store this analysis as a memory
      await nanachiMemoryService.storeMemory({
        userId,
        memoryType: 'conversation',
        title: 'Progress Analysis',
        content: `Generated personalized progress analysis for user`,
        importance: 3,
      });

      return analysis;
    } catch (error) {
      console.error("Error generating Nanachi analysis:", error);
      // Fallback response with Nanachi's personality
      return {
        personalizedGreeting: "Hello there, naa~ I'm having a bit of trouble accessing my memories right now, but I'm still here to help!",
        progressInsights: "From what I can see, you're making steady progress in your climbing journey. Every step forward in the Abyss is worth celebrating!",
        encouragement: "Don't worry about any setbacks - even the most skilled delvers face challenges. What matters is that you keep climbing, naa~",
        nextSteps: "Focus on consistency in your training and don't push too hard too fast. The Abyss rewards patience and persistence.",
        personalTouch: "I'll be here to support you every step of the way. Together, we'll conquer whatever the Abyss throws at us!"
      };
    }
  }

  // Store user interaction memory
  async storeInteractionMemory(userId: string, interactionType: string, content: string): Promise<void> {
    await nanachiMemoryService.storeMemory({
      userId,
      memoryType: 'conversation',
      title: `${interactionType} interaction`,
      content,
      importance: 2,
    });
  }
}

export const nanachiAnalysisService = new NanachiAnalysisService();