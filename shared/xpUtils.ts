export interface BoulderProblem {
  grade: string;
  style: string;
  completed: boolean;
  attempts: number;
}

export function calculateProblemXP(problem: BoulderProblem): number {
  if (!problem.completed) return 0;
  
  // Base XP by grade
  const gradeXP: Record<string, number> = {
    'V0': 5, 'V1': 5,
    'V2': 10, 'V3': 10,
    'V4': 15, 'V5': 15,
    'V6': 20, 'V7': 22, 'V8': 25, 'V9': 28,
    'V10': 30, 'V11': 32, 'V12': 35, 'V13': 38, 'V14': 40, 'V15': 45, 'V16': 50, 'V17': 55
  };
  
  const baseXP = gradeXP[problem.grade] || 5;
  
  // Attempt multiplier
  let attemptMultiplier = 1.0;
  if (problem.attempts === 1) {
    attemptMultiplier = 1.5; // Flash bonus
  } else if (problem.attempts <= 3) {
    attemptMultiplier = 1.2; // Quick success
  } else if (problem.attempts > 10) {
    attemptMultiplier = 0.8; // Difficulty penalty
  }
  
  // Style bonus (20% for technical styles)
  const technicalStyles = ['technical', 'balance', 'coordination', 'endurance'];
  const styles = problem.style ? problem.style.split(',').map(s => s.trim().toLowerCase()) : [];
  const styleMultiplier = styles.some(style => technicalStyles.includes(style)) ? 1.2 : 1.0;
  
  return Math.round(baseXP * attemptMultiplier * styleMultiplier);
}

export function calculateSessionXP(problems: BoulderProblem[]): number {
  return problems.reduce((sum, problem) => sum + calculateProblemXP(problem), 0);
}