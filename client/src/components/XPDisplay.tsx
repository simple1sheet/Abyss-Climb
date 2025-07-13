import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, TrendingUp, Target, Star } from "lucide-react";

interface XPDisplayProps {
  xpEarned: number;
  isAnimated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  breakdown?: {
    baseXP: number;
    attemptMultiplier: number;
    styleMultiplier: number;
    totalXP: number;
  };
}

export function XPDisplay({ 
  xpEarned, 
  isAnimated = false, 
  size = 'md',
  showBreakdown = false,
  breakdown 
}: XPDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  if (xpEarned === 0) {
    return (
      <Badge variant="outline" className="text-gray-500 border-gray-500/30">
        <Target className={`${iconSizes[size]} mr-1`} />
        0 XP
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <Badge 
        className={`bg-amber-500/20 text-amber-400 border-amber-500/30 ${sizeClasses[size]} ${
          isAnimated ? 'animate-pulse' : ''
        }`}
      >
        <Zap className={`${iconSizes[size]} mr-1`} />
        +{xpEarned} XP
      </Badge>
      
      {showBreakdown && breakdown && (
        <Card className="bg-abyss-dark/20 border-abyss-teal/20">
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-abyss-ethereal/70">Base XP:</span>
                <span className="text-abyss-ethereal">{breakdown.baseXP}</span>
              </div>
              
              {breakdown.attemptMultiplier !== 1 && (
                <div className="flex justify-between">
                  <span className="text-abyss-ethereal/70">Attempt Bonus:</span>
                  <span className="text-abyss-ethereal">×{breakdown.attemptMultiplier.toFixed(1)}</span>
                </div>
              )}
              
              {breakdown.styleMultiplier !== 1 && (
                <div className="flex justify-between">
                  <span className="text-abyss-ethereal/70">Style Bonus:</span>
                  <span className="text-abyss-ethereal">×{breakdown.styleMultiplier.toFixed(1)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-abyss-teal/20 pt-2">
                <span className="text-abyss-amber font-medium">Total XP:</span>
                <span className="text-abyss-amber font-medium">{breakdown.totalXP}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SessionXPCounterProps {
  currentXP: number;
  totalProblems: number;
  completedProblems: number;
}

export function SessionXPCounter({ currentXP, totalProblems, completedProblems }: SessionXPCounterProps) {
  return (
    <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">
                {currentXP} XP
              </div>
              <div className="text-sm text-abyss-ethereal/70">
                Session Total
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-abyss-ethereal">
              {completedProblems}/{totalProblems}
            </div>
            <div className="text-sm text-abyss-ethereal/70">
              Completed
            </div>
          </div>
        </div>
        
        {completedProblems > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-abyss-ethereal/70">Avg XP per problem:</span>
              <span className="text-amber-400 font-medium">
                {Math.round(currentXP / completedProblems)} XP
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface XPGainAnimationProps {
  xpGained: number;
  onAnimationComplete?: () => void;
}

export function XPGainAnimation({ xpGained, onAnimationComplete }: XPGainAnimationProps) {
  if (xpGained === 0) return null;
  
  return (
    <div 
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce"
      onAnimationEnd={onAnimationComplete}
    >
      <div className="bg-amber-500/90 backdrop-blur-sm rounded-lg px-6 py-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Star className="h-6 w-6 text-white animate-spin" />
          <span className="text-xl font-bold text-white">
            +{xpGained} XP
          </span>
        </div>
      </div>
    </div>
  );
}

export default XPDisplay;