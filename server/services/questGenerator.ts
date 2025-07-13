import { storage } from "../storage";
import { InsertQuest } from "../../shared/schema";
import { generateQuest } from "./openai";

export class QuestGenerator {
  private readonly LAYER_CONFIGS = {
    1: { name: "Edge of the Abyss", grades: ["V0", "V1", "V2"], maxQuests: 2 },
    2: { name: "Forest of Temptation", grades: ["V3", "V4", "V5"], maxQuests: 3 },
    3: { name: "Great Fault", grades: ["V6", "V7", "V8"], maxQuests: 4 },
    4: { name: "Goblets of Giants", grades: ["V9", "V10", "V11"], maxQuests: 5 },
    5: { name: "Sea of Corpses", grades: ["V12", "V13", "V14"], maxQuests: 6 },
    6: { name: "Capital of the Unreturned", grades: ["V15", "V16", "V17"], maxQuests: 8 },
    7: { name: "Final Maelstrom", grades: ["V18+"], maxQuests: 10 },
  };

  private readonly QUEST_TYPES = {
    TECHNIQUE: 'technique',
    CREATIVE: 'creative', 
    SOCIAL: 'social',
    ENDURANCE: 'endurance',
    PROGRESSION: 'progression',
    EXPLORATION: 'exploration',
    MINDFULNESS: 'mindfulness'
  };

