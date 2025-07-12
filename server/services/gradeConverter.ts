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
}

export const gradeConverter = new GradeConverter();
