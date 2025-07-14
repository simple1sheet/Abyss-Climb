import { gradeConverter } from './gradeConverter';
import { calculateProblemXP, calculateSessionXP } from '@shared/xpUtils';

export class XPCalculator {
  // XP reward system based on climbing grades
  private readonly XP_BASE_RATES = {
    // V-Scale XP rewards
    'V0': 5,
    'V1': 5,
    'V2': 10,
    'V3': 10,
    'V4': 15,
    'V5': 15,
    'V6': 20,
    'V7': 25,
    'V8': 30,
    'V9': 35,
    'V10': 40,
    'V11': 45,
    'V12': 50,
    'V13': 55,
    'V14': 60,
    'V15': 65,
    'V16': 70,
    'V17': 75,
  };

  // Multipliers for different achievements
  private readonly MULTIPLIERS = {
    COMPLETION: 1.0,        // Base multiplier for completing a problem
    FIRST_ATTEMPT: 1.5,     // Bonus for completing on first try
    FLASH: 2.0,             // Bonus for flashing (no falls)
    STYLE_BONUS: 1.2,       // Bonus for specific climbing styles
    DIFFICULTY_BONUS: 1.3,  // Bonus for problems above user's usual grade
  };

  /**
   * Calculate XP for a boulder problem (uses shared utility)
   */
  calculateProblemXP(grade: string, gradeSystem: string, completed: boolean, attempts: number, style?: string): number {
    // Convert grade to V-scale for consistent XP calculation
    const vScaleGrade = gradeConverter.convertGrade(grade, gradeSystem, 'V-Scale');
    
    return calculateProblemXP({
      grade: vScaleGrade,
      style: style || '',
      completed,
      attempts
    });
  }

  /**
   * Calculate session XP bonus based on session performance
   */
  calculateSessionBonus(problems: any[], sessionDurationMinutes: number): number {
    const completedProblems = problems.filter(p => p.completed);
    
    if (completedProblems.length === 0) {
      return 0;
    }

    let bonusXP = 0;

    // Volume bonus: more problems = more bonus
    if (completedProblems.length >= 10) {
      bonusXP += 50; // High volume bonus
    } else if (completedProblems.length >= 5) {
      bonusXP += 25; // Medium volume bonus
    } else if (completedProblems.length >= 3) {
      bonusXP += 10; // Small volume bonus
    }

    // Variety bonus: different grades
    const uniqueGrades = new Set(completedProblems.map(p => p.grade));
    if (uniqueGrades.size >= 4) {
      bonusXP += 30; // Good variety bonus
    } else if (uniqueGrades.size >= 3) {
      bonusXP += 15; // Some variety bonus
    }

    // Efficiency bonus: good XP per minute
    const totalProblemXP = completedProblems.reduce((sum, p) => sum + (p.xpEarned || 0), 0);
    const xpPerMinute = totalProblemXP / Math.max(sessionDurationMinutes, 1);
    
    if (xpPerMinute > 2) {
      bonusXP += 40; // High efficiency bonus
    } else if (xpPerMinute > 1) {
      bonusXP += 20; // Medium efficiency bonus
    }

    return bonusXP;
  }

  /**
   * Calculate total session XP including problems and bonuses
   */
  calculateTotalSessionXP(problems: any[], sessionDurationMinutes: number): number {
    const problemXP = problems.reduce((sum, problem) => {
      return sum + (problem.xpEarned || 0);
    }, 0);

    const bonusXP = this.calculateSessionBonus(problems, sessionDurationMinutes);
    
    return problemXP + bonusXP;
  }

  /**
   * Get base XP for a given grade
   */
  private getBaseXPForGrade(vScaleGrade: string): number {
    // Clean the grade (remove + or - modifiers)
    const cleanGrade = vScaleGrade.replace(/[+-]/g, '');
    
    // Get base XP from lookup table
    const baseXP = this.XP_BASE_RATES[cleanGrade as keyof typeof this.XP_BASE_RATES];
    
    if (baseXP) {
      // Apply modifier bonuses
      if (vScaleGrade.includes('+')) {
        return Math.round(baseXP * 1.1); // 10% bonus for + grades
      } else if (vScaleGrade.includes('-')) {
        return Math.round(baseXP * 0.9); // 10% penalty for - grades
      }
      return baseXP;
    }

    // Fallback for grades not in table
    const gradeNumber = parseInt(cleanGrade.replace('V', ''));
    if (gradeNumber >= 0 && gradeNumber <= 17) {
      return Math.max(5, gradeNumber * 5); // 5 XP per grade level, minimum 5
    }

    return 5; // Default fallback
  }

  /**
   * Get XP breakdown for display purposes
   */
  getXPBreakdown(grade: string, gradeSystem: string, completed: boolean, attempts: number, style?: string): {
    baseXP: number;
    attemptMultiplier: number;
    styleMultiplier: number;
    totalXP: number;
  } {
    if (!completed) {
      return { baseXP: 0, attemptMultiplier: 0, styleMultiplier: 0, totalXP: 0 };
    }

    const vScaleGrade = gradeConverter.convertGrade(grade, gradeSystem, 'V-Scale');
    const baseXP = this.getBaseXPForGrade(vScaleGrade);
    
    let attemptMultiplier = 1.0;
    if (attempts === 1) {
      attemptMultiplier = this.MULTIPLIERS.FIRST_ATTEMPT;
    } else if (attempts <= 3) {
      attemptMultiplier = 1.2;
    } else if (attempts > 10) {
      attemptMultiplier = 0.8;
    }

    let styleMultiplier = 1.0;
    if (style) {
      const technicalStyles = ['technical', 'balance', 'coordination', 'endurance'];
      if (technicalStyles.includes(style.toLowerCase())) {
        styleMultiplier = this.MULTIPLIERS.STYLE_BONUS;
      }
    }

    const totalXP = Math.round(baseXP * attemptMultiplier * styleMultiplier);

    return {
      baseXP,
      attemptMultiplier,
      styleMultiplier,
      totalXP: Math.max(totalXP, 1)
    };
  }
}

export const xpCalculator = new XPCalculator();