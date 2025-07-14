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

  getSkillCategoryForStyle(style: string): { mainCategory: string; subCategory: string } {
    const styleMap = {
      // Frontend available styles (capitalized) - matching exact names from STYLE_OPTIONS
      'Crimps': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'Jugs': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'Pinches': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'Slopers': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'Pockets': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'Dynos': { mainCategory: 'movement', subCategory: 'dynamic' },
      'Mantles': { mainCategory: 'movement', subCategory: 'balance' },
      'Overhangs': { mainCategory: 'strength', subCategory: 'core_strength' },
      'Slabs': { mainCategory: 'movement', subCategory: 'balance' },
      'Roofs': { mainCategory: 'strength', subCategory: 'core_strength' },
      'Aretes': { mainCategory: 'technical', subCategory: 'technique_refinement' },
      'Compression': { mainCategory: 'strength', subCategory: 'core_strength' },
      'Coordination': { mainCategory: 'movement', subCategory: 'coordination' },
      
      // Additional common styles (lowercase versions for compatibility)
      'crimps': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'jugs': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'pinches': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'slopers': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'pockets': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'dynos': { mainCategory: 'movement', subCategory: 'dynamic' },
      'mantles': { mainCategory: 'movement', subCategory: 'balance' },
      'overhangs': { mainCategory: 'strength', subCategory: 'core_strength' },
      'slabs': { mainCategory: 'movement', subCategory: 'balance' },
      'roofs': { mainCategory: 'strength', subCategory: 'core_strength' },
      'aretes': { mainCategory: 'technical', subCategory: 'technique_refinement' },
      'compression': { mainCategory: 'strength', subCategory: 'core_strength' },
      'coordination': { mainCategory: 'movement', subCategory: 'coordination' },
      
      // Additional movement styles
      'heel_hooks': { mainCategory: 'movement', subCategory: 'coordination' },
      'toe_hooks': { mainCategory: 'movement', subCategory: 'coordination' },
      'flagging': { mainCategory: 'movement', subCategory: 'coordination' },
      'stemming': { mainCategory: 'movement', subCategory: 'coordination' },
      'balance': { mainCategory: 'movement', subCategory: 'balance' },
      'flexibility': { mainCategory: 'movement', subCategory: 'flexibility' },
      'footwork': { mainCategory: 'movement', subCategory: 'footwork' },
      
      // Additional strength styles
      'power': { mainCategory: 'strength', subCategory: 'upper_body' },
      'campus': { mainCategory: 'strength', subCategory: 'contact_strength' },
      'lockoffs': { mainCategory: 'strength', subCategory: 'upper_body' },
      'core': { mainCategory: 'strength', subCategory: 'core_strength' },
      'underclings': { mainCategory: 'strength', subCategory: 'finger_strength' },
      'gaston': { mainCategory: 'strength', subCategory: 'finger_strength' },
      
      // Technical styles
      'technical': { mainCategory: 'technical', subCategory: 'technique_refinement' },
      'route_reading': { mainCategory: 'technical', subCategory: 'route_reading' },
      'reading': { mainCategory: 'technical', subCategory: 'route_reading' },
      'sequencing': { mainCategory: 'technical', subCategory: 'route_reading' },
      'beta': { mainCategory: 'technical', subCategory: 'route_reading' },
      'efficiency': { mainCategory: 'technical', subCategory: 'efficiency' },
      'adaptation': { mainCategory: 'technical', subCategory: 'adaptation' },
      
      // Mental styles
      'confidence': { mainCategory: 'mental', subCategory: 'confidence' },
      'risk_management': { mainCategory: 'mental', subCategory: 'fear_management' },
      'mental_game': { mainCategory: 'mental', subCategory: 'confidence' },
      'focus': { mainCategory: 'mental', subCategory: 'focus' },
      'fear': { mainCategory: 'mental', subCategory: 'fear_management' },
      'persistence': { mainCategory: 'mental', subCategory: 'persistence' },
      
      // Endurance styles
      'endurance': { mainCategory: 'endurance', subCategory: 'power_endurance' },
      'pump': { mainCategory: 'endurance', subCategory: 'power_endurance' },
      'recovery': { mainCategory: 'endurance', subCategory: 'recovery' },
      'aerobic': { mainCategory: 'endurance', subCategory: 'aerobic_capacity' },
      
      // Strategy styles
      'strategy': { mainCategory: 'strategy', subCategory: 'problem_solving' },
      'tactics': { mainCategory: 'strategy', subCategory: 'problem_solving' },
      'planning': { mainCategory: 'strategy', subCategory: 'problem_solving' },
      'risk_assessment': { mainCategory: 'strategy', subCategory: 'risk_assessment' },
      'training': { mainCategory: 'strategy', subCategory: 'training_planning' },
      'competition': { mainCategory: 'strategy', subCategory: 'competition_strategy' }
    };
    
    return styleMap[style as keyof typeof styleMap] || { mainCategory: 'technical', subCategory: 'technique_refinement' };
  }
}

export const gradeConverter = new GradeConverter();
