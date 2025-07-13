// Client-side grade conversion utility
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

  // Helper method to convert any grade to user's preferred system
  toPreferredSystem(grade: string, userPreferredSystem: string): string {
    return this.convertGrade(grade, 'V-Scale', userPreferredSystem);
  }

  // Helper method to get grade ranges for whistle levels in any system
  getWhistleGradeRanges(preferredSystem: string): Record<string, string> {
    const vScaleRanges = {
      'Bell': 'V0',
      'Red': 'V1-V2',
      'Blue': 'V3-V4',
      'Moon': 'V5-V6',
      'Black': 'V7-V8',
      'White': 'V9+',
    };

    const convertedRanges: Record<string, string> = {};
    
    for (const [whistle, range] of Object.entries(vScaleRanges)) {
      if (range.includes('-')) {
        const [start, end] = range.split('-');
        const convertedStart = this.convertGrade(start, 'V-Scale', preferredSystem);
        const convertedEnd = this.convertGrade(end, 'V-Scale', preferredSystem);
        convertedRanges[whistle] = `${convertedStart}-${convertedEnd}`;
      } else if (range.includes('+')) {
        const baseGrade = range.replace('+', '');
        const convertedGrade = this.convertGrade(baseGrade, 'V-Scale', preferredSystem);
        convertedRanges[whistle] = `${convertedGrade}+`;
      } else {
        convertedRanges[whistle] = this.convertGrade(range, 'V-Scale', preferredSystem);
      }
    }
    
    return convertedRanges;
  }
}

export const gradeConverter = new GradeConverter();