  private readonly DAILY_QUEST_TEMPLATES = {
    [this.QUEST_TYPES.TECHNIQUE]: [
      {
        title: "Crimp Master",
        description: "Focus on crimp holds by completing 4 problems with primarily crimp holds",
        difficulty: "medium",
        xpReward: 120,
        requirements: { type: "problems", count: 4, style: "crimps", gradeRange: "comfort" }
      },
      {
        title: "Sloper Specialist",
        description: "Master sloper holds by completing 3 problems with primarily sloper holds",
        difficulty: "hard",
        xpReward: 180,
        requirements: { type: "problems", count: 3, style: "slopers", gradeRange: "comfort" }
      },
      {
        title: "Footwork Focus",
        description: "Practice precise footwork on 4 slab problems requiring delicate balance",
        difficulty: "medium", 
        xpReward: 85,
        requirements: { type: "problems", count: 4, wallAngle: "slab", gradeRange: "comfort" }
      },
      {
        title: "Mantling Master",
        description: "Practice mantling technique by completing 3 problems that require topping out",
        difficulty: "medium",
        xpReward: 90,
        requirements: { type: "problems", count: 3, style: "mantles", gradeRange: "comfort" }
      },
      {
        title: "Heel Hook Hero",
        description: "Master heel hooks by completing 3 problems that require heel hook techniques",
        difficulty: "medium",
        xpReward: 95,
        requirements: { type: "problems", count: 3, style: "heel_hooks", gradeRange: "comfort" }
      }
    ],
    [this.QUEST_TYPES.CREATIVE]: [
      {
        title: "Beta Breaker",
        description: "Find alternative sequences by completing 3 problems using unconventional beta",
        difficulty: "medium",
        xpReward: 100,
        requirements: { type: "alternative_beta", count: 3, gradeRange: "comfort" }
      },
      {
        title: "Style Switcher",
        description: "Adapt your climbing style by completing the same problem 3 different ways",
        difficulty: "hard",
        xpReward: 120,
        requirements: { type: "style_variations", count: 3, gradeRange: "comfort" }
      },
      {
        title: "Blindfolded Boulder",
        description: "Enhance body awareness by completing 1 easy problem with eyes closed",
        difficulty: "medium",
        xpReward: 110,
        requirements: { type: "blindfolded", count: 1, gradeRange: "easy" }
      },
      {
        title: "Elimination Game",
        description: "Challenge yourself by completing 2 problems while eliminating specific holds",
        difficulty: "hard",
        xpReward: 130,
        requirements: { type: "elimination", count: 2, gradeRange: "comfort" }
      },
      {
        title: "Mirror Match",
        description: "Practice symmetry by completing 2 problems using only matching hand positions",
        difficulty: "medium",
        xpReward: 95,
        requirements: { type: "mirror_climbing", count: 2, gradeRange: "comfort" }
      }
    ],
    [this.QUEST_TYPES.SOCIAL]: [
      {
        title: "Buddy System",
        description: "Climb with a partner and complete 4 problems together, sharing beta",
        difficulty: "easy",
        xpReward: 70,
        requirements: { type: "partner_climbing", count: 4, gradeRange: "comfort" }
      },
      {
        title: "Teaching Moment",
        description: "Help a newer climber by teaching them beta for 2 problems",
        difficulty: "easy",
        xpReward: 85,
        requirements: { type: "teaching", count: 2, gradeRange: "easy" }
      },
      {
        title: "Group Challenge",
        description: "Join a group session and complete 3 problems with encouragement from others",
        difficulty: "medium",
        xpReward: 90,
        requirements: { type: "group_climbing", count: 3, gradeRange: "comfort" }
      },
      {
        title: "Beta Share",
        description: "Share and receive beta by working on 2 problems with different climbers",
        difficulty: "easy",
        xpReward: 75,
        requirements: { type: "beta_sharing", count: 2, gradeRange: "comfort" }
      },
      {
        title: "Cheer Squad",
        description: "Support others by cheering on 3 different climbers attempting their projects",
        difficulty: "easy",
        xpReward: 60,
        requirements: { type: "cheering", count: 3, gradeRange: "any" }
      }
    ],
    [this.QUEST_TYPES.ENDURANCE]: [
      {
        title: "Volume Training",
        description: "Build endurance with 8 problems at easy grades without long breaks",
        difficulty: "medium",
        xpReward: 100,
        requirements: { type: "problems", count: 8, gradeRange: "easy", timeLimit: "45min" }
      },
      {
        title: "Circuit Challenge",
        description: "Complete a 6-problem circuit 2 times with minimal rest between rounds",
        difficulty: "hard",
        xpReward: 140,
        requirements: { type: "circuit", count: 6, rounds: 2, gradeRange: "comfort" }
      },
      {
        title: "Pump Test",
        description: "Test your endurance by completing 4 problems on overhangs consecutively",
        difficulty: "hard",
        xpReward: 120,
        requirements: { type: "consecutive", count: 4, wallAngle: "overhang", gradeRange: "comfort" }
      },
      {
        title: "Time Trial",
        description: "Complete 5 problems within 30 minutes to test speed and efficiency",
        difficulty: "medium",
        xpReward: 110,
        requirements: { type: "time_trial", count: 5, timeLimit: "30min", gradeRange: "comfort" }
      },
      {
        title: "Stamina Builder",
        description: "Climb for 60 minutes straight, completing at least 6 problems",
        difficulty: "medium",
        xpReward: 130,
        requirements: { type: "duration", count: 6, timeLimit: "60min", gradeRange: "easy" }
      }
    ],
    [this.QUEST_TYPES.PROGRESSION]: [
      {
        title: "Project Push",
        description: "Work on pushing your limits by attempting 1 problem at your maximum grade",
        difficulty: "hard",
        xpReward: 150,
        requirements: { type: "problems", count: 1, gradeRange: "challenge" }
      },
      {
        title: "Grade Breakthrough",
        description: "Attempt to break through to the next grade by trying 2 problems above your comfort zone",
        difficulty: "hard",
        xpReward: 180,
        requirements: { type: "grade_push", count: 2, gradeRange: "challenge" }
      },
      {
        title: "Limit Test",
        description: "Test your absolute limit by attempting 1 problem 2 grades above your comfort zone",
        difficulty: "extreme",
        xpReward: 200,
        requirements: { type: "limit_test", count: 1, gradeRange: "extreme" }
      }
    ],
    [this.QUEST_TYPES.EXPLORATION]: [
      {
        title: "Area Explorer",
        description: "Explore new sections by completing 3 problems in an area you haven't climbed before",
        difficulty: "medium",
        xpReward: 90,
        requirements: { type: "new_area", count: 3, gradeRange: "comfort" }
      },
      {
        title: "Outdoor Adventure",
        description: "Connect with nature by completing 3 outdoor boulder problems",
        difficulty: "medium",
        xpReward: 140,
        requirements: { type: "problems", count: 3, location: "outdoor", gradeRange: "comfort" }
      },
      {
        title: "Color Quest",
        description: "Complete 4 problems of the same color/hold type you rarely climb",
        difficulty: "medium",
        xpReward: 85,
        requirements: { type: "color_focus", count: 4, gradeRange: "comfort" }
      },
      {
        title: "Angle Variety",
        description: "Experience different angles by completing 1 slab, 1 vertical, and 1 overhang problem",
        difficulty: "medium",
        xpReward: 105,
        requirements: { type: "angle_variety", count: 3, gradeRange: "comfort" }
      }
    ],
    [this.QUEST_TYPES.MINDFULNESS]: [
      {
        title: "Flow State",
        description: "Focus on smooth, flowing movement by completing 3 problems without stopping mid-climb",
        difficulty: "medium",
        xpReward: 100,
        requirements: { type: "flow_state", count: 3, gradeRange: "comfort" }
      },
      {
        title: "Breath Control",
        description: "Practice controlled breathing by completing 2 problems while maintaining steady breathing",
        difficulty: "medium",
        xpReward: 90,
        requirements: { type: "breath_control", count: 2, gradeRange: "comfort" }
      },
      {
        title: "Mindful Movement",
        description: "Climb with full awareness by completing 3 problems while focusing on every movement",
        difficulty: "easy",
        xpReward: 80,
        requirements: { type: "mindful_climbing", count: 3, gradeRange: "easy" }
      },
      {
        title: "Visualization Victory",
        description: "Enhance mental preparation by visualizing and then completing 2 problems",
        difficulty: "medium",
        xpReward: 95,
        requirements: { type: "visualization", count: 2, gradeRange: "comfort" }
      },
      {
        title: "Patience Practice",
        description: "Develop patience by spending 10 minutes analyzing 1 problem before attempting",
        difficulty: "medium",
        xpReward: 110,
        requirements: { type: "analysis", count: 1, timeLimit: "10min", gradeRange: "challenge" }
      }
    ]
  };

