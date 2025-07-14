import { storage } from "../storage";
import { gradeConverter } from "./gradeConverter";
import { 
  InsertProgressionSnapshot, 
  InsertDifficultyRecommendation, 
  InsertLearningPathMilestone,
  ProgressionSnapshot,
  DifficultyRecommendation,
  LearningPathMilestone
} from "@shared/schema";

export class ProgressionTracker {
  
  // Analyze user's current climbing performance and generate snapshot
  async generateProgressionSnapshot(userId: string): Promise<ProgressionSnapshot> {
    const userSkills = await storage.getUserSkills(userId);
    const recentSessions = await storage.getUserClimbingSessions(userId, 20);
    const allProblems = await this.getUserRecentProblems(userId, 50);
    
    // Calculate current ability metrics
    const currentMaxGrade = this.calculateCurrentMaxGrade(userSkills);
    const comfortGrade = this.calculateComfortGrade(allProblems);
    const projectGrade = this.calculateProjectGrade(currentMaxGrade);
    
    // Calculate performance metrics
    const sendRate = this.calculateSendRate(allProblems);
    const attemptEfficiency = this.calculateAttemptEfficiency(allProblems);
    const consistencyScore = this.calculateConsistencyScore(allProblems);
    const improvementRate = this.calculateImprovementRate(allProblems);
    
    // Calculate learning metrics
    const styleVersatility = this.calculateStyleVersatility(allProblems);
    const holdTypeAdaptability = this.calculateHoldTypeAdaptability(allProblems);
    const weaknessImprovement = this.calculateWeaknessImprovement(userSkills);
    
    // Get user registration date for days since start
    const user = await storage.getUser(userId);
    const daysSinceStart = user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    const snapshot: InsertProgressionSnapshot = {
      userId,
      currentMaxGrade,
      currentGradeSystem: user?.preferredGradeSystem || 'V-Scale',
      comfortGrade,
      projectGrade,
      sendRate,
      attemptEfficiency,
      consistencyScore,
      improvementRate,
      styleVersatility,
      holdTypeAdaptability,
      weaknessImprovement,
      totalProblems: allProblems.length,
      totalSessions: recentSessions.length,
      daysSinceStart,
    };
    
    return await storage.createProgressionSnapshot(snapshot);
  }
  
  // Generate adaptive difficulty recommendations
  async generateDifficultyRecommendations(userId: string): Promise<DifficultyRecommendation> {
    const snapshot = await this.generateProgressionSnapshot(userId);
    const userSkills = await storage.getUserSkills(userId);
    const recentProblems = await this.getUserRecentProblems(userId, 30);
    
    // Calculate recommended grades
    const warmupGrade = this.calculateWarmupGrade(snapshot.comfortGrade);
    const comfortGrade = snapshot.comfortGrade;
    const challengeGrade = this.calculateChallengeGrade(snapshot.currentMaxGrade);
    const projectGrade = snapshot.projectGrade;
    
    // Analyze focus areas
    const focusStyles = this.analyzeFocusStyles(userSkills, recentProblems);
    const weaknessAreas = this.analyzeWeaknessAreas(userSkills);
    const trainingPlan = this.generateTrainingPlan(snapshot, focusStyles, weaknessAreas);
    
    // Calculate confidence and reasoning
    const confidenceScore = this.calculateConfidenceScore(snapshot);
    const adaptationReason = this.generateAdaptationReason(snapshot, focusStyles, weaknessAreas);
    
    // Set validity period (recommendations expire after 7 days)
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const recommendation: InsertDifficultyRecommendation = {
      userId,
      warmupGrade,
      comfortGrade,
      challengeGrade,
      projectGrade,
      focusStyles: JSON.stringify(focusStyles),
      weaknessAreas: JSON.stringify(weaknessAreas),
      trainingPlan: JSON.stringify(trainingPlan),
      confidenceScore,
      adaptationReason,
      validUntil,
      isActive: true,
    };
    
    return await storage.createDifficultyRecommendation(recommendation);
  }
  
