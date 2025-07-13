import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CLIMBING_SKILL_TREE, type SkillCategory } from "@shared/skillTree";
import { type Skill } from "@shared/schema";

interface SkillTreeProps {
  className?: string;
}

export default function SkillTree({ className }: SkillTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
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
    if (level >= 8) return "bg-purple-500";
    if (level >= 6) return "bg-blue-500";
    if (level >= 4) return "bg-green-500";
    if (level >= 2) return "bg-yellow-500";
    return "bg-gray-500";
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
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Climbing Skill Tree</h2>
        <p className="text-muted-foreground">
          Develop your climbing abilities across six core categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLIMBING_SKILL_TREE.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const progress = getCategoryProgress(category);
          
          return (
            <Card key={category.id} className="overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {category.subcategories.map((subcategory) => {
                        const subcategorySkills = getSkillsForCategory(category.id, subcategory.id);
                        const avgLevel = subcategorySkills.length > 0 
                          ? subcategorySkills.reduce((sum, skill) => sum + (skill.level || 1), 0) / subcategorySkills.length
                          : 1;
                        
                        return (
                          <div key={subcategory.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{subcategory.name}</h4>
                              <Badge 
                                variant="secondary" 
                                className={`text-white ${getSkillLevelColor(Math.round(avgLevel))}`}
                              >
                                Lvl {Math.round(avgLevel)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              {subcategory.description}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {subcategory.skillTypes.slice(0, 4).map((skillType) => {
                                const skill = subcategorySkills.find(s => s.skillType === skillType);
                                return (
                                  <div key={skillType} className="text-xs p-2 bg-muted rounded">
                                    <div className="font-medium capitalize">
                                      {skillType.replace(/_/g, ' ')}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {skill ? `${skill.maxGrade} (${skill.totalProblems})` : 'V0 (0)'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {subcategory.skillTypes.length > 4 && (
                              <div className="text-xs text-muted-foreground mt-2">
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
  );
}