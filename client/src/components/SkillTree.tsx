import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight, TrendingUp, Target, Star, Award } from "lucide-react";
import { CLIMBING_SKILL_TREE, type SkillCategory } from "@shared/skillTree";
import { type Skill } from "@shared/schema";

interface SkillTreeProps {
  className?: string;
}

export default function SkillTree({ className }: SkillTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
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
    
    const totalLevel = categorySkills.reduce((sum, skill) => sum + (skill.level || 1), 0);
    const maxLevel = categorySkills.length * 10;
    return Math.round((totalLevel / maxLevel) * 100);
  };

  const getSkillLevelColor = (level: number): string => {
    if (level >= 8) return "bg-purple-500 border-purple-300";
    if (level >= 6) return "bg-blue-500 border-blue-300";
    if (level >= 4) return "bg-green-500 border-green-300";
    if (level >= 2) return "bg-yellow-500 border-yellow-300";
    return "bg-gray-500 border-gray-300";
  };

  const getSkillIcon = (level: number) => {
    if (level >= 8) return Star;
    if (level >= 6) return Award;
    if (level >= 4) return TrendingUp;
    return Target;
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
      <div className={`space-y-6 ${className}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-abyss-ethereal">Climbing Skill Tree</h2>
          <p className="text-abyss-ethereal/70">
            Develop your climbing abilities across six core categories
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CLIMBING_SKILL_TREE.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const progress = getCategoryProgress(category);
          
          return (
            <Card key={category.id} className="overflow-hidden bg-abyss-purple/20 border-abyss-teal/20 hover:bg-abyss-purple/30 transition-all duration-300 hover:shadow-lg hover:shadow-abyss-teal/10">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader 
                    className="cursor-pointer hover:bg-abyss-dark/20 transition-all duration-300 relative overflow-hidden"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-abyss-teal/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-abyss-ethereal">{category.name}</CardTitle>
                          <CardDescription className="text-sm text-abyss-ethereal/70">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-abyss-ethereal border-abyss-teal/30">
                          {progress}%
                        </Badge>
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-abyss-ethereal" /> : <ChevronRight className="w-5 h-5 text-abyss-ethereal" />}
                      </div>
                    </div>
                    <div className="mt-4 relative z-10">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-abyss-ethereal/80">Overall Progress</span>
                        <span className="text-abyss-amber font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-abyss-dark/30" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-6 pb-6">
                    <div className="space-y-6">
                      {category.subcategories.map((subcategory) => {
                        const subcategorySkills = getSkillsForCategory(category.id, subcategory.id);
                        const avgLevel = subcategorySkills.length > 0 
                          ? subcategorySkills.reduce((sum, skill) => sum + (skill.level || 1), 0) / subcategorySkills.length
                          : 1;
                        const SkillIcon = getSkillIcon(Math.round(avgLevel));
                        
                        return (
                          <div key={subcategory.id} className="border border-abyss-teal/20 rounded-lg p-4 bg-abyss-dark/20 hover:bg-abyss-dark/30 transition-colors duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <SkillIcon className="w-4 h-4 text-abyss-amber" />
                                <h4 className="font-medium text-sm text-abyss-ethereal">{subcategory.name}</h4>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={`text-white border ${getSkillLevelColor(Math.round(avgLevel))}`}
                              >
                                Lvl {Math.round(avgLevel)}
                              </Badge>
                            </div>
                            <p className="text-xs text-abyss-ethereal/70 mb-4">
                              {subcategory.description}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {subcategory.skillTypes.slice(0, 4).map((skillType) => {
                                const skill = subcategorySkills.find(s => s.skillType === skillType);
                                const skillKey = `${category.id}-${subcategory.id}-${skillType}`;
                                const isSelected = selectedSkill === skillKey;
                                
                                return (
                                  <Tooltip key={skillType}>
                                    <TooltipTrigger asChild>
                                      <div 
                                        onClick={() => setSelectedSkill(isSelected ? null : skillKey)}
                                        className={`text-xs p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                          isSelected 
                                            ? 'bg-abyss-teal/20 border-abyss-teal/50 border scale-105' 
                                            : 'bg-abyss-dark/40 hover:bg-abyss-dark/60 border border-abyss-teal/10'
                                        }`}
                                      >
                                        <div className="font-medium capitalize text-abyss-ethereal">
                                          {skillType.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-abyss-ethereal/70 mt-1">
                                          {skill ? `${skill.maxGrade} (${skill.totalProblems})` : 'V0 (0)'}
                                        </div>
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
                                +{subcategory.skillTypes.length - 4} more skills
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