  // Generate learning path milestones
  async generateLearningPathMilestones(userId: string): Promise<LearningPathMilestone[]> {
    const snapshot = await this.generateProgressionSnapshot(userId);
    const userSkills = await storage.getUserSkills(userId);
    
    const milestones: InsertLearningPathMilestone[] = [];
    
    // Grade-based milestones
    const nextGradeTarget = this.getNextGradeTarget(snapshot.currentMaxGrade);
    if (nextGradeTarget) {
      milestones.push({
        userId,
        milestoneType: 'grade',
        title: `Send your first ${nextGradeTarget}`,
        description: `Complete a ${nextGradeTarget} boulder problem to advance your grade progression`,
        targetGrade: nextGradeTarget,
        category: 'technique',
        difficulty: this.getDifficultyLevel(nextGradeTarget),
        orderIndex: 1,
        motivationText: `Push your limits and tackle this challenging grade!`,
        tips: JSON.stringify([
          'Warm up thoroughly before attempting',
          'Focus on technique over strength',
          'Break down the problem into sections',
          'Practice similar movements on easier grades'
        ]),
      });
    }
    
    // Consistency milestones
    if (snapshot.consistencyScore < 0.7) {
      milestones.push({
        userId,
        milestoneType: 'consistency',
        title: 'Improve Send Consistency',
        description: 'Achieve 70% send rate on your comfort grade',
        targetValue: 0.7,
        currentValue: snapshot.consistencyScore,
        progressPercentage: (snapshot.consistencyScore / 0.7) * 100,
        category: 'technique',
        difficulty: 'intermediate',
        orderIndex: 2,
        motivationText: 'Consistency is key to climbing progression!',
        tips: JSON.stringify([
          'Practice your comfort grade regularly',
          'Focus on reading routes before climbing',
          'Work on movement efficiency',
          'Stay relaxed and maintain good form'
        ]),
      });
    }
    
    // Style diversity milestones
    if (snapshot.styleVersatility < 0.6) {
      milestones.push({
        userId,
        milestoneType: 'style',
        title: 'Expand Style Repertoire',
        description: 'Climb at least 5 different movement styles',
        targetValue: 5,
        currentValue: snapshot.styleVersatility * 10, // Approximate styles climbed
        progressPercentage: (snapshot.styleVersatility / 0.6) * 100,
        category: 'style',
        difficulty: 'intermediate',
        orderIndex: 3,
        motivationText: 'Versatility makes you a well-rounded climber!',
        tips: JSON.stringify([
          'Try overhangs for strength training',
          'Practice slabs for balance',
          'Work on dynamic movements',
          'Focus on technical crimps'
        ]),
      });
    }
    
    // Volume milestone
    if (snapshot.totalProblems < 100) {
      milestones.push({
        userId,
        milestoneType: 'volume',
        title: 'Climb 100 Problems',
        description: 'Complete 100 boulder problems total',
        targetValue: 100,
        currentValue: snapshot.totalProblems,
        progressPercentage: (snapshot.totalProblems / 100) * 100,
        category: 'endurance',
        difficulty: 'beginner',
        orderIndex: 4,
        motivationText: 'Build experience through volume!',
        tips: JSON.stringify([
          'Focus on variety over difficulty',
          'Log every problem you attempt',
          'Mix indoor and outdoor climbing',
          'Set daily climbing goals'
        ]),
      });
    }
    
    // Create milestones in database
    const createdMilestones: LearningPathMilestone[] = [];
    for (const milestone of milestones) {
      const created = await storage.createLearningPathMilestone(milestone);
      createdMilestones.push(created);
    }
    
    return createdMilestones;
  }
  
  // Helper methods for calculations
  private async getUserRecentProblems(userId: string, limit: number): Promise<any[]> {
    const sessions = await storage.getUserClimbingSessions(userId, limit);
    const problems = [];
    
    for (const session of sessions) {
      const sessionProblems = await storage.getBoulderProblemsForSession(session.id);
      problems.push(...sessionProblems);
    }
    
    return problems.slice(0, limit);
  }
  
  private calculateCurrentMaxGrade(userSkills: any[]): string {
    if (!userSkills || userSkills.length === 0) return 'V0';
    
    const maxGrade = userSkills.reduce((max, skill) => {
      const skillGrade = skill.maxGrade || 'V0';
      const skillNumeric = gradeConverter.getGradeNumericValue(skillGrade);
      const maxNumeric = gradeConverter.getGradeNumericValue(max);
      return skillNumeric > maxNumeric ? skillGrade : max;
    }, 'V0');
    
    return maxGrade;
  }
  
  private calculateComfortGrade(problems: any[]): string {
    if (!problems || problems.length === 0) return 'V0';
    
    const completedProblems = problems.filter(p => p.completed);
    if (completedProblems.length === 0) return 'V0';
    
    // Find the grade they can complete with 70%+ success rate
    const gradeStats = new Map<string, { attempts: number, successes: number }>();
    
    problems.forEach(p => {
      const grade = p.grade;
      if (!gradeStats.has(grade)) {
        gradeStats.set(grade, { attempts: 0, successes: 0 });
      }
      const stats = gradeStats.get(grade)!;
      stats.attempts++;
      if (p.completed) stats.successes++;
    });
    
    let comfortGrade = 'V0';
    let highestSuccessRate = 0;
    
    gradeStats.forEach((stats, grade) => {
      const successRate = stats.successes / stats.attempts;
      if (successRate >= 0.7 && successRate > highestSuccessRate) {
        highestSuccessRate = successRate;
        comfortGrade = grade;
      }
    });
    
    return comfortGrade;
  }
  
