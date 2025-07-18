export class GradeConverter {
  private readonly GRADE_CONVERSIONS = {
    // V-Scale to Fontainebleau
    'V0': '4',
    'V1': '5',
    'V2': '5+',
    'V3': '6A',
    'V4': '6A+',
    'V5': '6B',
    'V6': '6B+',
    'V7': '6C',
    'V8': '6C+',
    'V9': '7A',
    'V10': '7A+',
    'V11': '7B',
    'V12': '7B+',
    'V13': '7C',
    'V14': '7C+',
    'V15': '8A',
    'V16': '8A+',
    'V17': '8B',
    'V18': '8B+',
  };

  private readonly GERMAN_CONVERSIONS = {
    // V-Scale to German (Saxon)
    'V0': '3',
    'V1': '4',
    'V2': '5',
    'V3': '6',
    'V4': '6+',
    'V5': '7-',
    'V6': '7',
    'V7': '7+',
    'V8': '8-',
    'V9': '8',
    'V10': '8+',
    'V11': '9-',
    'V12': '9',
    'V13': '9+',
    'V14': '10-',
    'V15': '10',
    'V16': '10+',
    'V17': '11-',
    'V18': '11',
  };

  convertGrade(grade: string, fromSystem: string, toSystem: string): string {
    // Normalize input
    const normalizedGrade = grade.toUpperCase().trim();
    
    // If converting to same system, return as is
    if (fromSystem === toSystem) {
      return grade;
    }

    // Convert to V-Scale first if needed
    let vScale = normalizedGrade;
    if (fromSystem === 'Font') {
      vScale = this.fontToVScale(normalizedGrade);
    } else if (fromSystem === 'German') {
      vScale = this.germanToVScale(normalizedGrade);
    }

    // Convert from V-Scale to target system
    switch (toSystem) {
      case 'Font':
        return this.GRADE_CONVERSIONS[vScale as keyof typeof this.GRADE_CONVERSIONS] || vScale;
      case 'German':
        return this.GERMAN_CONVERSIONS[vScale as keyof typeof this.GERMAN_CONVERSIONS] || vScale;
      case 'V-Scale':
        return vScale;
      default:
        return grade;
    }
  }

  private fontToVScale(fontGrade: string): string {
    const reverseMap = Object.fromEntries(
      Object.entries(this.GRADE_CONVERSIONS).map(([k, v]) => [v, k])
    );
    return reverseMap[fontGrade] || fontGrade;
  }

  private germanToVScale(germanGrade: string): string {
    const reverseMap = Object.fromEntries(
      Object.entries(this.GERMAN_CONVERSIONS).map(([k, v]) => [v, k])
    );
    return reverseMap[germanGrade] || germanGrade;
  }

  getGradeNumericValue(grade: string, system: string): number {
    // Convert to V-Scale for consistent numeric comparison
    const vScale = this.convertGrade(grade, system, 'V-Scale');
    const match = vScale.match(/V(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  getLayerForGrade(grade: string, system: string): number {
    const vScale = this.convertGrade(grade, system, 'V-Scale');
    const numericValue = this.getGradeNumericValue(vScale, 'V-Scale');
    
    if (numericValue <= 2) return 1; // Layer 1: V0-V2
    if (numericValue <= 5) return 2; // Layer 2: V3-V5
    if (numericValue <= 8) return 3; // Layer 3: V6-V8
    if (numericValue <= 11) return 4; // Layer 4: V9-V11
    if (numericValue <= 14) return 5; // Layer 5: V12-V14
    if (numericValue <= 17) return 6; // Layer 6: V15-V17
    return 7; // Layer 7: V18+
  }

  getWhistleLevel(grade: string, system: string): number {
    const vScale = this.convertGrade(grade, system, 'V-Scale');
    const numericValue = this.getGradeNumericValue(vScale, 'V-Scale');
    
    // New whistle system based on grade difficulty
    if (numericValue === 0) return 0; // Bell whistle: V0
    if (numericValue <= 2) return 1; // Red whistle: V1-V2
    if (numericValue <= 4) return 2; // Blue whistle: V3-V4
    if (numericValue <= 6) return 3; // Moon whistle: V5-V6
    if (numericValue <= 8) return 4; // Black whistle: V7-V8
    return 5; // White whistle: V9+
  }

  getWhistleName(level: number): string {
    const whistleNames = {
      0: "Bell Whistle",
      1: "Red Whistle",
      2: "Blue Whistle",
      3: "Moon Whistle",
      4: "Black Whistle",
      5: "White Whistle"
    };
    return whistleNames[level as keyof typeof whistleNames] || "Unknown";
  }

  getSkillCategoryForStyle(style: string): { mainCategory: string; subCategory: string; skillType: string } {
    const styleMap = {
      // Frontend available styles (capitalized) - mapping to actual skillTypes from skill tree
      'Crimps': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'crimps' },
      'Jugs': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'crimps' }, // No 'jugs' in skill tree, use crimps
      'Pinches': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'pinches' },
      'Slopers': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'slopers' },
      'Pockets': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'pockets' },
      'Dynos': { mainCategory: 'movement', subCategory: 'dynamic', skillType: 'dynos' },
      'Mantles': { mainCategory: 'movement', subCategory: 'balance', skillType: 'mantles' },
      'Overhangs': { mainCategory: 'strength', subCategory: 'core_strength', skillType: 'overhangs' },
      'Slabs': { mainCategory: 'movement', subCategory: 'balance', skillType: 'slab' }, // Note: skillType is 'slab' not 'slabs'
      'Roofs': { mainCategory: 'strength', subCategory: 'core_strength', skillType: 'overhangs' }, // No 'roofs' in skill tree, use overhangs
      'Aretes': { mainCategory: 'technical', subCategory: 'technique_refinement', skillType: 'body_positioning' }, // No 'aretes' in skill tree, use body_positioning
      'Compression': { mainCategory: 'strength', subCategory: 'core_strength', skillType: 'compression' },
      'Coordination': { mainCategory: 'movement', subCategory: 'coordination', skillType: 'cross_through' }, // Use specific coordination skill
      
      // Additional common styles (lowercase versions for compatibility)
      'crimps': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'crimps' },
      'jugs': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'crimps' },
      'pinches': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'pinches' },
      'slopers': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'slopers' },
      'pockets': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'pockets' },
      'dynos': { mainCategory: 'movement', subCategory: 'dynamic', skillType: 'dynos' },
      'mantles': { mainCategory: 'movement', subCategory: 'balance', skillType: 'mantles' },
      'overhangs': { mainCategory: 'strength', subCategory: 'core_strength', skillType: 'overhangs' },
      'slabs': { mainCategory: 'movement', subCategory: 'balance', skillType: 'slab' },
      'roofs': { mainCategory: 'strength', subCategory: 'core_strength', skillType: 'overhangs' },
      'aretes': { mainCategory: 'technical', subCategory: 'technique_refinement', skillType: 'body_positioning' },
      'compression': { mainCategory: 'strength', subCategory: 'core_strength', skillType: 'compression' },
      'coordination': { mainCategory: 'movement', subCategory: 'coordination', skillType: 'cross_through' },
      
      // Additional movement styles
      'heel_hooks': { mainCategory: 'movement', subCategory: 'coordination', skillType: 'heel_hooks' },
      'toe_hooks': { mainCategory: 'movement', subCategory: 'coordination', skillType: 'toe_hooks' },
      'flagging': { mainCategory: 'movement', subCategory: 'coordination', skillType: 'flagging' },
      'stemming': { mainCategory: 'movement', subCategory: 'coordination', skillType: 'cross_through' },
      'balance': { mainCategory: 'movement', subCategory: 'balance', skillType: 'slab' },
      'flexibility': { mainCategory: 'movement', subCategory: 'flexibility', skillType: 'high_steps' },
      'footwork': { mainCategory: 'movement', subCategory: 'footwork', skillType: 'smearing' },
      
      // Additional strength styles
      'power': { mainCategory: 'strength', subCategory: 'upper_body', skillType: 'pull_ups' },
      'campus': { mainCategory: 'strength', subCategory: 'contact_strength', skillType: 'dead_points' },
      'lockoffs': { mainCategory: 'strength', subCategory: 'upper_body', skillType: 'lockoffs' },
      'core': { mainCategory: 'strength', subCategory: 'core_strength', skillType: 'compression' },
      'underclings': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'slopers' },
      'gaston': { mainCategory: 'strength', subCategory: 'finger_strength', skillType: 'pinches' },
      
      // Technical styles
      'technical': { mainCategory: 'technical', subCategory: 'technique_refinement', skillType: 'body_positioning' },
      'route_reading': { mainCategory: 'technical', subCategory: 'route_reading', skillType: 'beta_reading' },
      'reading': { mainCategory: 'technical', subCategory: 'route_reading', skillType: 'beta_reading' },
      'sequencing': { mainCategory: 'technical', subCategory: 'route_reading', skillType: 'sequence_planning' },
      'beta': { mainCategory: 'technical', subCategory: 'route_reading', skillType: 'beta_reading' },
      'efficiency': { mainCategory: 'technical', subCategory: 'efficiency', skillType: 'rest_positions' },
      'adaptation': { mainCategory: 'technical', subCategory: 'adaptation', skillType: 'style_switching' },
      
      // Mental styles
      'confidence': { mainCategory: 'mental', subCategory: 'confidence', skillType: 'commitment' },
      'risk_management': { mainCategory: 'mental', subCategory: 'fear_management', skillType: 'exposure' },
      'mental_game': { mainCategory: 'mental', subCategory: 'confidence', skillType: 'commitment' },
      'focus': { mainCategory: 'mental', subCategory: 'focus', skillType: 'route_reading' },
      'fear': { mainCategory: 'mental', subCategory: 'fear_management', skillType: 'falling' },
      'persistence': { mainCategory: 'mental', subCategory: 'persistence', skillType: 'projecting' },
      
      // Endurance styles
      'endurance': { mainCategory: 'endurance', subCategory: 'power_endurance', skillType: 'circuits' },
      'pump': { mainCategory: 'endurance', subCategory: 'power_endurance', skillType: 'pump_tolerance' },
      'recovery': { mainCategory: 'endurance', subCategory: 'recovery', skillType: 'active_recovery' },
      'aerobic': { mainCategory: 'endurance', subCategory: 'aerobic_capacity', skillType: 'long_sessions' },
      
      // Strategy styles
      'strategy': { mainCategory: 'strategy', subCategory: 'problem_solving', skillType: 'beta_development' },
      'tactics': { mainCategory: 'strategy', subCategory: 'problem_solving', skillType: 'creative_solutions' },
      'planning': { mainCategory: 'strategy', subCategory: 'problem_solving', skillType: 'beta_development' },
      'risk_assessment': { mainCategory: 'strategy', subCategory: 'risk_assessment', skillType: 'safety_awareness' },
      'training': { mainCategory: 'strategy', subCategory: 'training_planning', skillType: 'weakness_identification' },
      'competition': { mainCategory: 'strategy', subCategory: 'competition_strategy', skillType: 'time_management' }
    };
    
    return styleMap[style as keyof typeof styleMap] || { mainCategory: 'technical', subCategory: 'technique_refinement', skillType: 'body_positioning' };
  }
}

export const gradeConverter = new GradeConverter();
