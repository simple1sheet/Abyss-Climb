import { storage } from "../storage";
import { type InsertQuest } from "@shared/schema";
import { generateQuest } from "./openai";
import { getAllSkillTypes } from "@shared/skillTree";

export class QuestGenerator {
  private readonly QUEST_TYPES = {
    TECHNIQUE: "technique",
    CREATIVE: "creative",
    SOCIAL: "social",
    ENDURANCE: "endurance",
    PROGRESSION: "progression",
    EXPLORATION: "exploration",
    MINDFULNESS: "mindfulness",
    STRENGTH: "strength"
  };

  private readonly WEEKLY_QUEST_TEMPLATES = {
    [this.QUEST_TYPES.ENDURANCE]: [
      {
        title: "Weekly Endurance Challenge",
        description: "Complete 15 boulder problems across multiple sessions this week, focusing on building climbing stamina and consistency",
        difficulty: "hard",
        xpReward: 400,
        requirements: { type: "problems", count: 15, gradeRange: "comfort", timeframe: "week" },
        duration: 7 // days
      },
      {
        title: "Marathon Boulder Session",
        description: "Complete a single climbing session with 12+ problems, demonstrating sustained climbing performance",
        difficulty: "extreme",
        xpReward: 500,
        requirements: { type: "single_session", count: 12, gradeRange: "comfort", timeframe: "week" },
        duration: 7
      }
    ],
    [this.QUEST_TYPES.PROGRESSION]: [
      {
        title: "Grade Progression Challenge",
        description: "Successfully complete 3 problems that are one grade harder than your current comfort level",
        difficulty: "extreme",
        xpReward: 600,
        requirements: { type: "progression", count: 3, gradeRange: "challenge", timeframe: "week" },
        duration: 7
      },
      {
        title: "Consistent Climber",
        description: "Complete at least 2 climbing sessions on 4 different days this week",
        difficulty: "hard",
        xpReward: 450,
        requirements: { type: "consistency", count: 4, gradeRange: "any", timeframe: "week" },
        duration: 7
      }
    ],
    [this.QUEST_TYPES.EXPLORATION]: [
      {
        title: "Style Master",
        description: "Complete 8 problems using 6 different climbing styles (overhang, slab, technical, etc.)",
        difficulty: "hard",
        xpReward: 350,
        requirements: { type: "style_variety", count: 8, gradeRange: "comfort", timeframe: "week" },
        duration: 7
      },
      {
        title: "Outdoor Adventure",
        description: "Complete at least one outdoor climbing session this week",
        difficulty: "medium",
        xpReward: 300,
        requirements: { type: "outdoor", count: 1, gradeRange: "any", timeframe: "week" },
        duration: 7
      }
    ],
    [this.QUEST_TYPES.SOCIAL]: [
      {
        title: "Community Builder",
        description: "Help 3 other climbers by sharing beta or encouragement during your sessions this week",
        difficulty: "medium",
        xpReward: 250,
        requirements: { type: "social_help", count: 3, gradeRange: "any", timeframe: "week" },
        duration: 7
      }
    ]
  };

