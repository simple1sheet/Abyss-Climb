import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Lightbulb, Target } from "lucide-react";

interface CoachFeedbackProps {
  type: "session" | "quest" | "skills";
  data: any;
  triggerText?: string;
}

export default function CoachFeedback({ type, data, triggerText = "Get Coach Feedback" }: CoachFeedbackProps) {
  const [feedback, setFeedback] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const getFeedbackMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/coach/feedback", {
        type,
        data,
      });
      return response.json();
    },
    onSuccess: (result) => {
      setFeedback(result);
      setShowFeedback(true);
    },
  });

  if (showFeedback && feedback) {
    return (
      <Card className="dark:bg-gray-800 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-500" />
            AI Coach Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <Badge variant="outline">Performance Analysis</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <Badge variant="outline">Encouragement</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{feedback.encouragement}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <Badge variant="outline">Next Steps</Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {feedback.nextSteps.map((step: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFeedback(false)}
            className="w-full"
          >
            Close Feedback
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={() => getFeedbackMutation.mutate()}
      disabled={getFeedbackMutation.isPending}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {getFeedbackMutation.isPending ? "Getting Feedback..." : triggerText}
    </Button>
  );
}