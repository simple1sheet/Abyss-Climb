// Climbing Skill Tree Structure
export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  subcategories: SkillSubcategory[];
}

export interface SkillSubcategory {
  id: string;
  name: string;
  description: string;
  skillTypes: string[];
  color: string;
}

export const CLIMBING_SKILL_TREE: SkillCategory[] = [
  {
    id: "movement",
    name: "Movement",
    description: "Core climbing movement patterns and body awareness",
    color: "#2563eb", // Blue
    icon: "move",
    subcategories: [
      {
        id: "balance",
        name: "Balance",
        description: "Maintaining equilibrium on challenging holds",
        skillTypes: ["slab", "balance_beam", "mantles", "highsteps"],
        color: "#3b82f6"
      },
      {
        id: "coordination",
        name: "Coordination",
        description: "Smooth movement between holds",
        skillTypes: ["cross_through", "heel_hooks", "toe_hooks", "flagging"],
        color: "#1d4ed8"
      },
      {
        id: "flexibility",
        name: "Flexibility",
        description: "Range of motion and body positioning",
        skillTypes: ["high_steps", "wide_spans", "hip_flexibility", "shoulder_mobility"],
        color: "#1e40af"
      },
      {
        id: "dynamic",
        name: "Dynamic Movement",
        description: "Explosive and powerful movements",
        skillTypes: ["dynos", "dead_points", "matching", "jumping"],
        color: "#1e3a8a"
      },
      {
        id: "footwork",
        name: "Footwork",
        description: "Precise and efficient foot placement",
        skillTypes: ["smearing", "edging", "foot_jams", "precise_placement"],
        color: "#172554"
      }
    ]
  },
  {
    id: "strength",
    name: "Strength",
    description: "Physical power and muscular endurance",
    color: "#dc2626", // Red
    icon: "zap",
    subcategories: [
      {
        id: "finger_strength",
        name: "Finger Strength",
        description: "Grip strength and contact power",
        skillTypes: ["crimps", "pinches", "slopers", "pockets"],
        color: "#ef4444"
      },
      {
        id: "core_strength",
        name: "Core Strength",
        description: "Trunk stability and power",
        skillTypes: ["compression", "tension", "body_positioning", "overhangs"],
        color: "#dc2626"
      },
      {
        id: "upper_body",
        name: "Upper Body Power",
        description: "Pulling and pushing strength",
        skillTypes: ["pull_ups", "lockoffs", "mantles", "pressing"],
        color: "#b91c1c"
      },
      {
        id: "contact_strength",
        name: "Contact Strength",
        description: "Initial grip and stick power",
        skillTypes: ["dead_points", "latching", "first_moves", "power_endurance"],
        color: "#991b1b"
      }
    ]
  },
  {
    id: "mental",
    name: "Mental",
    description: "Psychological strength and focus",
    color: "#7c2d12", // Brown
    icon: "brain",
    subcategories: [
      {
        id: "focus",
        name: "Focus",
        description: "Concentration and attention to detail",
        skillTypes: ["route_reading", "sequencing", "precision", "mindfulness"],
        color: "#a3a3a3"
      },
      {
        id: "confidence",
        name: "Confidence",
        description: "Self-belief and commitment",
        skillTypes: ["commitment", "risk_taking", "bold_moves", "trust"],
        color: "#737373"
      },
      {
        id: "fear_management",
        name: "Fear Management",
        description: "Overcoming anxiety and fear",
        skillTypes: ["high_balls", "exposure", "falling", "composure"],
        color: "#525252"
      },
      {
        id: "persistence",
        name: "Persistence",
        description: "Determination and resilience",
        skillTypes: ["projecting", "working_moves", "patience", "grit"],
        color: "#404040"
      }
    ]
  },
  {
    id: "technical",
    name: "Technical",
    description: "Climbing technique and efficiency",
    color: "#059669", // Green
    icon: "settings",
    subcategories: [
      {
        id: "route_reading",
        name: "Route Reading",
        description: "Analyzing and understanding sequences",
        skillTypes: ["beta_reading", "sequence_planning", "hold_identification", "movement_preview"],
        color: "#10b981"
      },
      {
        id: "efficiency",
        name: "Efficiency",
        description: "Energy conservation and smooth movement",
        skillTypes: ["rest_positions", "flow", "energy_management", "relaxation"],
        color: "#059669"
      },
      {
        id: "technique_refinement",
        name: "Technique Refinement",
        description: "Perfecting movement patterns",
        skillTypes: ["body_positioning", "weight_distribution", "timing", "precision"],
        color: "#047857"
      },
      {
        id: "adaptation",
        name: "Adaptation",
        description: "Adjusting to different styles and conditions",
        skillTypes: ["style_switching", "conditions", "rock_types", "hold_variations"],
        color: "#065f46"
      }
    ]
  },
  {
    id: "endurance",
    name: "Endurance",
    description: "Stamina and sustained performance",
    color: "#7c3aed", // Purple
    icon: "clock",
    subcategories: [
      {
        id: "power_endurance",
        name: "Power Endurance",
        description: "Sustained high-intensity climbing",
        skillTypes: ["circuits", "linked_problems", "volume", "pump_tolerance"],
        color: "#8b5cf6"
      },
      {
        id: "aerobic_capacity",
        name: "Aerobic Capacity",
        description: "Cardiovascular endurance",
        skillTypes: ["long_sessions", "base_fitness", "recovery", "breathing"],
        color: "#7c3aed"
      },
      {
        id: "recovery",
        name: "Recovery",
        description: "Rest and regeneration ability",
        skillTypes: ["active_recovery", "rest_positions", "shaking_out", "pacing"],
        color: "#6d28d9"
      }
    ]
  },
  {
    id: "strategy",
    name: "Strategy",
    description: "Problem-solving and tactical thinking",
    color: "#ea580c", // Orange
    icon: "lightbulb",
    subcategories: [
      {
        id: "problem_solving",
        name: "Problem Solving",
        description: "Creative solutions to climbing challenges",
        skillTypes: ["beta_development", "alternative_sequences", "creative_solutions", "troubleshooting"],
        color: "#f97316"
      },
      {
        id: "risk_assessment",
        name: "Risk Assessment",
        description: "Evaluating and managing climbing risks",
        skillTypes: ["safety_awareness", "fall_consequences", "gear_placement", "conditions"],
        color: "#ea580c"
      },
      {
        id: "training_planning",
        name: "Training Planning",
        description: "Structured approach to improvement",
        skillTypes: ["periodization", "weakness_identification", "goal_setting", "progress_tracking"],
        color: "#c2410c"
      },
      {
        id: "competition_strategy",
        name: "Competition Strategy",
        description: "Performance optimization in competitive settings",
        skillTypes: ["time_management", "energy_allocation", "pressure_handling", "observation"],
        color: "#9a3412"
      }
    ]
  }
];

// Helper functions
export function getSkillCategory(categoryId: string): SkillCategory | undefined {
  return CLIMBING_SKILL_TREE.find(cat => cat.id === categoryId);
}

export function getSkillSubcategory(categoryId: string, subcategoryId: string): SkillSubcategory | undefined {
  const category = getSkillCategory(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
}

export function getAllSkillTypes(): string[] {
  return CLIMBING_SKILL_TREE.flatMap(cat => 
    cat.subcategories.flatMap(sub => sub.skillTypes)
  );
}

export function getSkillTypeCategory(skillType: string): { category: SkillCategory; subcategory: SkillSubcategory } | undefined {
  for (const category of CLIMBING_SKILL_TREE) {
    for (const subcategory of category.subcategories) {
      if (subcategory.skillTypes.includes(skillType)) {
        return { category, subcategory };
      }
    }
  }
  return undefined;
}