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
  const [activeView, setActiveView] = useState<'dashboard' | 'scan' | 'manual' | 'goals' | 'recommendations'>('dashboard');
  const [scanImage, setScanImage] = useState<string | null>(null);
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
                <CardTitle className="text-abyss-ethereal">Nanachi's Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-abyss-ethereal/90 mb-4">{nutritionAnalysis.nanachiInsights}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-abyss-ethereal">Recommendations:</h4>
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
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-16 w-16 mx-auto mb-4 text-abyss-teal" />
                  <p className="text-abyss-ethereal mb-4">Set your nutrition goals to get started!</p>
                  <Button className="abyss-button" onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Goal setting will be available soon!",
                    });
                  }}>
                    Set Goals
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations View */}
      {activeView === 'recommendations' && (
        <div className="space-y-4">
          {nutritionRecommendations?.map((rec: any) => (
            <Card key={rec.id} className="nature-card">
              <CardHeader>
                <CardTitle className="text-abyss-ethereal flex items-center gap-2">
                  <Badge variant="outline" className="text-abyss-amber">
                    Priority {rec.priority}
                  </Badge>
                  {rec.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-abyss-ethereal/90 mb-3">{rec.description}</p>
                {rec.nanachiPersonality && (
                  <div className="bg-abyss-dark/20 p-3 rounded-lg">
                    <p className="text-abyss-ethereal/80 italic">{rec.nanachiPersonality}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}