  private calculateProjectGrade(currentMaxGrade: string): string {
    const currentNumeric = gradeConverter.getGradeNumericValue(currentMaxGrade);
    const projectNumeric = Math.min(currentNumeric + 2, 17); // Cap at V17
    return gradeConverter.getGradeFromNumeric(projectNumeric);
  }
  
  private calculateSendRate(problems: any[]): number {
    if (!problems || problems.length === 0) return 0;
    const completedCount = problems.filter(p => p.completed).length;
    return completedCount / problems.length;
  }
  
  private calculateAttemptEfficiency(problems: any[]): number {
    if (!problems || problems.length === 0) return 0;
    const completedProblems = problems.filter(p => p.completed);
    if (completedProblems.length === 0) return 0;
    
    const totalAttempts = completedProblems.reduce((sum, p) => sum + (p.attempts || 1), 0);
    return completedProblems.length / totalAttempts;
  }
  
  private calculateConsistencyScore(problems: any[]): number {
    if (!problems || problems.length === 0) return 0;
    
    // Calculate variance in success rate across different grades
    const gradeStats = new Map<string, number>();
    problems.forEach(p => {
      const grade = p.grade;
      if (!gradeStats.has(grade)) gradeStats.set(grade, 0);
      if (p.completed) gradeStats.set(grade, gradeStats.get(grade)! + 1);
    });
    
    const successRates = Array.from(gradeStats.values());
    if (successRates.length === 0) return 0;
    
    const average = successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length;
    const variance = successRates.reduce((sum, rate) => sum + Math.pow(rate - average, 2), 0) / successRates.length;
    
    // Lower variance = higher consistency
    return Math.max(0, 1 - (variance / average));
  }
  
  private calculateImprovementRate(problems: any[]): number {
    if (!problems || problems.length < 10) return 0;
    
    // Sort problems by date
    const sortedProblems = problems.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Compare first 20% vs last 20% of problems
    const firstQuintile = sortedProblems.slice(0, Math.floor(sortedProblems.length * 0.2));
    const lastQuintile = sortedProblems.slice(-Math.floor(sortedProblems.length * 0.2));
    
    const firstAvgGrade = this.calculateAverageGrade(firstQuintile);
    const lastAvgGrade = this.calculateAverageGrade(lastQuintile);
    
    return (lastAvgGrade - firstAvgGrade) / firstAvgGrade;
  }
  
  private calculateStyleVersatility(problems: any[]): number {
    if (!problems || problems.length === 0) return 0;
    
    const styles = new Set<string>();
    problems.forEach(p => {
      if (p.style) {
        p.style.split(',').forEach((style: string) => styles.add(style.trim()));
      }
    });
    
    // Normalize to 0-1 scale (assuming 10 different styles maximum)
    return Math.min(styles.size / 10, 1);
  }
  
  private calculateHoldTypeAdaptability(problems: any[]): number {
    if (!problems || problems.length === 0) return 0;
    
    const holdTypes = new Set<string>();
    problems.forEach(p => {
      if (p.holdType) {
        holdTypes.add(p.holdType);
      }
    });
    
    // Normalize to 0-1 scale (assuming 6 different hold types maximum)
    return Math.min(holdTypes.size / 6, 1);
  }
  
  private calculateWeaknessImprovement(userSkills: any[]): number {
    if (!userSkills || userSkills.length === 0) return 0;
    
    // Find skills with low total problems (weaknesses)
    const weakSkills = userSkills.filter(s => s.totalProblems < 5);
    const totalSkills = userSkills.length;
    
    // Higher score = fewer weaknesses
    return Math.max(0, 1 - (weakSkills.length / totalSkills));
  }
  
  private calculateAverageGrade(problems: any[]): number {
    if (!problems || problems.length === 0) return 0;
    
    const gradeSum = problems.reduce((sum, p) => {
      return sum + gradeConverter.getGradeNumericValue(p.grade);
    }, 0);
    
    return gradeSum / problems.length;
  }
  
