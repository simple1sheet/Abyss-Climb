import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight, TrendingUp, Target, Star, Award, Zap, Trophy, Brain } from "lucide-react";
import { CLIMBING_SKILL_TREE, type SkillCategory } from "@shared/skillTree";
import { type Skill } from "@shared/schema";
import { useGradeSystem } from "@/hooks/useGradeSystem";
import { gradeConverter } from "@/utils/gradeConverter";

interface SkillTreeProps {
  className?: string;
}

export default function SkillTree({ className }: SkillTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const { gradeSystem } = useGradeSystem();
  
  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getSkillsForCategory = (categoryId: string, subcategoryId: string): Skill[] => {
    if (!skills) return [];
    return skills.filter(skill => 
      skill.mainCategory === categoryId && skill.subCategory === subcategoryId
    );
  };

  const getCategoryProgress = (category: SkillCategory): number => {
    if (!skills) return 0;
    const categorySkills = skills.filter(skill => skill.mainCategory === category.id);
    if (categorySkills.length === 0) return 0;
    
    const totalXP = categorySkills.reduce((sum, skill) => sum + (skill.xp || 0), 0);
    const totalProblems = categorySkills.reduce((sum, skill) => sum + (skill.totalProblems || 0), 0);
    return Math.min(100, Math.round((totalXP / 1000) * 100));
  };

  const getSkillLevelColor = (level: number): string => {
    if (level >= 8) return "bg-purple-500/80 text-purple-100 border-purple-400";
    if (level >= 6) return "bg-blue-500/80 text-blue-100 border-blue-400";
    if (level >= 4) return "bg-green-500/80 text-green-100 border-green-400";
    if (level >= 2) return "bg-yellow-500/80 text-yellow-100 border-yellow-400";
    return "bg-gray-500/80 text-gray-100 border-gray-400";
  };

  const getSkillIcon = (level: number) => {
    if (level >= 8) return Star;
    if (level >= 6) return Award;
    if (level >= 4) return TrendingUp;
    return Target;
  };

  const getSkillProgressPercent = (skill: Skill): number => {
    const xp = skill.xp || 0;
    const level = skill.level || 1;
    const currentLevelXP = (level - 1) * 100;
    const nextLevelXP = level * 100;
    return Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse mt-2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`space-y-4 sm:space-y-6 ${className}`}>
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-abyss-ethereal">Climbing Skills</h2>
          <p className="text-sm sm:text-base text-abyss-ethereal/70">
            Develop your climbing abilities across six core categories
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
        {CLIMBING_SKILL_TREE.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const progress = getCategoryProgress(category);
          
          return (
            <Card key={category.id} className="mx-2 sm:mx-0 overflow-hidden bg-abyss-purple/20 border-abyss-teal/20 hover:bg-abyss-purple/30 transition-all duration-300 hover:shadow-lg hover:shadow-abyss-teal/10">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader 
                    className="cursor-pointer hover:bg-abyss-dark/20 transition-all duration-300 relative overflow-hidden p-4 sm:p-6"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-abyss-teal/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Mobile-first header layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 space-y-3 sm:space-y-0">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg hover:scale-105 transition-transform duration-200 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg text-abyss-ethereal leading-tight">{category.name}</CardTitle>
                          <CardDescription className="text-sm text-abyss-ethereal/70 mt-1 line-clamp-2">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2">
                        <Badge variant="outline" className="text-abyss-ethereal border-abyss-teal/30 text-sm px-2 py-1">
                          {progress}%
                        </Badge>
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-abyss-ethereal flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-abyss-ethereal flex-shrink-0" />}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4 relative z-10">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-abyss-ethereal/80">Progress</span>
                        <span className="text-abyss-amber font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 sm:h-3 bg-abyss-dark/30" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
                    <div className="space-y-4 sm:space-y-6">
                      {category.subcategories.map((subcategory) => {
                        const subcategorySkills = getSkillsForCategory(category.id, subcategory.id);
                        const avgLevel = subcategorySkills.length > 0 
                          ? subcategorySkills.reduce((sum, skill) => sum + (skill.level || 1), 0) / subcategorySkills.length
                          : 1;
                        const SkillIcon = getSkillIcon(Math.round(avgLevel));
                        
                        return (
                          <div key={subcategory.id} className="border border-abyss-teal/20 rounded-lg p-4 sm:p-5 bg-abyss-dark/20 hover:bg-abyss-dark/30 transition-colors duration-200">
                            {/* Subcategory header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <SkillIcon className="w-5 h-5 text-abyss-amber flex-shrink-0" />
                                <h4 className="font-medium text-sm sm:text-base text-abyss-ethereal">{subcategory.name}</h4>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={`text-white border ${getSkillLevelColor(Math.round(avgLevel))} self-start sm:self-center`}
                              >
                                Level {Math.round(avgLevel)}
                              </Badge>
                            </div>
                            
                            <p className="text-xs sm:text-sm text-abyss-ethereal/70 mb-4 leading-relaxed">
                              {subcategory.description}
                            </p>
                            
                            {/* Skills grid - single column on mobile for better readability */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {subcategory.skillTypes.slice(0, 4).map((skillType) => {
                                const skill = subcategorySkills.find(s => s.skillType === skillType);
                                const skillKey = `${category.id}-${subcategory.id}-${skillType}`;
                                const isSelected = selectedSkill === skillKey;
                                
                                return (
                                  <Tooltip key={skillType}>
                                    <TooltipTrigger asChild>
                                      <div 
                                        onClick={() => setSelectedSkill(isSelected ? null : skillKey)}
                                        className={`p-4 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 min-h-[80px] sm:min-h-[70px] ${
                                          isSelected 
                                            ? 'bg-abyss-teal/20 border-abyss-teal/50 border scale-105' 
                                            : 'bg-abyss-dark/40 hover:bg-abyss-dark/60 border border-abyss-teal/10'
                                        }`}
                                      >
                                        <div className="font-medium capitalize text-abyss-ethereal text-sm sm:text-xs mb-1 leading-tight">
                                          {skillType.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-abyss-ethereal/70 text-sm sm:text-xs mb-2">
                                          {skill ? `${gradeConverter.convertGrade(skill.maxGrade, 'V-Scale', gradeSystem)} (${skill.totalProblems})` : 'V0 (0)'}
                                        </div>
                                        {skill && (
                                          <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-abyss-ethereal/60 mb-1">
                                              <span>Level {skill.level || 1}</span>
                                              <span>{skill.xp || 0} XP</span>
                                            </div>
                                            <Progress value={getSkillProgressPercent(skill)} className="h-1.5 bg-abyss-dark/50" />
                                          </div>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-sm">
                                        {skill 
                                          ? `Level ${skill.level || 1} • ${skill.totalProblems} problems completed`
                                          : 'Complete climbing problems to develop this skill'
                                        }
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                            
                            {subcategory.skillTypes.length > 4 && (
                              <div className="text-xs text-abyss-ethereal/60 mt-3 text-center">
                                +{subcategory.skillTypes.length - 4} more skills available
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
    </TooltipProvider>
  );
}