  private readonly DAILY_QUEST_TEMPLATES = {
    [this.QUEST_TYPES.TECHNIQUE]: [
      {
        title: "Footwork Focus",
        description: "Master precise footwork by completing 4 problems focusing on toe placement and weight distribution",
        difficulty: "medium",
        xpReward: 85,
        requirements: { type: "technique", count: 4, gradeRange: "comfort", skill: "footwork" }
      },
      {
        title: "Grip Mastery",
        description: "Practice different grip techniques by completing 3 problems using crimps, pinches, and slopers",
        difficulty: "hard",
        xpReward: 120,
        requirements: { type: "grip_variety", count: 3, gradeRange: "comfort", skill: "grip_technique" }
      },
      {
        title: "Body Position Pro",
        description: "Improve body positioning by completing 3 problems focusing on hip placement and core engagement",
        difficulty: "medium",
        xpReward: 95,
        requirements: { type: "body_position", count: 3, gradeRange: "comfort", skill: "body_positioning" }
      },
      {
        title: "Flow State Training",
        description: "Develop smooth movement by completing 2 problems without pausing mid-climb",
        difficulty: "hard",
        xpReward: 110,
        requirements: { type: "flow_state", count: 2, gradeRange: "comfort", skill: "flow_state" }
      },
      {
        title: "Heel Hook Hero",
        description: "Master heel hooks by completing 3 problems specifically using heel hook techniques",
        difficulty: "hard",
        xpReward: 130,
        requirements: { type: "heel_hooks", count: 3, gradeRange: "comfort", skill: "heel_hooks" }
      }
    ],
    [this.QUEST_TYPES.CREATIVE]: [
      {
        title: "Beta Breaker",
        description: "Think outside the box by completing 3 problems using non-standard beta",
        difficulty: "hard",
        xpReward: 120,
        requirements: { type: "creative_beta", count: 3, gradeRange: "comfort", skill: "creative_problem_solving" }
      },
      {
        title: "Style Switching",
        description: "Enhance adaptability by completing 3 problems using different climbing styles",
        difficulty: "medium",
        xpReward: 100,
        requirements: { type: "style_variations", count: 3, gradeRange: "comfort", skill: "adaptability" }
      },
      {
        title: "Blindfolded Boulder",
        description: "Enhance body awareness by completing 1 easy problem with eyes closed",
        difficulty: "extreme",
        xpReward: 150,
        requirements: { type: "blindfolded", count: 1, gradeRange: "easy", skill: "body_awareness" }
      },
      {
        title: "Elimination Game",
        description: "Challenge yourself by completing 2 problems while eliminating specific holds",
        difficulty: "hard",
        xpReward: 130,
        requirements: { type: "elimination", count: 2, gradeRange: "comfort", skill: "creative_problem_solving" }
      },
      {
        title: "Mirror Match",
        description: "Practice symmetry by completing 2 problems using only matching hand positions",
        difficulty: "medium",
        xpReward: 95,
        requirements: { type: "mirror_climbing", count: 2, gradeRange: "comfort", skill: "coordination" }
      }
    ],
    [this.QUEST_TYPES.SOCIAL]: [
      {
        title: "Buddy System",
        description: "Climb with a partner and complete 4 problems together, sharing beta",
        difficulty: "easy",
        xpReward: 70,
        requirements: { type: "partner_climbing", count: 4, gradeRange: "comfort", skill: "communication" }
      },
      {
        title: "Teaching Moment",
        description: "Help a newer climber by teaching them beta for 2 problems",
        difficulty: "easy",
        xpReward: 85,
        requirements: { type: "teaching", count: 2, gradeRange: "easy", skill: "teaching" }
      },
      {
        title: "Group Challenge",
        description: "Join a group session and complete 3 problems with encouragement from others",
        difficulty: "medium",
        xpReward: 90,
        requirements: { type: "group_climbing", count: 3, gradeRange: "comfort", skill: "social_climbing" }
      },
      {
        title: "Beta Share",
        description: "Share and receive beta by working on 2 problems with different climbers",
        difficulty: "easy",
        xpReward: 75,
        requirements: { type: "beta_sharing", count: 2, gradeRange: "comfort", skill: "communication" }
      }
    ],
    [this.QUEST_TYPES.ENDURANCE]: [
      {
        title: "Volume Training",
        description: "Build endurance with 8 problems at easy grades without long breaks",
        difficulty: "medium",
        xpReward: 100,
        requirements: { type: "volume", count: 8, gradeRange: "easy", skill: "endurance" }
      },
      {
        title: "Circuit Challenge",
        description: "Complete a 6-problem circuit 2 times with minimal rest between rounds",
        difficulty: "hard",
        xpReward: 140,
        requirements: { type: "circuit", count: 6, rounds: 2, gradeRange: "comfort", skill: "endurance" }
      },
      {
        title: "Pump Test",
        description: "Test your endurance by completing 4 problems on overhangs consecutively",
        difficulty: "hard",
        xpReward: 120,
        requirements: { type: "consecutive", count: 4, wallAngle: "overhang", gradeRange: "comfort", skill: "endurance" }
      },
      {
        title: "Time Trial",
        description: "Complete 5 problems within 30 minutes to test speed and efficiency",
        difficulty: "medium",
        xpReward: 110,
        requirements: { type: "time_trial", count: 5, timeLimit: "30min", gradeRange: "comfort", skill: "power_endurance" }
      }
    ],
    [this.QUEST_TYPES.PROGRESSION]: [
      {
        title: "Project Push",
        description: "Work on pushing your limits by attempting 1 problem at your maximum grade",
        difficulty: "hard",
        xpReward: 150,
        requirements: { type: "problems", count: 1, gradeRange: "challenge", skill: "limit_testing" }
      },
      {
        title: "Grade Breakthrough",
        description: "Attempt to break through to the next grade by trying 2 problems above your comfort zone",
        difficulty: "hard",
        xpReward: 180,
        requirements: { type: "grade_push", count: 2, gradeRange: "challenge", skill: "progression" }
      },
      {
        title: "Limit Test",
        description: "Test your absolute limit by attempting 1 problem 2 grades above your comfort zone",
        difficulty: "extreme",
        xpReward: 200,
        requirements: { type: "limit_test", count: 1, gradeRange: "extreme", skill: "limit_testing" }
      }
    ],
    [this.QUEST_TYPES.EXPLORATION]: [
      {
        title: "Area Explorer",
        description: "Explore new sections by completing 3 problems in an area you haven't climbed before",
        difficulty: "medium",
        xpReward: 90,
        requirements: { type: "new_area", count: 3, gradeRange: "comfort", skill: "exploration" }
      },
      {
        title: "Outdoor Adventure",
        description: "Connect with nature by completing 3 outdoor boulder problems",
        difficulty: "medium",
        xpReward: 140,
        requirements: { type: "problems", count: 3, location: "outdoor", gradeRange: "comfort", skill: "outdoor_climbing" }
      },
      {
        title: "Angle Variety",
        description: "Experience different angles by completing 1 slab, 1 vertical, and 1 overhang problem",
        difficulty: "medium",
        xpReward: 105,
        requirements: { type: "angle_variety", count: 3, gradeRange: "comfort", skill: "adaptability" }
      }
    ],
    [this.QUEST_TYPES.MINDFULNESS]: [
      {
        title: "Flow State",
        description: "Focus on smooth, flowing movement by completing 3 problems without stopping mid-climb",
        difficulty: "medium",
        xpReward: 100,
        requirements: { type: "flow_state", count: 3, gradeRange: "comfort", skill: "flow_state" }
      },
      {
        title: "Breath Control",
        description: "Practice controlled breathing by completing 2 problems while maintaining steady breathing",
        difficulty: "medium",
        xpReward: 90,
        requirements: { type: "breath_control", count: 2, gradeRange: "comfort", skill: "breathing" }
      },
      {
        title: "Mindful Movement",
        description: "Climb with full awareness by completing 3 problems while focusing on every movement",
        difficulty: "easy",
        xpReward: 80,
        requirements: { type: "mindful_climbing", count: 3, gradeRange: "easy", skill: "mindfulness" }
      },
      {
        title: "Visualization Victory",
        description: "Enhance mental preparation by visualizing and then completing 2 problems",
        difficulty: "medium",
        xpReward: 95,
        requirements: { type: "visualization", count: 2, gradeRange: "comfort", skill: "visualization" }
      }
    ],
    [this.QUEST_TYPES.STRENGTH]: [
      {
        title: "Power Builder",
        description: "Build explosive power by completing 3 dynamic problems requiring big moves",
        difficulty: "hard",
        xpReward: 130,
        requirements: { type: "dynamic", count: 3, gradeRange: "comfort", skill: "power" }
      },
      {
        title: "Finger Strength",
        description: "Develop finger strength by completing 2 problems with small holds and crimps",
        difficulty: "hard",
        xpReward: 125,
        requirements: { type: "finger_strength", count: 2, gradeRange: "comfort", skill: "finger_strength" }
      },
      {
        title: "Core Challenge",
        description: "Strengthen your core by completing 3 overhang problems focusing on body tension",
        difficulty: "hard",
        xpReward: 120,
        requirements: { type: "core_strength", count: 3, wallAngle: "overhang", gradeRange: "comfort", skill: "core_strength" }
      }
    ]
  };