  private calculateWarmupGrade(comfortGrade: string): string {
    const comfortNumeric = gradeConverter.getGradeNumericValue(comfortGrade);
    const warmupNumeric = Math.max(0, comfortNumeric - 2);
    return gradeConverter.getGradeFromNumeric(warmupNumeric);
  }
  
  private calculateChallengeGrade(currentMaxGrade: string): string {
    const maxNumeric = gradeConverter.getGradeNumericValue(currentMaxGrade);
    const challengeNumeric = Math.min(maxNumeric + 1, 17);
    return gradeConverter.getGradeFromNumeric(challengeNumeric);
  }
  
  private analyzeFocusStyles(userSkills: any[], recentProblems: any[]): string[] {
    const stylePerformance = new Map<string, { count: number, successRate: number }>();
    
    recentProblems.forEach(p => {
      if (p.style) {
        p.style.split(',').forEach((style: string) => {
          const trimmedStyle = style.trim();
          if (!stylePerformance.has(trimmedStyle)) {
            stylePerformance.set(trimmedStyle, { count: 0, successRate: 0 });
          }
          const stats = stylePerformance.get(trimmedStyle)!;
          stats.count++;
          if (p.completed) stats.successRate++;
        });
      }
    });
    
    // Calculate actual success rates
    stylePerformance.forEach((stats, style) => {
      stats.successRate = stats.successRate / stats.count;
    });
    
    // Return styles with low success rates (need focus)
    return Array.from(stylePerformance.entries())
      .filter(([_, stats]) => stats.successRate < 0.6 && stats.count >= 3)
      .map(([style, _]) => style)
      .slice(0, 3);
  }
  
  private analyzeWeaknessAreas(userSkills: any[]): string[] {
    return userSkills
      .filter(skill => skill.totalProblems < 5)
      .map(skill => skill.skillType)
      .slice(0, 3);
  }
  
  private generateTrainingPlan(snapshot: ProgressionSnapshot, focusStyles: string[], weaknessAreas: string[]): any {
    return {
      warmupRoutine: {
        duration: '15-20 minutes',
        focus: `Start with ${snapshot.warmupGrade} problems`,
        volume: '3-5 problems'
      },
      techniqueWork: {
        focus: focusStyles.length > 0 ? focusStyles : ['general technique'],
        recommendation: 'Spend 30% of session on technique practice'
      },
      strengthBuilding: {
        focus: weaknessAreas.length > 0 ? weaknessAreas : ['general strength'],
        recommendation: 'Address weak areas with targeted exercises'
      },
      projectWork: {
        grade: snapshot.projectGrade,
        recommendation: 'End session with project attempts'
      }
    };
  }
  
  private calculateConfidenceScore(snapshot: ProgressionSnapshot): number {
    // Base confidence on data quality
    let confidence = 0.5;
    
    // More problems = higher confidence
    if (snapshot.totalProblems > 50) confidence += 0.2;
    if (snapshot.totalProblems > 100) confidence += 0.1;
    
    // More sessions = higher confidence
    if (snapshot.totalSessions > 20) confidence += 0.1;
    
    // Higher consistency = higher confidence
    confidence += snapshot.consistencyScore * 0.2;
    
    return Math.min(confidence, 1);
  }
  
  private generateAdaptationReason(snapshot: ProgressionSnapshot, focusStyles: string[], weaknessAreas: string[]): string {
    const reasons = [];
    
    if (snapshot.sendRate < 0.5) {
      reasons.push('Low send rate indicates need for easier warm-up grades');
    }
    
    if (focusStyles.length > 0) {
      reasons.push(`Focus on ${focusStyles.join(', ')} styles for improvement`);
    }
    
    if (weaknessAreas.length > 0) {
      reasons.push(`Address weakness in ${weaknessAreas.join(', ')} areas`);
    }
    
    if (snapshot.consistencyScore < 0.6) {
      reasons.push('Work on consistency at current grade level');
    }
    
    return reasons.join('. ') || 'General progression recommendations based on current performance';
  }
  
  private getNextGradeTarget(currentMaxGrade: string): string {
    const currentNumeric = gradeConverter.getGradeNumericValue(currentMaxGrade);
    const nextNumeric = Math.min(currentNumeric + 1, 17);
    return gradeConverter.getGradeFromNumeric(nextNumeric);
  }
  
  private getDifficultyLevel(grade: string): string {
    const numeric = gradeConverter.getGradeNumericValue(grade);
    if (numeric <= 3) return 'beginner';
    if (numeric <= 6) return 'intermediate';
    if (numeric <= 10) return 'advanced';
    return 'expert';
  }
}

export const progressionTracker = new ProgressionTracker();