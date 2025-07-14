import { type Relic, type InsertRelic } from "@shared/schema";
import { storage } from "../storage";

export interface RelicDefinition {
  name: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  category: string;
  loreText: string;
  layerRequirement?: number; // Minimum layer to find this relic
  gradeRequirement?: string; // Minimum grade to find this relic
}

// Made in Abyss relic definitions
const RELIC_DEFINITIONS: RelicDefinition[] = [
  // Common relics (10% chance)
  {
    name: "Crimson Splitjaw",
    description: "A small, sturdy blade that never dulls. Useful for delving preparations.",
    rarity: "common",
    category: "artifact",
    loreText: "A common grade 4 artifact. While not particularly powerful, its reliability makes it a favorite among new delvers.",
    layerRequirement: 1,
  },
  {
    name: "Thousand-men Pins",
    description: "Sharp needles that can pierce through most materials with ease.",
    rarity: "common",
    category: "artifact",
    loreText: "These pins are said to have been crafted by a master artisan. Each one is perfectly balanced.",
    layerRequirement: 1,
  },
  {
    name: "Abyssal Compass",
    description: "A compass that points toward the center of the Abyss, never failing.",
    rarity: "common",
    category: "artifact",
    loreText: "An essential tool for any delver. The magnetic pull of the Abyss guides its needle.",
    layerRequirement: 1,
  },
  {
    name: "Scaled Umbrella",
    description: "An umbrella made from creature scales, providing excellent protection.",
    rarity: "common",
    category: "artifact",
    loreText: "Crafted from the scales of an Abyss creature. Surprisingly durable and lightweight.",
    layerRequirement: 2,
  },
  {
    name: "Moon Mirror",
    description: "A mirror that reflects moonlight even in darkness.",
    rarity: "common",
    category: "artifact",
    loreText: "Used by delvers to signal each other in the depths. Its surface never tarnishes.",
    layerRequirement: 1,
  },

  // Uncommon relics (4% chance)
  {
    name: "Blaze Reap",
    description: "A pickaxe that glows with inner fire, making excavation much easier.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "A grade 3 artifact. The heated edge makes it incredibly effective at breaking through rock.",
    layerRequirement: 2,
  },
  {
    name: "Gon's Bola",
    description: "A weighted rope weapon that always finds its target.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "Named after a legendary delver. The weights seem to guide themselves to their target.",
    layerRequirement: 2,
  },
  {
    name: "Curse-Repelling Vessel",
    description: "A small container that can hold and neutralize curse effects.",
    rarity: "uncommon",
    category: "curse_repelling",
    loreText: "Essential for deeper delving. This vessel can contain small amounts of the Abyss's curse.",
    layerRequirement: 3,
  },
  {
    name: "Everlasting Gunpowder",
    description: "Explosive powder that never runs out, no matter how much is used.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "A mysterious powder that regenerates itself. Handle with extreme care.",
    layerRequirement: 2,
  },

  // Rare relics (1% chance)
  {
    name: "Incinerator",
    description: "A weapon that burns anything it touches with cursed flames.",
    rarity: "rare",
    category: "special_grade",
    loreText: "A grade 2 artifact. Its flames are said to burn even the soul itself.",
    layerRequirement: 3,
    gradeRequirement: "V4",
  },
  {
    name: "Unheard Bell",
    description: "A silent bell that can detect the presence of dangerous creatures.",
    rarity: "rare",
    category: "artifact",
    loreText: "Though it makes no sound, the bell's vibrations can be felt when danger approaches.",
    layerRequirement: 4,
  },
  {
    name: "Reg's Helmet Fragment",
    description: "A piece of an ancient robot's helmet, humming with unknown energy.",
    rarity: "rare",
    category: "special_grade",
    loreText: "A fragment from the legendary robot boy. Its purpose remains mysterious.",
    layerRequirement: 5,
    gradeRequirement: "V3",
  },
  {
    name: "Phantom Mirage",
    description: "Creates illusions so realistic they can fool any observer.",
    rarity: "rare",
    category: "special_grade",
    loreText: "A grade 2 artifact. The illusions it creates are indistinguishable from reality.",
    layerRequirement: 4,
  },

  // Epic relics (0.4% chance)
  {
    name: "Aubade Helmet",
    description: "A helmet that provides perfect protection against mental interference.",
    rarity: "epic",
    category: "special_grade",
    loreText: "Once worn by a legendary White Whistle. It shields the mind from the Abyss's influence.",
    layerRequirement: 5,
    gradeRequirement: "V5",
  },
  {
    name: "Far Caress",
    description: "Gloves that extend the user's reach across impossible distances.",
    rarity: "epic",
    category: "special_grade",
    loreText: "A grade 1 artifact. These gloves allow the user to touch objects from great distances.",
    layerRequirement: 6,
    gradeRequirement: "V4",
  },
  {
    name: "Zoaholic",
    description: "A life-reversing artifact that can bring back the recently deceased.",
    rarity: "epic",
    category: "special_grade",
    loreText: "An incredibly dangerous grade 1 artifact. It can reverse death itself, but at a terrible cost.",
    layerRequirement: 7,
    gradeRequirement: "V6",
  },

  // Legendary relics (0.2% chance)
  {
    name: "Lyza's White Whistle",
    description: "The legendary White Whistle of the Sovereign of Annihilation.",
    rarity: "legendary",
    category: "white_whistle",
    loreText: "The White Whistle of the legendary Lyza the Annihilator. It pulses with immense power.",
    layerRequirement: 6,
    gradeRequirement: "V7",
  },
  {
    name: "Bondrewd's Praying Hands",
    description: "Mechanical hands that can manipulate the very fabric of reality.",
    rarity: "legendary",
    category: "white_whistle",
    loreText: "The artifact of the infamous Bondrewd. These hands can reshape matter at will.",
    layerRequirement: 7,
    gradeRequirement: "V8",
  },
  {
    name: "Reg's Incinerator Arm",
    description: "The legendary weapon arm of the robot boy, capable of incredible destruction.",
    rarity: "legendary",
    category: "special_grade",
    loreText: "The most powerful weapon ever found in the Abyss. Its blast can level entire sections.",
    layerRequirement: 7,
    gradeRequirement: "V7",
  },
];

