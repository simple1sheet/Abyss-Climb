import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="max-w-md mx-auto bg-abyss-gradient min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-abyss-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-abyss-teal rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-abyss-amber rounded-full flex items-center justify-center mx-auto mb-6 abyss-glow">
            <i className="fas fa-mountain text-4xl text-abyss-dark"></i>
          </div>
          <h1 className="text-4xl font-bold text-abyss-ethereal mb-4">
            Abyss Climber
          </h1>
          <p className="text-lg text-abyss-ethereal/80 mb-2">
            Descend into the depths of your climbing potential
          </p>
          <p className="text-sm text-abyss-ethereal/60">
            Track your progress through the seven layers of the Abyss
          </p>
        </div>

        <Card className="w-full max-w-sm bg-abyss-purple/30 backdrop-blur-sm border-abyss-teal/20 depth-layer">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-abyss-ethereal">
                  Begin Your Journey
                </h3>
                <p className="text-sm text-abyss-ethereal/70">
                  Join the ranks of cave raiders and track your climbing adventures
                </p>
              </div>
              
              <Button 
                className="w-full bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold py-3 abyss-glow"
                onClick={() => window.location.href = '/api/login'}
              >
                Enter the Abyss
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-abyss-purple/20 rounded-xl p-4">
              <i className="fas fa-scroll text-2xl text-abyss-amber mb-2"></i>
              <p className="text-xs text-abyss-ethereal/80">AI-Powered Quests</p>
            </div>
            <div className="bg-abyss-purple/20 rounded-xl p-4">
              <i className="fas fa-award text-2xl text-abyss-amber mb-2"></i>
              <p className="text-xs text-abyss-ethereal/80">Whistle Progression</p>
            </div>
            <div className="bg-abyss-purple/20 rounded-xl p-4">
              <i className="fas fa-chart-line text-2xl text-abyss-amber mb-2"></i>
              <p className="text-xs text-abyss-ethereal/80">Progress Tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 right-4 w-4 h-4 bg-abyss-amber/20 rounded-full blur-sm floating-animation" style={{animationDelay: '0.5s'}}></div>
      <div className="fixed top-40 left-4 w-3 h-3 bg-abyss-teal/30 rounded-full blur-sm floating-animation" style={{animationDelay: '1s'}}></div>
      <div className="fixed bottom-40 right-8 w-5 h-5 bg-abyss-purple/20 rounded-full blur-sm floating-animation" style={{animationDelay: '1.5s'}}></div>
    </div>
  );
}
