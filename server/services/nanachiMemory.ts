import { storage } from "../storage";
import { InsertNanachiMemory, NanachiMemory } from "@shared/schema";

export class NanachiMemoryService {
  // Store a new memory
  async storeMemory(memory: InsertNanachiMemory): Promise<NanachiMemory> {
    return await storage.createNanachiMemory(memory);
  }

  // Get all memories for a user
  async getUserMemories(userId: string): Promise<NanachiMemory[]> {
    return await storage.getUserNanachiMemories(userId);
  }

  // Get memories by type
  async getMemoriesByType(userId: string, type: string): Promise<NanachiMemory[]> {
    return await storage.getNanachiMemoriesByType(userId, type);
  }

  // Update a memory
  async updateMemory(id: number, updates: Partial<NanachiMemory>): Promise<NanachiMemory> {
    return await storage.updateNanachiMemory(id, updates);
  }

  // Delete expired memories
  async cleanupExpiredMemories(): Promise<void> {
    return await storage.cleanupExpiredNanachiMemories();
  }

  // Get important memories for context
  async getImportantMemories(userId: string, limit: number = 10): Promise<NanachiMemory[]> {
    return await storage.getImportantNanachiMemories(userId, limit);
  }

  // Store conversation memory
  async storeConversation(userId: string, userMessage: string, nanachiResponse: string): Promise<NanachiMemory> {
    return await this.storeMemory({
      userId,
      memoryType: 'conversation',
      title: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
      content: `User: ${userMessage}\nNanachi: ${nanachiResponse}`,
      importance: 2,
    });
  }

  // Store user preference
  async storePreference(userId: string, preference: string, value: any): Promise<NanachiMemory> {
    return await this.storeMemory({
      userId,
      memoryType: 'preference',
      title: preference,
      content: JSON.stringify(value),
      importance: 4,
    });
  }

  // Store achievement memory
  async storeAchievement(userId: string, achievement: string, context: any): Promise<NanachiMemory> {
    return await this.storeMemory({
      userId,
      memoryType: 'achievement',
      title: achievement,
      content: `User achieved: ${achievement}. Context: ${JSON.stringify(context)}`,
      importance: 5,
    });
  }

  // Store goal memory
  async storeGoal(userId: string, goal: string, context: any): Promise<NanachiMemory> {
    return await this.storeMemory({
      userId,
      memoryType: 'goal',
      title: goal,
      content: `User set goal: ${goal}. Context: ${JSON.stringify(context)}`,
      importance: 4,
    });
  }

  // Get contextual memories for response generation
  async getContextualMemories(userId: string, messageContent: string): Promise<NanachiMemory[]> {
    const allMemories = await this.getUserMemories(userId);
    
    // Filter memories by relevance to current message
    const relevantMemories = allMemories.filter(memory => {
      const searchTerms = messageContent.toLowerCase().split(' ');
      const memoryContent = (memory.title + ' ' + memory.content).toLowerCase();
      return searchTerms.some(term => memoryContent.includes(term));
    });

    // Sort by importance and recency
    return relevantMemories
      .sort((a, b) => {
        const importanceScore = (b.importance || 1) - (a.importance || 1);
        const recencyScore = new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        return importanceScore * 1000 + recencyScore;
      })
      .slice(0, 5); // Return top 5 most relevant memories
  }

  // Get recent conversation context
  async getRecentConversations(userId: string, limit: number = 5): Promise<NanachiMemory[]> {
    const conversations = await this.getMemoriesByType(userId, 'conversation');
    return conversations
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  // Get user's climbing preferences and patterns
  async getUserClimbingProfile(userId: string): Promise<{
    preferences: NanachiMemory[];
    goals: NanachiMemory[];
    achievements: NanachiMemory[];
    patterns: string[];
  }> {
    const [preferences, goals, achievements] = await Promise.all([
      this.getMemoriesByType(userId, 'preference'),
      this.getMemoriesByType(userId, 'goal'),
      this.getMemoriesByType(userId, 'achievement')
    ]);

    // Extract climbing patterns from conversation history
    const conversations = await this.getRecentConversations(userId, 20);
    const patterns = this.extractClimbingPatterns(conversations);

    return {
      preferences,
      goals,
      achievements,
      patterns
    };
  }

  // Extract climbing patterns from conversations
  private extractClimbingPatterns(conversations: NanachiMemory[]): string[] {
    const patterns: string[] = [];
    const climbingTerms = [
      'crimps', 'pinches', 'slopers', 'jugs', 'overhang', 'slab', 'technical', 'dynamic',
      'outdoor', 'indoor', 'lead', 'boulder', 'project', 'send', 'flash', 'onsight'
    ];

    conversations.forEach(conv => {
      const content = conv.content.toLowerCase();
      climbingTerms.forEach(term => {
        if (content.includes(term) && !patterns.includes(term)) {
          patterns.push(term);
        }
      });
    });

    return patterns;
  }
}

export const nanachiMemoryService = new NanachiMemoryService();