// Relic finding probabilities
const RELIC_PROBABILITIES = {
  common: 0.10,      // 10% chance to find any relic
  uncommon: 0.04,    // 4% chance for uncommon
  rare: 0.01,        // 1% chance for rare
  epic: 0.004,       // 0.4% chance for epic
  legendary: 0.002,  // 0.2% chance for legendary
};

export class RelicService {
  
  // Check if a relic should be found when completing a boulder problem
  public async checkForRelicFind(
    userId: string,
    sessionId: number,
    boulderProblemId: number,
    grade: string,
    currentLayer: number
  ): Promise<Relic | null> {
    // Generate random number for relic finding
    const roll = Math.random();
    
    // Check each rarity tier (legendary first for best chance)
    const rarityTiers = ['legendary', 'epic', 'rare', 'uncommon', 'common'] as const;
    
    for (const rarity of rarityTiers) {
      if (roll <= RELIC_PROBABILITIES[rarity]) {
        // Filter available relics by rarity, layer, and grade requirements
        const availableRelics = RELIC_DEFINITIONS.filter(relic => {
          if (relic.rarity !== rarity) return false;
          if (relic.layerRequirement && currentLayer < relic.layerRequirement) return false;
          if (relic.gradeRequirement && !this.meetsGradeRequirement(grade, relic.gradeRequirement)) return false;
          return true;
        });
        
        if (availableRelics.length > 0) {
          // Select random relic from available ones
          const selectedRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)];
          
          // Create relic entry
          const relicEntry: InsertRelic = {
            userId,
            sessionId,
            boulderProblemId,
            name: selectedRelic.name,
            description: selectedRelic.description,
            rarity: selectedRelic.rarity,
            category: selectedRelic.category,
            layer: currentLayer,
            grade,
            loreText: selectedRelic.loreText,
          };
          
          // Save to database
          return await storage.createRelic(relicEntry);
        }
      }
    }
    
    return null;
  }
  
  // Check if current grade meets the requirement
  private meetsGradeRequirement(currentGrade: string, requiredGrade: string): boolean {
    const gradeValues: { [key: string]: number } = {
      'V0': 0, 'V1': 1, 'V2': 2, 'V3': 3, 'V4': 4,
      'V5': 5, 'V6': 6, 'V7': 7, 'V8': 8, 'V9': 9,
      'V10': 10, 'V11': 11, 'V12': 12, 'V13': 13, 'V14': 14, 'V15': 15, 'V16': 16, 'V17': 17
    };
    
    const currentValue = gradeValues[currentGrade] || 0;
    const requiredValue = gradeValues[requiredGrade] || 0;
    
    return currentValue >= requiredValue;
  }
  
  // Get all relics for a user
  public async getUserRelics(userId: string): Promise<Relic[]> {
    return await storage.getUserRelics(userId);
  }
  
  // Get relics by rarity
  public async getUserRelicsByRarity(userId: string, rarity: string): Promise<Relic[]> {
    return await storage.getUserRelicsByRarity(userId, rarity);
  }
  
  // Get total relic count for user
  public async getUserRelicCount(userId: string): Promise<number> {
    const relics = await this.getUserRelics(userId);
    return relics.length;
  }
  
  // Get relic statistics for user
  public async getUserRelicStats(userId: string): Promise<{
    total: number;
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  }> {
    const relics = await this.getUserRelics(userId);
    
    return {
      total: relics.length,
      common: relics.filter(r => r.rarity === 'common').length,
      uncommon: relics.filter(r => r.rarity === 'uncommon').length,
      rare: relics.filter(r => r.rarity === 'rare').length,
      epic: relics.filter(r => r.rarity === 'epic').length,
      legendary: relics.filter(r => r.rarity === 'legendary').length,
    };
  }
}

export const relicService = new RelicService();