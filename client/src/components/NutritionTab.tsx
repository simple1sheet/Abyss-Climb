import React, { useState, useRef } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Utensils, Target, TrendingUp, Plus, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function NutritionTab() {
  const [activeView, setActiveView] = useState<'dashboard' | 'scan' | 'manual' | 'goals' | 'recommendations' | 'chat-goals'>('dashboard');
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [goalChatMessage, setGoalChatMessage] = useState('');
  const [goalChatHistory, setGoalChatHistory] = useState<Array<{type: 'user' | 'nanachi', message: string, timestamp: Date}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: nutritionSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/nutrition/summary"],
    enabled: !!user,
  });

  const { data: nutritionEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/nutrition/entries"],
    enabled: !!user,
  });

  const { data: nutritionGoal } = useQuery({
    queryKey: ["/api/nutrition/goal"],
    enabled: !!user,
  });

  const { data: nutritionRecommendations } = useQuery({
    queryKey: ["/api/nutrition/recommendations"],
    enabled: !!user,
  });

  const { data: nutritionAnalysis } = useQuery({
    queryKey: ["/api/nutrition/analysis"],
    enabled: !!user,
  });

  const { data: nutritionRecipes, isLoading: recipesLoading } = useQuery({
    queryKey: ["/api/nutrition/recipes"],
    enabled: !!user,
  });

  // Mutations
  const scanFoodMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      return await apiRequest("POST", "/api/nutrition/scan", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Food Scanned Successfully",
        description: `${data.foodName} - ${data.calories} calories`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition"] });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: "Failed to analyze food. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: any) => {
      return await apiRequest("POST", "/api/nutrition/entries", entry);
    },
    onSuccess: () => {
      toast({
        title: "Food Added",
        description: "Nutrition entry added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition"] });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goal: any) => {
      return await apiRequest("POST", "/api/nutrition/goals", goal);
    },
    onSuccess: () => {
      toast({
        title: "Goal Set",
        description: "Nutrition goal updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition"] });
    },
  });

  const chatGoalMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", "/api/nutrition/chat-goals", { message });
    },
    onSuccess: (data) => {
      setGoalChatHistory(prev => [...prev, 
        { type: 'nanachi', message: data.response, timestamp: new Date() }
      ]);
      setGoalChatMessage('');
      
      // If goals were updated, show notification and refresh data
      if (data.goalsUpdated) {
        toast({
          title: "Goals Updated!",
          description: "Nanachi has updated your nutrition goals based on your conversation.",
        });
        // Refresh nutrition data
        queryClient.invalidateQueries({ queryKey: ["/api/nutrition"] });
      }
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: "Failed to send message to Nanachi. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScanImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      scanFoodMutation.mutate(file);
    }
  };

  const MacroCard = ({ title, current, target, unit, color }: {
    title: string;
    current: number;
    target: number;
    unit: string;
    color: string;
  }) => {
    const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
    return (
      <Card className="nature-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-abyss-ethereal">{title}</h3>
            <Badge variant="outline" className={`${color} border-current`}>
              {percentage}%
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{current}{unit}</span>
              <span>{target}{unit}</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeView === 'dashboard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('dashboard')}
          className="abyss-button"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Dashboard
        </Button>
        <Button
          variant={activeView === 'scan' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('scan')}
          className="abyss-button"
        >
          <Camera className="h-4 w-4 mr-1" />
          Scan Food
        </Button>
        <Button
          variant={activeView === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('manual')}
          className="abyss-button"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Manual
        </Button>
        <Button
          variant={activeView === 'goals' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('goals')}
          className="abyss-button"
        >
          <Target className="h-4 w-4 mr-1" />
          Goals
        </Button>
        <Button
          variant={activeView === 'chat-goals' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('chat-goals')}
          className="abyss-button"
        >
          <Camera className="h-4 w-4 mr-1" />
          Chat Goals
        </Button>
        <Button
          variant={activeView === 'recommendations' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('recommendations')}
          className="abyss-button"
        >
          <Utensils className="h-4 w-4 mr-1" />
          Nanachi Tips
        </Button>
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="space-y-4">
          {/* Daily Progress */}
          {nutritionAnalysis && (
            <div className="grid grid-cols-2 gap-4">
              <MacroCard
                title="Calories"
                current={nutritionAnalysis.dailyProgress.calories.current}
                target={nutritionAnalysis.dailyProgress.calories.target}
                unit=" cal"
                color="text-orange-500"
              />
              <MacroCard
                title="Protein"
                current={nutritionAnalysis.dailyProgress.protein.current}
                target={nutritionAnalysis.dailyProgress.protein.target}
                unit="g"
                color="text-blue-500"
              />
              <MacroCard
                title="Carbs"
                current={nutritionAnalysis.dailyProgress.carbs.current}
                target={nutritionAnalysis.dailyProgress.carbs.target}
                unit="g"
                color="text-green-500"
              />
              <MacroCard
                title="Fat"
                current={nutritionAnalysis.dailyProgress.fat.current}
                target={nutritionAnalysis.dailyProgress.fat.target}
                unit="g"
                color="text-purple-500"
              />
            </div>
          )}

          {/* Nanachi Insights */}
          {nutritionAnalysis && (
            <Card className="nature-card">
              <CardHeader>
                <CardTitle className="text-abyss-ethereal">Nanachi's Personalized Insights</CardTitle>
                <p className="text-sm text-abyss-ethereal/70">
                  Based on your climbing performance and nutrition goals
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-abyss-purple/20 p-4 rounded-lg mb-4">
                  <p className="text-abyss-ethereal/90 italic">{nutritionAnalysis.nanachiInsights}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-abyss-ethereal flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Personal Recommendations:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-abyss-ethereal/80">
                    {nutritionAnalysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          {entriesLoading ? (
            <LoadingSpinner />
          ) : (
            <Card className="nature-card">
              <CardHeader>
                <CardTitle className="text-abyss-ethereal">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nutritionEntries?.slice(0, 5).map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-abyss-dark/20 rounded-lg">
                      <div>
                        <p className="font-medium text-abyss-ethereal">{entry.foodName}</p>
                        <p className="text-sm text-abyss-ethereal/70">{entry.mealType} • {entry.servingSize}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-abyss-amber">{entry.calories} cal</p>
                        <p className="text-xs text-abyss-ethereal/70">{entry.protein}g protein</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Scan Food View */}
      {activeView === 'scan' && (
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal">Scan Food with Nanachi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div 
                  className="border-2 border-dashed border-abyss-teal/50 rounded-lg p-8 cursor-pointer hover:border-abyss-teal transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {scanImage ? (
                    <img src={scanImage} alt="Scanned food" className="max-w-full max-h-64 mx-auto rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 text-abyss-teal" />
                      <p className="text-abyss-ethereal">Tap to take a photo or upload an image</p>
                      <p className="text-sm text-abyss-ethereal/70 mt-2">
                        Nanachi will analyze the food and provide nutrition information, naa!
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {scanFoodMutation.isPending && (
                <div className="text-center py-4">
                  <LoadingSpinner />
                  <p className="text-abyss-ethereal mt-2">Nanachi is analyzing your food...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry View */}
      {activeView === 'manual' && (
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal">Add Food Manually</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="foodName">Food Name</Label>
                  <Input id="foodName" placeholder="e.g., Banana" />
                </div>
                <div>
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input id="servingSize" placeholder="e.g., 1 medium" />
                </div>
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input id="calories" type="number" placeholder="e.g., 105" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input id="protein" type="number" placeholder="e.g., 1.3" />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input id="carbs" type="number" placeholder="e.g., 27" />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input id="fat" type="number" placeholder="e.g., 0.4" />
                </div>
              </div>
              
              <Button className="w-full abyss-button" onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Manual entry will be available soon!",
                });
              }}>
                Add Food Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals View */}
      {activeView === 'goals' && (
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal">Nutrition Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nutritionGoal ? (
                <div className="space-y-3">
                  <p className="text-abyss-ethereal">
                    <strong>Current Goal:</strong> {nutritionGoal.goalType}
                  </p>
                  <p className="text-abyss-ethereal">
                    <strong>Activity Level:</strong> {nutritionGoal.activityLevel}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Daily Calories</Label>
                      <p className="text-lg font-semibold text-abyss-amber">{nutritionGoal.dailyCalories}</p>
                    </div>
                    <div>
                      <Label>Daily Protein</Label>
                      <p className="text-lg font-semibold text-abyss-amber">{nutritionGoal.dailyProtein}g</p>
                    </div>
                    <div>
                      <Label>Daily Carbs</Label>
                      <p className="text-lg font-semibold text-abyss-amber">{nutritionGoal.dailyCarbs}g</p>
                    </div>
                    <div>
                      <Label>Daily Fat</Label>
                      <p className="text-lg font-semibold text-abyss-amber">{nutritionGoal.dailyFat}g</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      className="abyss-button w-full" 
                      onClick={() => setActiveView('chat-goals')}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Chat with Nanachi about Goals
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-16 w-16 mx-auto mb-4 text-abyss-teal" />
                  <p className="text-abyss-ethereal mb-4">Set your nutrition goals to get started!</p>
                  <Button 
                    className="abyss-button" 
                    onClick={() => setActiveView('chat-goals')}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Chat with Nanachi about Goals
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Goals View */}
      {activeView === 'chat-goals' && (
        <Card className="nature-card">
          <CardHeader>
            <CardTitle className="text-abyss-ethereal">Chat with Nanachi about Goals</CardTitle>
            <p className="text-sm text-abyss-ethereal/70">
              Tell Nanachi about your nutrition goals, dietary preferences, and climbing objectives. She'll help create a personalized plan!
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chat History */}
              <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-abyss-dark/20 rounded-lg">
                {goalChatHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <Camera className="h-12 w-12 mx-auto mb-3 text-abyss-teal" />
                    <p className="text-abyss-ethereal/70">Start a conversation with Nanachi!</p>
                    <p className="text-sm text-abyss-ethereal/50 mt-2">
                      Ask about nutrition goals, dietary advice, or climbing performance optimization.
                    </p>
                  </div>
                ) : (
                  goalChatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-abyss-teal text-abyss-dark' 
                          : 'bg-abyss-purple/30 text-abyss-ethereal'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="flex space-x-2">
                <Input
                  value={goalChatMessage}
                  onChange={(e) => setGoalChatMessage(e.target.value)}
                  placeholder="Tell Nanachi about your nutrition goals..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !chatGoalMutation.isPending && goalChatMessage.trim()) {
                      setGoalChatHistory(prev => [...prev, 
                        { type: 'user', message: goalChatMessage, timestamp: new Date() }
                      ]);
                      chatGoalMutation.mutate(goalChatMessage);
                    }
                  }}
                />
                <Button 
                  onClick={() => {
                    if (goalChatMessage.trim()) {
                      setGoalChatHistory(prev => [...prev, 
                        { type: 'user', message: goalChatMessage, timestamp: new Date() }
                      ]);
                      chatGoalMutation.mutate(goalChatMessage);
                    }
                  }}
                  disabled={chatGoalMutation.isPending || !goalChatMessage.trim()}
                  className="abyss-button"
                >
                  {chatGoalMutation.isPending ? (
                    <LoadingSpinner />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Quick Start Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const msg = "I want to optimize my nutrition for climbing performance";
                    setGoalChatMessage(msg);
                    setGoalChatHistory(prev => [...prev, 
                      { type: 'user', message: msg, timestamp: new Date() }
                    ]);
                    chatGoalMutation.mutate(msg);
                  }}
                  className="text-xs"
                >
                  Climbing Performance
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const msg = "Help me set up my daily nutrition goals";
                    setGoalChatMessage(msg);
                    setGoalChatHistory(prev => [...prev, 
                      { type: 'user', message: msg, timestamp: new Date() }
                    ]);
                    chatGoalMutation.mutate(msg);
                  }}
                  className="text-xs"
                >
                  Daily Goals
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const msg = "What should I eat before and after climbing?";
                    setGoalChatMessage(msg);
                    setGoalChatHistory(prev => [...prev, 
                      { type: 'user', message: msg, timestamp: new Date() }
                    ]);
                    chatGoalMutation.mutate(msg);
                  }}
                  className="text-xs"
                >
                  Pre/Post Workout
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const msg = "I have dietary restrictions, can you help?";
                    setGoalChatMessage(msg);
                    setGoalChatHistory(prev => [...prev, 
                      { type: 'user', message: msg, timestamp: new Date() }
                    ]);
                    chatGoalMutation.mutate(msg);
                  }}
                  className="text-xs"
                >
                  Dietary Restrictions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations View */}
      {activeView === 'recommendations' && (
        <div className="space-y-4">
          {recipesLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-abyss-ethereal mt-2">Nanachi is preparing personalized recipes...</p>
            </div>
          ) : nutritionRecipes && nutritionRecipes.recipes && nutritionRecipes.recipes.length > 0 ? (
            nutritionRecipes.recipes.map((recipe: any, index: number) => (
              <Card key={index} className="nature-card">
                <CardHeader>
                  <CardTitle className="text-abyss-ethereal flex items-center gap-2">
                    <Badge variant="outline" className="text-abyss-amber">
                      {recipe.mealType}
                    </Badge>
                    {recipe.name}
                  </CardTitle>
                  <div className="text-sm text-abyss-ethereal/60">
                    Prep time: {recipe.prepTime} • {recipe.nutritionInfo.calories} calories
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-abyss-ethereal/90 mb-3">{recipe.description}</p>
                  
                  {/* Nutrition Info */}
                  <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-abyss-dark/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-abyss-amber font-bold text-lg">{recipe.nutritionInfo.calories}</div>
                      <div className="text-abyss-ethereal/60 text-xs">calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-abyss-amber font-bold text-lg">{recipe.nutritionInfo.protein}g</div>
                      <div className="text-abyss-ethereal/60 text-xs">protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-abyss-amber font-bold text-lg">{recipe.nutritionInfo.carbs}g</div>
                      <div className="text-abyss-ethereal/60 text-xs">carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-abyss-amber font-bold text-lg">{recipe.nutritionInfo.fat}g</div>
                      <div className="text-abyss-ethereal/60 text-xs">fat</div>
                    </div>
                  </div>

                  {/* Climbing Benefit */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-abyss-ethereal text-sm mb-1">Climbing Benefits:</h4>
                    <p className="text-abyss-ethereal/80 text-sm">{recipe.climbingBenefit}</p>
                  </div>

                  {/* Nanachi's Tip */}
                  <div className="bg-abyss-purple/20 p-3 rounded-lg">
                    <h4 className="font-semibold text-abyss-ethereal text-sm mb-1">Nanachi's Tip:</h4>
                    <p className="text-abyss-ethereal/80 text-sm italic">{recipe.nanachiTip}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Utensils className="h-16 w-16 mx-auto mb-4 text-abyss-teal" />
              <p className="text-abyss-ethereal mb-4">No personalized recipes yet!</p>
              <p className="text-abyss-ethereal/70 mb-4 text-sm">
                Set up your nutrition goals and track some meals to get personalized recipes from Nanachi!
              </p>
              <Button 
                className="abyss-button" 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/nutrition/recipes"] });
                }}
              >
                Generate Recipes
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}