  private readonly LAYER_QUEST_TEMPLATES = {
    1: { // Edge of Abyss
      title: "First Steps into the Abyss",
      description: "Complete 10 boulder problems of V0-V2 difficulty to prove your readiness",
      requirements: { type: "problems", count: 10, gradeRange: "V0-V2" },
      xpReward: 300,
      difficulty: "hard",
      duration: 14 // days
    },
    2: { // Forest of Temptation
      title: "Navigate the Dense Woods",
      description: "Complete 8 boulder problems of V3-V5 difficulty while maintaining technique",
      requirements: { type: "problems", count: 8, gradeRange: "V3-V5" },
      xpReward: 500,
      difficulty: "hard",
      duration: 21
    },
    3: { // Great Fault
      title: "Scale the Massive Cliff",
      description: "Complete 6 boulder problems of V6-V8 difficulty to master the vertical challenge",
      requirements: { type: "problems", count: 6, gradeRange: "V6-V8" },
      xpReward: 750,
      difficulty: "hard",
      duration: 28
    },
    4: { // Goblets of Giants
      title: "Conquer the Giant's Challenge",
      description: "Complete 5 boulder problems of V9-V11 difficulty to prove your elite status",
      requirements: { type: "problems", count: 5, gradeRange: "V9-V11" },
      xpReward: 1000,
      difficulty: "extreme",
      duration: 35
    },
    5: { // Sea of Corpses
      title: "Cross the Treacherous Waters",
      description: "Complete 4 boulder problems of V12-V14 difficulty in the danger zone",
      requirements: { type: "problems", count: 4, gradeRange: "V12-V14" },
      xpReward: 1500,
      difficulty: "extreme",
      duration: 42
    },
    6: { // Capital of the Unreturned
      title: "Enter the Forbidden City",
      description: "Complete 3 boulder problems of V15-V17 difficulty at the point of no return",
      requirements: { type: "problems", count: 3, gradeRange: "V15-V17" },
      xpReward: 2000,
      difficulty: "extreme",
      duration: 56
    },
    7: { // Final Maelstrom
      title: "Face the Ultimate Challenge",
      description: "Complete 2 boulder problems of V18+ difficulty in the deepest depths",
      requirements: { type: "problems", count: 2, gradeRange: "V18+" },
      xpReward: 3000,
      difficulty: "extreme",
      duration: 70
    }
  };

