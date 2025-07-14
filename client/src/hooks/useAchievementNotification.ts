import { useToast } from "@/hooks/use-toast";
import { Achievement } from "@shared/schema";

export function useAchievementNotification() {
  const { toast } = useToast();

  const showAchievementNotification = (achievement: Achievement) => {
    toast({
      title: "🏆 Achievement Unlocked!",
      description: `${achievement.title} - ${achievement.description} (+${achievement.xpReward} XP)`,
      duration: 6000,
      variant: "default",
    });
  };

  const showMultipleAchievementNotifications = (achievements: Achievement[]) => {
    if (achievements.length === 1) {
      showAchievementNotification(achievements[0]);
    } else {
      const totalXP = achievements.reduce((sum, ach) => sum + ach.xpReward, 0);
      toast({
        title: `🏆 ${achievements.length} Achievements Unlocked!`,
        description: `${achievements.map(a => a.title).join(", ")} (+${totalXP} XP total)`,
        duration: 8000,
        variant: "default",
      });
    }
  };

  return { showAchievementNotification, showMultipleAchievementNotifications };
}