  private readonly LAYER_QUEST_TEMPLATES = {
    1: {
      title: "First Steps into the Abyss",
      description: "Complete 3 boulder problems of V2+ difficulty to prove your readiness",
      requirements: { type: "problems", count: 3, gradeRange: "V2+" },
      xpReward: 150,
      difficulty: "medium",
      duration: 14
    },
    2: {
      title: "Navigate the Dense Woods",
      description: "Complete 3 overhang problems in one session while maintaining technique",
      requirements: { type: "problems", count: 3, wallAngle: "overhang", sessionBased: true },
      xpReward: 200,
      difficulty: "hard",
      duration: 21
    },
    3: {
      title: "Scale the Great Fault",
      description: "Complete 5 boulder problems of V4+ difficulty to master vertical challenges",
      requirements: { type: "problems", count: 5, gradeRange: "V4+" },
      xpReward: 300,
      difficulty: "hard",
      duration: 28
    },
    4: {
      title: "Conquer the Goblets of Giants",
      description: "Complete 8 boulder problems of V4+ difficulty using all 4 grip types (crimp, pinch, sloper, jug)",
      requirements: { type: "problems", count: 8, gradeRange: "V4+", gripVariety: 4 },
      xpReward: 600,
      difficulty: "hard",
      duration: 35
    },
    5: {
      title: "Cross the Sea of Corpses",
      description: "Complete 5 boulder problems of V5+ difficulty with 2 overhangs and 2 technical problems across multiple sessions",
      requirements: { type: "problems", count: 5, gradeRange: "V5+", overhangCount: 2, technicalCount: 2 },
      xpReward: 800,
      difficulty: "extreme",
      duration: 42
    },
    6: {
      title: "Enter the Capital of Unreturned",
      description: "Complete 25 boulder problems of V4+ difficulty across 5 sessions with 10 different styles and 3 outdoor problems",
      requirements: { type: "problems", count: 25, gradeRange: "V4+", sessionCount: 5, styleVariety: 10, outdoorCount: 3 },
      xpReward: 1200,
      difficulty: "extreme",
      duration: 56
    },
    7: {
      title: "Face the Final Maelstrom",
      description: "Complete 3 boulder problems of V6+ difficulty including 1 V7+ overhang and achieve a perfect session (no falls)",
      requirements: { type: "problems", count: 3, gradeRange: "V6+", v7PlusOverhang: 1, perfectSession: true },
      xpReward: 1500,
      difficulty: "extreme",
      duration: 70
    }
  };

