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
  // Common relics (3% chance)
  {
    name: "Novice's Rope",
    description: "A sturdy rope that never frays. Perfect for beginning delvers.",
    rarity: "common",
    category: "artifact",
    loreText: "Every delver's first tool. Though simple, it has saved countless lives in the Abyss.",
  },
  {
    name: "Apprentice Whistle",
    description: "A simple whistle that echoes loudly in the depths.",
    rarity: "common",
    category: "artifact",
    loreText: "Used to signal other delvers or scare away small creatures. A delver's best friend.",
  },
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
  {
    name: "Traveler's Lantern",
    description: "A lantern that burns without fuel, casting ethereal light.",
    rarity: "common",
    category: "artifact",
    loreText: "A reliable source of light in the depths. The flame never flickers, no matter the wind.",
  },
  {
    name: "Delver's Goggles",
    description: "Special goggles that improve vision in the dark depths.",
    rarity: "common",
    category: "artifact", 
    loreText: "Standard equipment for any serious delver. These goggles reveal hidden paths.",
  },
  {
    name: "Whisper Stone",
    description: "A smooth stone that carries messages across great distances.",
    rarity: "common",
    category: "artifact",
    loreText: "Used by delvers to communicate with the surface. Each stone is perfectly smooth.",
  },
  {
    name: "Moss Cloak",
    description: "A cloak woven from Abyss moss, providing natural camouflage.",
    rarity: "common",
    category: "artifact",
    loreText: "Helps delvers blend into the natural environment. The moss continues to grow slowly.",
    layerRequirement: 2,
  },
  {
    name: "Crystal Prism",
    description: "A prism that splits light into beautiful rainbow patterns.",
    rarity: "common",
    category: "artifact",
    loreText: "Often used for signaling or simply to bring beauty to the harsh depths.",
  },
  {
    name: "Durable Gloves",
    description: "Thick gloves that protect hands from sharp rocks and thorns.",
    rarity: "common",
    category: "artifact",
    loreText: "Essential protection for any delver. These gloves have saved countless fingers.",
  },
  {
    name: "Water Purifier",
    description: "A small device that can purify any water source.",
    rarity: "common",
    category: "artifact",
    loreText: "Clean water is life in the Abyss. This device ensures safe drinking water.",
  },
  {
    name: "Field Knife",
    description: "A versatile knife perfect for cutting through vines and preparing food.",
    rarity: "common",
    category: "artifact",
    loreText: "Every delver carries one. The blade remains sharp despite heavy use.",
  },

  // Uncommon relics (1.5% chance)
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
  {
    name: "Gravestone Compass",
    description: "A compass that points toward the nearest dangerous creature.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "Sometimes knowing where danger lies is more valuable than avoiding it entirely.",
    layerRequirement: 1,
  },
  {
    name: "Abyssal Boots",
    description: "Boots that allow silent movement on any surface.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "These boots make no sound, even on the crunchiest gravel. Perfect for stealth.",
    layerRequirement: 2,
  },
  {
    name: "Star Thread",
    description: "Thread that glows softly and is stronger than steel cable.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "Woven from starlight itself. This thread can bind almost anything.",
    layerRequirement: 1,
  },
  {
    name: "Memory Crystal",
    description: "A crystal that can store and replay visual memories.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "Delvers use these to record important discoveries. Each crystal holds one memory.",
    layerRequirement: 2,
  },
  {
    name: "Wind Walker Cloak",
    description: "A cloak that reduces falling speed and allows controlled gliding.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "Essential for navigating the vertical shafts of the Abyss. The wind obeys its call.",
    layerRequirement: 2,
  },
  {
    name: "Nightmare Ward",
    description: "A small charm that protects against mental intrusions and bad dreams.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "The Abyss breeds nightmares. This ward keeps them at bay during rest.",
    layerRequirement: 2,
  },
  {
    name: "Mist Vial",
    description: "A vial that can create a thick, concealing mist when opened.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "Perfect for making quick escapes. The mist is thick enough to hide in.",
    layerRequirement: 1,
  },
  {
    name: "Echo Stone",
    description: "A stone that records and replays the last sound it heard.",
    rarity: "uncommon",
    category: "artifact",
    loreText: "Used to send messages or to confuse creatures. Each echo is crystal clear.",
    layerRequirement: 1,
  },

  // Rare relics (0.5% chance)
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
  {
    name: "Temporal Anchor",
    description: "A device that can slow down time in a small area around the user.",
    rarity: "rare",
    category: "special_grade",
    loreText: "Grade 2 artifact. Time itself bends around this mysterious device.",
    layerRequirement: 2,
    gradeRequirement: "V3",
  },
  {
    name: "Soul Resonance Stone",
    description: "A stone that can detect the emotional state of nearby creatures.",
    rarity: "rare",
    category: "artifact",
    loreText: "This stone pulses with the emotions of those around it. Invaluable for negotiations.",
    layerRequirement: 2,
    gradeRequirement: "V2",
  },
  {
    name: "Void Pocket",
    description: "A small bag that can hold items in a pocket dimension.",
    rarity: "rare",
    category: "special_grade",
    loreText: "Items placed inside exist in a space between spaces. The bag never feels heavy.",
    layerRequirement: 3,
    gradeRequirement: "V3",
  },
  {
    name: "Ozen's Training Weights",
    description: "Heavy bracers that strengthen the body through constant wear.",
    rarity: "rare",
    category: "artifact",
    loreText: "Worn by the legendary White Whistle Ozen. They make the wearer incredibly strong.",
    layerRequirement: 2,
    gradeRequirement: "V2",
  },
  {
    name: "Praying Hands Fragment",
    description: "A small piece of mechanical hand that can manipulate objects at a distance.",
    rarity: "rare",
    category: "special_grade",
    loreText: "A fragment of Bondrewd's artifact. Even broken, it retains some power.",
    layerRequirement: 3,
    gradeRequirement: "V4",
  },
  {
    name: "Living Stone",
    description: "A stone that moves and acts like a small creature.",
    rarity: "rare",
    category: "artifact",
    loreText: "This stone has gained consciousness from prolonged exposure to the Abyss.",
    layerRequirement: 2,
    gradeRequirement: "V3",
  },
  {
    name: "Blessed Candle",
    description: "A candle that burns forever and repels curse effects.",
    rarity: "rare",
    category: "curse_repelling",
    loreText: "The flame of this candle has burned for centuries, keeping the curse at bay.",
    layerRequirement: 2,
    gradeRequirement: "V2",
  },
  {
    name: "Nanachi's Luck Charm",
    description: "A small charm that improves the user's luck in dangerous situations.",
    rarity: "rare",
    category: "artifact",
    loreText: "A charm made by the legendary Nanachi. It seems to attract good fortune.",
    layerRequirement: 2,
    gradeRequirement: "V2",
  },

  // Epic relics (0.2% chance)
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
  {
    name: "Curse-Deflecting Armor",
    description: "Armor that completely deflects the curse's effects back at enemies.",
    rarity: "epic",
    category: "special_grade",
    loreText: "Grade 1 artifact. The curse itself fears this armor and turns back upon itself.",
    layerRequirement: 4,
    gradeRequirement: "V5",
  },
  {
    name: "Reality Anchor",
    description: "A device that can anchor a small area in place, preventing reality distortions.",
    rarity: "epic",
    category: "special_grade",
    loreText: "Grade 1 artifact. Reality itself becomes stable within its influence.",
    layerRequirement: 5,
    gradeRequirement: "V4",
  },
  {
    name: "Marulk's Diving Helmet",
    description: "A helmet that allows breathing underwater and protects from pressure.",
    rarity: "epic",
    category: "special_grade",
    loreText: "Once worn by the guardian of the Seeker Camp. It grants complete underwater survival.",
    layerRequirement: 3,
    gradeRequirement: "V4",
  },

  // Legendary relics (0.1% chance)
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
  {
    name: "Ozen's White Whistle",
    description: "The White Whistle of the Immovable Sovereign, radiating ancient power.",
    rarity: "legendary",
    category: "white_whistle",
    loreText: "The White Whistle of the legendary Ozen. Its power is as immovable as its owner.",
    layerRequirement: 6,
    gradeRequirement: "V8",
  },
  {
    name: "Riko's Bell",
    description: "The legendary bell that can resonate with the very heart of the Abyss.",
    rarity: "legendary",
    category: "special_grade",
    loreText: "This bell's sound can reach any depth of the Abyss. It calls to something ancient.",
    layerRequirement: 5,
    gradeRequirement: "V6",
  },
];

