import { useLocation } from "wouter";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  const [, setLocation] = useLocation();
  const { activeSession } = useSession();

  return (
    <section className="px-6 mb-8 relative z-10">
      <div className="grid grid-cols-3 gap-4">
        <Button 
          onClick={() => setLocation("/session")}
          className="bg-abyss-purple/40 backdrop-blur-sm rounded-xl p-4 border border-abyss-teal/20 hover:bg-abyss-purple/60 transition-all duration-300 depth-layer relic-shimmer h-auto flex-col space-y-2"
          variant="ghost"
        >
          <i className="fas fa-mountain text-2xl text-abyss-amber"></i>
          <span className="text-sm text-abyss-ethereal font-medium">
            {activeSession ? "Continue Session" : "Start Session"}
          </span>
        </Button>
        
        <Button 
          onClick={() => setLocation("/quests")}
          className="bg-abyss-purple/40 backdrop-blur-sm rounded-xl p-4 border border-abyss-teal/20 hover:bg-abyss-purple/60 transition-all duration-300 depth-layer floating-animation h-auto flex-col space-y-2"
          variant="ghost"
        >
          <i className="fas fa-scroll text-2xl text-abyss-amber"></i>
          <span className="text-sm text-abyss-ethereal font-medium">Quests</span>
        </Button>
        
        <Button 
          onClick={() => setLocation("/progress")}
          className="bg-abyss-purple/40 backdrop-blur-sm rounded-xl p-4 border border-abyss-teal/20 hover:bg-abyss-purple/60 transition-all duration-300 depth-layer h-auto flex-col space-y-2"
          variant="ghost"
        >
          <i className="fas fa-chart-line text-2xl text-abyss-amber"></i>
          <span className="text-sm text-abyss-ethereal font-medium">Progress</span>
        </Button>
      </div>
    </section>
  );
}