  async generateQuestForUser(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userSkills = await storage.getUserSkills(userId);
    const currentLayer = user.currentLayer || 1;

    // Generate daily quest only (layer quests are handled separately)
    await this.generateDailyQuest(userId, currentLayer, userSkills);
  }

  // New method for automatic quest generation
  async generateAutomaticQuests(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userSkills = await storage.getUserSkills(userId);
    const currentLayer = user.currentLayer || 1;

    // Generate daily quests (up to 3 per day)
    await this.generateAutomaticDailyQuests(userId, currentLayer, userSkills);
    
    // Generate weekly quest if needed
    await this.generateAutomaticWeeklyQuest(userId, currentLayer, userSkills);
  }

  private async generateAutomaticDailyQuests(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get existing daily quests for today
    const existingQuests = await storage.getUserQuestsInDateRange(userId, today, tomorrow);
    const existingDailyQuests = existingQuests.filter(q => q.questType === 'daily' && q.autoGenerated);

    // Generate up to 3 daily quests
    const questsToGenerate = Math.max(0, 3 - existingDailyQuests.length);
    
    for (let i = 0; i < questsToGenerate; i++) {
      try {
        await this.generateSingleAutomaticDailyQuest(userId, currentLayer, userSkills, existingQuests);
        // Add small delay between generations
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to generate daily quest ${i + 1}:`, error);
      }
    }
  }

  private async generateSingleAutomaticDailyQuest(userId: string, currentLayer: number, userSkills: any[], existingQuests: any[]): Promise<void> {
    const usedTitles = existingQuests.map(q => q.title);
    
    // Select a random quest type
    const questTypes = Object.keys(this.QUEST_TYPES);
    const randomType = questTypes[Math.floor(Math.random() * questTypes.length)];
    const selectedType = this.QUEST_TYPES[randomType as keyof typeof this.QUEST_TYPES];
    
    const typeTemplates = this.DAILY_QUEST_TEMPLATES[selectedType];
    const availableTemplates = typeTemplates.filter(
      (template: any) => !usedTitles.includes(template.title)
    );

    if (availableTemplates.length === 0) {
      // Use AI generation as fallback
      await this.generateAutomaticAIQuest(userId, currentLayer, userSkills);
      return;
    }

    const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    const quest: InsertQuest = {
      userId,
      title: randomTemplate.title,
      description: randomTemplate.description,
      questType: "daily",
      status: "active",
      xpReward: randomTemplate.xpReward,
      maxProgress: randomTemplate.requirements.count,
      progress: 0,
      layer: currentLayer,
      requirements: randomTemplate.requirements,
      difficulty: randomTemplate.difficulty,
      difficultyRating: randomTemplate.difficulty === "extreme" ? 9 : 
                       randomTemplate.difficulty === "hard" ? 7 : 
                       randomTemplate.difficulty === "medium" ? 5 : 3,
      generatedByAi: false,
      autoGenerated: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await storage.createQuest(quest);
  }

  private async generateAutomaticWeeklyQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user already has an active weekly quest
    const existingQuests = await storage.getUserQuests(userId, "active");
    const hasActiveWeeklyQuest = existingQuests.some(q => q.questType === 'weekly');

    if (hasActiveWeeklyQuest) {
      return; // Already has a weekly quest
    }

    // Check if user completed a weekly quest recently (within last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentQuests = await storage.getUserQuestsInDateRange(userId, weekAgo, today);
    const hasRecentWeeklyQuest = recentQuests.some(q => q.questType === 'weekly' && q.status === 'completed');

    if (hasRecentWeeklyQuest) {
      return; // Recently completed a weekly quest
    }

    // Generate a new weekly quest
    const weeklyTypes = Object.keys(this.WEEKLY_QUEST_TEMPLATES);
    const randomType = weeklyTypes[Math.floor(Math.random() * weeklyTypes.length)];
    const typeTemplates = this.WEEKLY_QUEST_TEMPLATES[randomType as keyof typeof this.WEEKLY_QUEST_TEMPLATES];
    const randomTemplate = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

    const quest: InsertQuest = {
      userId,
      title: randomTemplate.title,
      description: randomTemplate.description,
      questType: "weekly",
      status: "active",
      xpReward: randomTemplate.xpReward,
      maxProgress: randomTemplate.requirements.count,
      progress: 0,
      layer: currentLayer,
      requirements: randomTemplate.requirements,
      difficulty: randomTemplate.difficulty,
      difficultyRating: randomTemplate.difficulty === "extreme" ? 9 : 
                       randomTemplate.difficulty === "hard" ? 7 : 
                       randomTemplate.difficulty === "medium" ? 5 : 3,
      generatedByAi: false,
      autoGenerated: true,
      expiresAt: new Date(Date.now() + randomTemplate.duration * 24 * 60 * 60 * 1000),
    };

    await storage.createQuest(quest);
  }

  private async generateAutomaticAIQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    try {
      const recentGrades = userSkills.slice(0, 5).map(skill => skill.maxGrade || "V0");
      const whistleLevel = userSkills.length > 0 ? Math.max(...userSkills.map(s => s.level || 1)) : 1;
      
      const aiQuest = await generateQuest(currentLayer, whistleLevel, userSkills, recentGrades);
      
      const quest: InsertQuest = {
        userId,
        title: aiQuest.title,
        description: aiQuest.description,
        questType: "daily",
        status: "active",
        xpReward: aiQuest.xpReward,
        maxProgress: aiQuest.requirements.count,
        progress: 0,
        layer: currentLayer,
        requirements: aiQuest.requirements,
        difficulty: aiQuest.difficulty,
        difficultyRating: aiQuest.difficultyRating,
        generatedByAi: true,
        autoGenerated: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      await storage.createQuest(quest);
    } catch (error) {
      console.error("AI quest generation failed:", error);
      
      // Fallback quest
      const fallbackQuest: InsertQuest = {
        userId,
        title: "Climbing Practice",
        description: "Complete 3 boulder problems to continue your climbing journey",
        questType: "daily",
        status: "active",
        xpReward: 75,
        maxProgress: 3,
        progress: 0,
        layer: currentLayer,
        requirements: { type: "problems", count: 3, gradeRange: "comfort" },
        difficulty: "medium",
        difficultyRating: 5,
        generatedByAi: false,
        autoGenerated: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      await storage.createQuest(fallbackQuest);
    }
  }

  // Method to clean up expired quests
  async cleanupExpiredQuests(): Promise<void> {
    try {
      const now = new Date();
      const expiredQuests = await storage.getExpiredQuests(now);
      
      for (const quest of expiredQuests) {
        await storage.updateQuest(quest.id, { status: "expired" });
      }
      
      console.log(`Cleaned up ${expiredQuests.length} expired quests`);
    } catch (error) {
      console.error("Failed to cleanup expired quests:", error);
    }
  }

  // Method to generate quests for all users (for daily cron job)
  async generateQuestsForAllUsers(): Promise<void> {
    try {
      const users = await storage.getAllUsers();
      
      for (const user of users) {
        try {
          await this.generateAutomaticQuests(user.id);
          // Add small delay between users
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Failed to generate quests for user ${user.id}:`, error);
        }
      }
      