  async generateQuestForUser(userId: string, questType: string = 'daily'): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userSkills = await storage.getUserSkills(userId);
    const currentLayer = user.currentLayer || 1;
    const whistleLevel = user.whistleLevel || 1;

    if (questType === 'daily') {
      await this.generateDailyQuest(userId, currentLayer, userSkills);
    } else if (questType === 'weekly') {
      await this.generateWeeklyQuest(userId, currentLayer, userSkills);
    } else if (questType === 'layer') {
      await this.generateLayerQuest(userId, currentLayer, userSkills);
    }
  }

  private async generateLayerQuestIfNeeded(userId: string, currentLayer: number): Promise<void> {
    // Check if user already has an active layer quest for this layer
    const existingLayerQuests = await storage.getUserQuests(userId, "active");
    const hasActiveLayerQuest = existingLayerQuests.some(
      quest => quest.questType === "layer" && quest.layer === currentLayer
    );

    // Also check if user has ever completed a layer quest for this layer (to avoid regenerating)
    const allLayerQuests = await storage.getUserQuests(userId); // Gets all quests regardless of status
    const hasEverHadLayerQuest = allLayerQuests.some(
      quest => quest.questType === "layer" && quest.layer === currentLayer
    );

    // Only generate if no active layer quest AND never had one for this layer
    if (!hasActiveLayerQuest && !hasEverHadLayerQuest) {
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
    // Get existing active daily quests to avoid duplicates
    const existingQuests = await storage.getUserQuests(userId, "active");
    const existingDailyQuests = existingQuests.filter(quest => quest.questType === "daily");
    const usedTitles = existingDailyQuests.map(quest => quest.title);

    // Also check recently completed quests from today to avoid immediate repeats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recentQuests = await storage.getUserQuestsInDateRange(userId, today, new Date());
    const recentTitles = recentQuests.map(quest => quest.title);
    
    // Combine used titles to avoid both active and recent duplicates
    const allUsedTitles = [...new Set([...usedTitles, ...recentTitles])];

    // Get quest types already used today to ensure variety
    const usedTypes = new Set();
    [...existingDailyQuests, ...recentQuests].forEach(quest => {
      for (const [type, templates] of Object.entries(this.DAILY_QUEST_TEMPLATES)) {
        if (templates.some((template: any) => template.title === quest.title)) {
          usedTypes.add(type);
        }
      }
    });

    // Limit progression quests to 1 per day
    const hasProgressionQuest = usedTypes.has(this.QUEST_TYPES.PROGRESSION);
    
    // Select quest type with variety in mind
    const availableTypes = Object.keys(this.QUEST_TYPES).filter(type => {
      const questType = this.QUEST_TYPES[type as keyof typeof this.QUEST_TYPES];
      
      // Skip progression if already have one
      if (questType === this.QUEST_TYPES.PROGRESSION && hasProgressionQuest) {
        return false;
      }
      
      // Prefer unused types
      return !usedTypes.has(questType);
    });

    // If no unused types available, allow any type except progression (if limit reached)
    const questTypesToUse = availableTypes.length > 0 ? availableTypes : 
      Object.keys(this.QUEST_TYPES).filter(type => {
        const questType = this.QUEST_TYPES[type as keyof typeof this.QUEST_TYPES];
        return !(questType === this.QUEST_TYPES.PROGRESSION && hasProgressionQuest);
      });

    if (questTypesToUse.length === 0) {
      // Fallback to AI generation if no types available
      await this.generateAIQuest(userId, currentLayer, userSkills);
      return;
    }

    // Randomly select a quest type
    const randomTypeIndex = Math.floor(Math.random() * questTypesToUse.length);
    const selectedType = this.QUEST_TYPES[questTypesToUse[randomTypeIndex] as keyof typeof this.QUEST_TYPES];
    
    // Get templates for selected type
    const typeTemplates = this.DAILY_QUEST_TEMPLATES[selectedType];
    
    // Filter out used templates
    const availableTemplates = typeTemplates.filter(
      (template: any) => !allUsedTitles.includes(template.title)
    );

    if (availableTemplates.length === 0) {
      // If all templates in this type are used, fall back to AI generation
      await this.generateAIQuest(userId, currentLayer, userSkills);
      return;
    }

    // Randomly select a template from available ones
    const randomIndex = Math.floor(Math.random() * availableTemplates.length);
    const selectedTemplate = availableTemplates[randomIndex];
    
    // Adapt the template to user's skill level
    const adaptedQuest = this.adaptQuestToUser(selectedTemplate, currentLayer, userSkills);

    // Calculate XP based on difficulty
    const getDifficultyXP = (difficulty: string): number => {
      switch (difficulty.toLowerCase()) {
        case 'easy': return 80;
        case 'medium': return 120;
        case 'hard': return 180;
        case 'extreme': return 250;
        default: return 120;
      }
    };

    const finalXP = getDifficultyXP(adaptedQuest.difficulty);
    const baseXP = finalXP;
    const averageSkillGrade = this.calculateAverageSkillGrade(userSkills);
    const requiredGrade = this.parseGradeRequirement(adaptedQuest.requirements);
    const gradeDiff = Math.max(0, requiredGrade - averageSkillGrade);

    const quest: InsertQuest = {
      userId,
      title: adaptedQuest.title,
      description: adaptedQuest.description,
      questType: "daily",
      status: "active",
      xpReward: finalXP,
      maxProgress: adaptedQuest.requirements.count || 1,
      progress: 0,
      layer: currentLayer,
      requirements: adaptedQuest.requirements,
      difficulty: adaptedQuest.difficulty,
      difficultyRating: this.getDifficultyRating(adaptedQuest.difficulty),
      generatedByAi: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      baseXP,
      gradeDiff,
      layerIndex: currentLayer - 1,
      weekStartDate: null
    };

    await storage.createQuest(quest);
  }

  private getDifficultyRating(difficulty: string): number {
    switch (difficulty) {
      case "easy": return 2;
      case "medium": return 5;
      case "hard": return 7;
      case "extreme": return 9;
      default: return 5;
    }
  }

  private adaptQuestToUser(template: any, currentLayer: number, userSkills: any[]): any {
    const adaptedQuest = { ...template, requirements: { ...template.requirements } };
    
    // Calculate user's comfort and challenge grades
    const maxGrade = userSkills.length > 0 
      ? Math.max(...userSkills.map(s => this.getGradeNumeric(s.maxGrade || "V0")))
      : 0;
    const comfortGrade = Math.max(maxGrade - 1, 0);
    const challengeGrade = Math.min(maxGrade + 1, 17);

    // Adapt grade ranges based on template requirements
    if (template.requirements.gradeRange === "easy") {
      adaptedQuest.requirements.gradeRange = `V${Math.max(comfortGrade - 1, 0)}-V${comfortGrade}`;
      adaptedQuest.description = adaptedQuest.description.replace("easy", `V${Math.max(comfortGrade - 1, 0)}-V${comfortGrade}`);
    } else if (template.requirements.gradeRange === "comfort") {
      adaptedQuest.requirements.gradeRange = `V${comfortGrade}-V${maxGrade}`;
      adaptedQuest.description = adaptedQuest.description.replace("comfort grade", `V${comfortGrade}-V${maxGrade} range`);
    } else if (template.requirements.gradeRange === "challenge") {
      adaptedQuest.requirements.gradeRange = `V${maxGrade}-V${challengeGrade}`;
      adaptedQuest.description = adaptedQuest.description.replace("challenge", `V${maxGrade}-V${challengeGrade}`);
    }

    // Scale XP based on layer (higher layers get more XP)
    const layerMultiplier = 1 + (currentLayer - 1) * 0.2;
    adaptedQuest.xpReward = Math.round(adaptedQuest.xpReward * layerMultiplier);

    return adaptedQuest;
  }

  private getGradeNumeric(grade: string): number {
    // Extract numeric value from grade string (e.g., "V5" -> 5)
    const match = grade.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  private async generateAIQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      const whistleLevel = user?.whistleLevel || 1;
      
      // Get recent grades for better AI context
      const recentSessions = await storage.getUserClimbingSessions(userId, 5);
      const recentGrades: string[] = [];
      for (const session of recentSessions) {
        const problems = await storage.getBoulderProblemsForSession(session.id);
        recentGrades.push(...problems.map(p => p.grade));
      }
      
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
      console.error("AI quest generation failed, using fallback:", error);
      await this.generateFallbackQuest(userId, currentLayer);
    }
  }

  async updateQuestProgress(userId: string, grade: string, style?: string): Promise<void> {
    const activeQuests = await storage.getUserQuests(userId, "active");
    
    for (const quest of activeQuests) {
      let progressMade = false;
      
      // Check if this boulder problem contributes to the quest
      if (quest.targetGrade && quest.targetGrade === grade) {
        progressMade = true;
      } else if (quest.targetStyle && quest.targetStyle === style) {
        progressMade = true;
      } else if (quest.targetGradeRange) {
        // Check if grade falls within the target range
        const gradeNum = this.getGradeNumeric(grade);
        const [minGrade, maxGrade] = quest.targetGradeRange.split('-').map(g => this.getGradeNumeric(g));
        if (gradeNum >= minGrade && gradeNum <= maxGrade) {
          progressMade = true;
        }
      } else if (!quest.targetGrade && !quest.targetStyle && !quest.targetGradeRange) {
        // Generic quest that counts any boulder problem
        progressMade = true;
      }
      
      if (progressMade) {
        const newProgress = Math.min(quest.progress + 1, quest.maxProgress);
        const newCurrentProgress = Math.min(quest.currentProgress + 1, quest.targetValue);
        
        await storage.updateQuest(quest.id, {
          progress: newProgress,
          currentProgress: newCurrentProgress,
          status: newProgress >= quest.maxProgress ? "completed" : "active"
        });
        
        // If quest is completed, award XP
        if (newProgress >= quest.maxProgress) {
          const user = await storage.getUser(userId);
          if (user) {
            await storage.upsertUser({
              ...user,
              totalXP: (user.totalXP || 0) + quest.xpReward,
            });
          }
        }
      }
    }
  }

  async checkSessionQuests(userId: string, sessionId: number): Promise<void> {
    const activeQuests = await storage.getUserQuests(userId, "active");
    const sessionQuests = activeQuests.filter(quest => 
      quest.questType === "session" || quest.description.includes("session")
    );
    
    for (const quest of sessionQuests) {
      const newProgress = Math.min(quest.progress + 1, quest.maxProgress);
      const newCurrentProgress = Math.min(quest.currentProgress + 1, quest.targetValue);
      
      await storage.updateQuest(quest.id, {
        progress: newProgress,
        currentProgress: newCurrentProgress,
        status: newProgress >= quest.maxProgress ? "completed" : "active"
      });
      
      // If quest is completed, award XP
      if (newProgress >= quest.maxProgress) {
        const user = await storage.getUser(userId);
        if (user) {
          await storage.upsertUser({
            ...user,
            totalXP: (user.totalXP || 0) + quest.xpReward,
          });
        }
      }
    }
  }

  private async generateFallbackQuest(userId: string, layer: number): Promise<void> {
    const fallbackQuest: InsertQuest = {
      userId,
      title: "Daily Boulder Challenge",
      description: "Complete 3 boulder problems to earn experience",
      questType: "daily",
      status: "active",
      xpReward: 120, // Medium difficulty XP
      maxProgress: 3,
      progress: 0,
      layer,
      requirements: { type: "problems", count: 3 },
      difficulty: "medium",
      difficultyRating: 5,
      generatedByAi: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await storage.createQuest(fallbackQuest);
  }

  private async generateWeeklyQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    const weeklyTemplates = [
      {
        title: "Weekly Volume Challenge",
        description: "Complete 25 boulder problems throughout the week to build endurance and consistency",
        difficulty: "medium",
        requirements: { type: "problems", count: 25, gradeRange: "comfort" }
      },
      {
        title: "Weekly Technique Mastery",
        description: "Master challenging holds by completing 15 problems using crimps, pinches, and slopers",
        difficulty: "hard",
        requirements: { type: "problems", count: 15, style: "technical_holds", gradeRange: "comfort" }
      },
      {
        title: "Weekly Strength Development",
        description: "Build power by completing 18 overhang problems across multiple sessions",
        difficulty: "hard",
        requirements: { type: "problems", count: 18, wallAngle: "overhang", gradeRange: "comfort" }
      },
      {
        title: "Weekly Style Exploration",
        description: "Expand your climbing vocabulary by completing problems in 6 different climbing styles",
        difficulty: "medium",
        requirements: { type: "variety", count: 6, gradeRange: "comfort" }
      },
      {
        title: "Weekly Session Consistency",
        description: "Maintain consistency by completing at least 4 problems in each of 5 different sessions",
        difficulty: "easy",
        requirements: { type: "consistency", count: 5, dailyMin: 4, gradeRange: "comfort" }
      },
      {
        title: "Weekly Grade Progression",
        description: "Push your limits by completing 12 problems at your challenge grade over multiple sessions",
        difficulty: "hard",
        requirements: { type: "problems", count: 12, gradeRange: "challenge" }
      },
      {
        title: "Weekly Endurance Builder",
        description: "Build stamina by completing 20 problems with less than 5 attempts each",
        difficulty: "medium",
        requirements: { type: "problems", count: 20, maxAttempts: 5, gradeRange: "comfort" }
      },
      {
        title: "Weekly Mental Game",
        description: "Develop focus by completing 10 problems after visualizing the sequence first",
        difficulty: "medium",
        requirements: { type: "visualization", count: 10, gradeRange: "comfort" }
      }
    ];

    const template = weeklyTemplates[Math.floor(Math.random() * weeklyTemplates.length)];
    const adaptedQuest = this.adaptQuestToUser(template, currentLayer, userSkills);

    // Calculate XP based on difficulty with weekly multiplier
    const getDifficultyXP = (difficulty: string): number => {
      switch (difficulty.toLowerCase()) {
        case 'easy': return 80;
        case 'medium': return 120;
        case 'hard': return 180;
        case 'extreme': return 250;
        default: return 120;
      }
    };

    const baseXP = getDifficultyXP(adaptedQuest.difficulty);
    const finalXP = Math.round(baseXP * 1.5); // Weekly multiplier
    const averageSkillGrade = this.calculateAverageSkillGrade(userSkills);
    const requiredGrade = this.parseGradeRequirement(adaptedQuest.requirements);
    const gradeDiff = Math.max(0, requiredGrade - averageSkillGrade);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const quest: InsertQuest = {
      userId,
      title: adaptedQuest.title,
      description: adaptedQuest.description,
      questType: "weekly",
      status: "active",
      xpReward: finalXP,
      maxProgress: adaptedQuest.requirements.count || 1,
      progress: 0,
      layer: currentLayer,
      requirements: adaptedQuest.requirements,
      difficulty: adaptedQuest.difficulty,
      difficultyRating: this.getDifficultyRating(adaptedQuest.difficulty),
      generatedByAi: false,
      expiresAt: endOfWeek,
      baseXP,
      gradeDiff,
      layerIndex: currentLayer - 1,
      weekStartDate: startOfWeek
    };

    await storage.createQuest(quest);
  }

  private async generateLayerQuest(userId: string, currentLayer: number, userSkills: any[]): Promise<void> {
    const layerTemplates = [
      {
        title: `Layer ${currentLayer} Mastery`,
        description: `Complete 20 problems appropriate for Layer ${currentLayer} difficulty`,
        difficulty: "hard",
        requirements: { type: "problems", count: 20, gradeRange: "challenge" }
      },
      {
        title: `${currentLayer === 1 ? "Surface" : "Abyss"} Explorer`,
        description: `Explore different climbing styles by completing 15 problems across 3 different techniques`,
        difficulty: "medium", 
        requirements: { type: "variety", count: 15, styles: 3, gradeRange: "comfort" }
      },
      {
        title: `Layer ${currentLayer} Strength Test`,
        description: `Build strength by completing 25 problems with fewer than 5 attempts each`,
        difficulty: "extreme",
        requirements: { type: "problems", count: 25, maxAttempts: 5, gradeRange: "challenge" }
      },
      {
        title: `Layer ${currentLayer} Progression`,
        description: `Push beyond your limits by completing 10 problems at your maximum grade`,
        difficulty: "extreme",
        requirements: { type: "problems", count: 10, gradeRange: "challenge" }
      }
    ];

    const template = layerTemplates[Math.floor(Math.random() * layerTemplates.length)];
    const adaptedQuest = this.adaptQuestToUser(template, currentLayer, userSkills);

    // Calculate XP based on difficulty with layer multiplier
    const getDifficultyXP = (difficulty: string): number => {
      switch (difficulty.toLowerCase()) {
        case 'easy': return 80;
        case 'medium': return 120;
        case 'hard': return 180;
        case 'extreme': return 250;
        default: return 120;
      }
    };

    const baseXP = getDifficultyXP(adaptedQuest.difficulty);
    const layerMultiplier = 1.5 + (currentLayer - 1) * 0.3;
    const finalXP = Math.round(baseXP * layerMultiplier); // Layer multiplier
    const averageSkillGrade = this.calculateAverageSkillGrade(userSkills);
    const requiredGrade = this.parseGradeRequirement(adaptedQuest.requirements);
    const gradeDiff = Math.max(0, requiredGrade - averageSkillGrade);

    const quest: InsertQuest = {
      userId,
      title: adaptedQuest.title,
      description: adaptedQuest.description,
      questType: "layer",
      status: "active",
      xpReward: finalXP,
      maxProgress: adaptedQuest.requirements.count || 1,
      progress: 0,
      layer: currentLayer,
      requirements: adaptedQuest.requirements,
      difficulty: adaptedQuest.difficulty,
      difficultyRating: this.getDifficultyRating(adaptedQuest.difficulty),
      generatedByAi: false,
      expiresAt: null, // Layer quests don't expire
      baseXP,
      gradeDiff,
      layerIndex: currentLayer - 1,
      weekStartDate: null
    };

    await storage.createQuest(quest);
  }

  private calculateAverageSkillGrade(userSkills: any[]): number {
    if (userSkills.length === 0) return 0;
    
    const totalGrade = userSkills.reduce((sum, skill) => {
      return sum + this.getGradeNumeric(skill.maxGrade || "V0");
    }, 0);
    
    return totalGrade / userSkills.length;
  }

  private parseGradeRequirement(requirements: any): number {
    if (!requirements.gradeRange) return 0;
    
    // Parse grade range like "V3-V5" or "V4"
    const gradeMatch = requirements.gradeRange.match(/V(\d+)/);
    return gradeMatch ? parseInt(gradeMatch[1]) : 0;
  }
}

export const questGenerator = new QuestGenerator();