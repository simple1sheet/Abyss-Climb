import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  return (
    <section className="px-6 mb-8 relative z-10">
      <div className="grid grid-cols-3 gap-4">
        <button 
          onClick={() => setLocation("/session/new")}
          className="bg-abyss-purple/40 backdrop-blur-sm rounded-xl p-4 border border-abyss-teal/20 hover:bg-abyss-purple/60 transition-all duration-300 depth-layer relic-shimmer"
        >
          <div className="text-center">
            <i className="fas fa-mountain text-2xl text-abyss-amber mb-2"></i>
            <p className="text-sm text-abyss-ethereal font-medium">Start Session</p>
          </div>
        </button>
        
        <button 
          onClick={() => setLocation("/quests")}
          className="bg-abyss-purple/40 backdrop-blur-sm rounded-xl p-4 border border-abyss-teal/20 hover:bg-abyss-purple/60 transition-all duration-300 depth-layer floating-animation"
        >
          <div className="text-center">
            <i className="fas fa-scroll text-2xl text-abyss-amber mb-2"></i>
            <p className="text-sm text-abyss-ethereal font-medium">Quests</p>
          </div>
        </button>
        
        <button 
          onClick={() => setLocation("/progress")}
          className="bg-abyss-purple/40 backdrop-blur-sm rounded-xl p-4 border border-abyss-teal/20 hover:bg-abyss-purple/60 transition-all duration-300 depth-layer"
        >
          <div className="text-center">
            <i className="fas fa-chart-line text-2xl text-abyss-amber mb-2"></i>
            <p className="text-sm text-abyss-ethereal font-medium">Progress</p>
          </div>
        </button>
      </div>
    </section>
  );
}