// Relic finding probabilities - Made much more rare!
const RELIC_PROBABILITIES = {
  common: 0.03,      // 3% chance to find any relic (was 10%)
  uncommon: 0.015,   // 1.5% chance for uncommon
  rare: 0.005,       // 0.5% chance for rare
  epic: 0.002,       // 0.2% chance for epic
  legendary: 0.001,  // 0.1% chance for legendary
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
    
    console.log(`[RELIC DROP] User ${userId} rolled ${roll.toFixed(4)} for grade ${grade} on layer ${currentLayer}`);
    
    // Check if any relic should drop (3% chance total)
    if (roll > RELIC_PROBABILITIES.common) {
      console.log(`[RELIC DROP] No relic dropped (roll ${roll.toFixed(4)} > ${RELIC_PROBABILITIES.common})`);
      return null;
    }
    
    // Determine rarity based on roll (from rarest to most common)
    let selectedRarity: string;
    if (roll <= RELIC_PROBABILITIES.legendary) {
      selectedRarity = 'legendary';
    } else if (roll <= RELIC_PROBABILITIES.epic) {
      selectedRarity = 'epic';
    } else if (roll <= RELIC_PROBABILITIES.rare) {
      selectedRarity = 'rare';
    } else if (roll <= RELIC_PROBABILITIES.uncommon) {
      selectedRarity = 'uncommon';
    } else {
      selectedRarity = 'common';
    }
    
    console.log(`[RELIC DROP] Relic rarity determined: ${selectedRarity}`);
    
    // Filter available relics by rarity, layer, and grade requirements
    const availableRelics = RELIC_DEFINITIONS.filter(relic => {
      if (relic.rarity !== selectedRarity) return false;
      if (relic.layerRequirement && currentLayer < relic.layerRequirement) return false;
      if (relic.gradeRequirement && !this.meetsGradeRequirement(grade, relic.gradeRequirement)) return false;
      return true;
    });
    
    console.log(`[RELIC DROP] Available ${selectedRarity} relics for layer ${currentLayer}: ${availableRelics.length}`);
    
    if (availableRelics.length > 0) {
      // Select random relic from available ones
      const selectedRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)];
      
      console.log(`[RELIC DROP] Selected relic: ${selectedRelic.name} (${selectedRelic.rarity})`);
      
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
      const savedRelic = await storage.createRelic(relicEntry);
      console.log(`[RELIC DROP] Relic saved to database: ${savedRelic.name} (ID: ${savedRelic.id})`);
      return savedRelic;
    } else {
      console.log(`[RELIC DROP] No available ${selectedRarity} relics for current layer/grade requirements`);
      return null;
    }
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