      console.log(`Generated quests for ${users.length} users`);
    } catch (error) {
      console.error("Failed to generate quests for all users:", error);
    }
  }

  private async generateLayerQuestIfNeeded(userId: string, currentLayer: number): Promise<void> {
    const existingQuests = await storage.getUserQuests(userId, "active");
    const hasActiveLayerQuest = existingQuests.some(
      quest => quest.questType === "layer" && quest.layer === currentLayer
    );

    const allQuests = await storage.getUserQuests(userId);
    const hasCompletedLayerQuest = allQuests.some(
      quest => quest.questType === "layer" && quest.layer === currentLayer
    );

    if (!hasActiveLayerQuest && !hasCompletedLayerQuest) {
      const layerTemplate = this.LAYER_QUEST_TEMPLATES[currentLayer as keyof typeof this.LAYER_QUEST_TEMPLATES];
      if (layerTemplate) {
        const quest: InsertQuest = {
          userId,
          title: layerTemplate.title,
          description: layerTemplate.description,
          questType: "layer",
          status: "active",
          xpReward: layerTemplate.xpReward,
          maxProgress: layerTemplate.requirements.count,
          progress: 0,
          layer: currentLayer,
          requirements: layerTemplate.requirements,
          difficulty: layerTemplate.difficulty,
          difficultyRating: layerTemplate.difficulty === "extreme" ? 9 : 7,
          generatedByAi: false,
          expiresAt: new Date(Date.now() + layerTemplate.duration * 24 * 60 * 60 * 1000),
        };

        await storage.createQuest(quest);
      }
    }
  }

  private async generateDailyQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    const existingQuests = await storage.getUserQuests(userId, "active");
    const existingDailyQuests = existingQuests.filter(quest => quest.questType === "daily");
    const usedTitles = existingDailyQuests.map(quest => quest.title);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recentQuests = await storage.getUserQuestsInDateRange(userId, today, new Date());
    const recentTitles = recentQuests.map(quest => quest.title);
    
    const allUsedTitles = [...new Set([...usedTitles, ...recentTitles])];

    // Get quest types already used today
    const usedTypes = new Set();
    [...existingDailyQuests, ...recentQuests].forEach(quest => {
      for (const [type, templates] of Object.entries(this.DAILY_QUEST_TEMPLATES)) {
        if (templates.some((template: any) => template.title === quest.title)) {
          usedTypes.add(type);
        }
      }
    });

    // Select quest type with variety
    const availableTypes = Object.keys(this.QUEST_TYPES).filter(type => {
      const questType = this.QUEST_TYPES[type as keyof typeof this.QUEST_TYPES];
      return !usedTypes.has(questType);
    });

    const questTypesToUse = availableTypes.length > 0 ? availableTypes : Object.keys(this.QUEST_TYPES);

    if (questTypesToUse.length === 0) {
      await this.generateAIQuest(userId, currentLayer, userSkills);
      return;
    }

    const randomTypeIndex = Math.floor(Math.random() * questTypesToUse.length);
    const selectedType = this.QUEST_TYPES[questTypesToUse[randomTypeIndex] as keyof typeof this.QUEST_TYPES];
    
    const typeTemplates = this.DAILY_QUEST_TEMPLATES[selectedType];
    const availableTemplates = typeTemplates.filter(
      (template: any) => !allUsedTitles.includes(template.title)
    );

    if (availableTemplates.length === 0) {
      await this.generateAIQuest(userId, currentLayer, userSkills);
      return;
    }

    const randomTemplateIndex = Math.floor(Math.random() * availableTemplates.length);
    const selectedTemplate = availableTemplates[randomTemplateIndex];
    
    const quest: InsertQuest = {
      userId,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      questType: "daily",
      status: "active",
      xpReward: selectedTemplate.xpReward,
      maxProgress: selectedTemplate.requirements.count,
      progress: 0,
      layer: currentLayer,
      requirements: selectedTemplate.requirements,
      difficulty: selectedTemplate.difficulty,
      difficultyRating: selectedTemplate.difficulty === "extreme" ? 9 : 
                       selectedTemplate.difficulty === "hard" ? 7 : 
                       selectedTemplate.difficulty === "medium" ? 5 : 3,
      generatedByAi: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await storage.createQuest(quest);
  }

  private async generateAIQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    try {
      const recentGrades = userSkills.slice(0, 5).map(skill => skill.maxGrade || "V0");
      const whistleLevel = userSkills.length > 0 ? Math.max(...userSkills.map(s => s.level || 1)) : 1;
      
      const aiQuest = await generateQuest(currentLayer, whistleLevel, userSkills, recentGrades);
      
      const quest: InsertQuest = {
        userId,
        title: aiQuest.title,
        description: aiQuest.description,
        questType: "daily",
        status: "active",
        xpReward: aiQuest.xpReward,
        maxProgress: aiQuest.requirements.count,
        progress: 0,
        layer: currentLayer,
        requirements: aiQuest.requirements,
        difficulty: aiQuest.difficulty,
        difficultyRating: aiQuest.difficultyRating,
        generatedByAi: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      await storage.createQuest(quest);
    } catch (error) {
      console.error("AI quest generation failed:", error);
      
      const fallbackQuest: InsertQuest = {
        userId,
        title: "Climbing Practice",
        description: "Complete 3 boulder problems to continue your climbing journey",
        questType: "daily",
        status: "active",
        xpReward: 75,
        maxProgress: 3,
        progress: 0,
        layer: currentLayer,
        requirements: { type: "problems", count: 3, gradeRange: "comfort" },
        difficulty: "medium",
        difficultyRating: 5,
        generatedByAi: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      await storage.createQuest(fallbackQuest);
    }
  }
}

export const questGenerator = new QuestGenerator();