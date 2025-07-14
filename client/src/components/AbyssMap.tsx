import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, Eye, Compass } from "lucide-react";
import { getLayerInfo } from "@/utils/layerConfig";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import abyssSvg from "@assets/tree-of-skills-slide1_1752449787949.png";

export default function AbyssMap() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: layerProgress } = useQuery({
    queryKey: ["/api/layer-progress"],
    enabled: !!user,
  });

  const currentLayer = layerProgress?.currentLayer || 1;
  const currentXP = layerProgress?.currentXP || 0;

  const layers = [
    {
      id: 1,
      name: "Edge of Abyss",
      description: "The entrance to the great pit. Sunlight still reaches here, and the curse is barely noticeable.",
      depth: "0-1,350m",
      curse: "Light dizziness and nausea",
      xpRequired: 0,
      color: "from-amber-400 to-orange-500",
      position: "top-[5%]"
    },
    {
      id: 2,
      name: "Forest of Temptation",
      description: "A lush forest where the Abyss begins to show its true nature. Ancient trees hide mysterious creatures.",
      depth: "1,350-2,600m",
      curse: "Heavy nausea, headaches, and numbness in limbs",
      xpRequired: 800,
      color: "from-green-400 to-emerald-600",
      position: "top-[15%]"
    },
    {
      id: 3,
      name: "Great Fault",
      description: "A massive vertical cliff that tests every explorer's resolve. The point of no return approaches.",
      depth: "2,600-7,000m",
      curse: "Vertigo, hallucinations, and severe disorientation",
      xpRequired: 2500,
      color: "from-blue-400 to-cyan-600",
      position: "top-[30%]"
    },
    {
      id: 4,
      name: "Goblets of Giants",
      description: "Colossal cup-shaped structures dominate this layer. The curse grows stronger with each step down.",
      depth: "7,000-12,000m",
      curse: "Intense pain throughout the body",
      xpRequired: 5500,
      color: "from-purple-400 to-violet-600",
      position: "top-[45%]"
    },
    {
      id: 5,
      name: "Sea of Corpses",
      description: "A crystalline sea where the boundary between life and death blurs. Only the strongest survive.",
      depth: "12,000-13,000m",
      curse: "Complete sensory confusion, loss of consciousness",
      xpRequired: 10000,
      color: "from-teal-400 to-cyan-700",
      position: "top-[60%]"
    },
    {
      id: 6,
      name: "Capital of Unreturned",
      description: "The ruins of an ancient civilization. Here, the curse of the Abyss becomes truly lethal.",
      depth: "13,000-15,500m",
      curse: "Severe mutations or death",
      xpRequired: 18000,
      color: "from-red-400 to-rose-600",
      position: "top-[75%]"
    },
    {
      id: 7,
      name: "Final Maelstrom",
      description: "The deepest known layer. A realm of pure mystery where reality itself seems to bend.",
      depth: "15,500m+",
      curse: "Certain death or transformation",
      xpRequired: 35000,
      color: "from-indigo-400 to-purple-800",
      position: "top-[90%]"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-abyss-dark via-slate-900 to-abyss-purple relative overflow-hidden">
      {/* Mystical Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      {/* Floating Particles */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-abyss-amber/30 rounded-full blur-sm floating-animation" />
      <div className="absolute top-60 right-20 w-3 h-3 bg-abyss-teal/20 rounded-full blur-sm floating-animation" style={{animationDelay: '2s'}} />
      <div className="absolute bottom-40 left-16 w-1 h-1 bg-abyss-purple/40 rounded-full blur-sm floating-animation" style={{animationDelay: '4s'}} />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-abyss-ethereal hover:bg-abyss-teal/10 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:text-abyss-amber transition-colors" />
              Return to Surface
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-abyss-ethereal mystical-glow">The Abyss</h1>
              <p className="text-abyss-muted flex items-center">
                <Compass className="w-4 h-4 mr-2 text-abyss-amber relic-glow" />
                Current Depth: Layer {currentLayer} • {currentXP.toLocaleString()} XP
              </p>
              <div className="mt-1 text-xs text-abyss-amber/60 italic">
                "The Abyss is a place of mystery and wonder, where relics of the past await discovery"
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-abyss-amber">
            <Eye className="w-5 h-5" />
            <span className="text-sm">Explorer's View</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="bg-abyss-purple/10 backdrop-blur-sm border-abyss-teal/20 relative overflow-hidden abyss-shimmer">
              <CardContent className="p-8">
                <div className="relative w-full h-[600px] bg-gradient-to-b from-amber-100 via-slate-200 to-slate-800 rounded-lg overflow-hidden relic-shimmer">
                  {/* Map Background */}
                  <img
                    src={abyssSvg}
                    alt="Map of the Abyss"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 curse-distortion"
                  />
                  
                  {/* Layer Markers */}
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`absolute left-1/2 transform -translate-x-1/2 ${layer.position} group cursor-pointer`}
                      onClick={() => setLocation(`/layer/${layer.id}`)}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${layer.color} ${
                        layer.id <= currentLayer ? 'ring-4 ring-abyss-amber/50' : 'opacity-50'
                      } shadow-lg group-hover:scale-125 transition-transform`} />
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-abyss-dark/90 text-abyss-ethereal px-3 py-1 rounded text-sm whitespace-nowrap">
                          {layer.name}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Current Position Indicator */}
                  <div className={`absolute left-1/2 transform -translate-x-1/2 ${layers[currentLayer - 1]?.position} animate-pulse`}>
                    <div className="w-6 h-6 bg-abyss-amber rounded-full ring-4 ring-abyss-amber/30 animate-ping" />
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-abyss-muted text-sm italic">
                    "The Abyss... it calls to those who dare to explore its depths."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Layer Details */}
          <div className="space-y-6">
            <Card className="bg-abyss-purple/10 backdrop-blur-sm border-abyss-teal/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-abyss-ethereal mb-4 flex items-center">
                  <ChevronDown className="w-5 h-5 mr-2 text-abyss-amber" />
                  Layer Details
                </h2>
                
                <div className="space-y-4">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer hover:bg-abyss-teal/5 ${
                        layer.id === currentLayer
                          ? 'border-abyss-amber bg-abyss-amber/10'
                          : layer.id < currentLayer
                          ? 'border-abyss-teal/30 bg-abyss-teal/5'
                          : 'border-gray-600 bg-gray-800/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-abyss-ethereal">{layer.name}</h3>
                        <span className="text-xs text-abyss-muted">{layer.depth}</span>
                      </div>
                      
                      <p className="text-sm text-abyss-muted mb-2">{layer.description}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-abyss-amber">
                          {layer.xpRequired.toLocaleString()} XP Required
                        </span>
                        {layer.id <= currentLayer && (
                          <span className="text-abyss-teal">✓ Accessed</span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-red-400 italic">
                        Curse: {layer.curse}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Legend */}
            <Card className="bg-abyss-purple/10 backdrop-blur-sm border-abyss-teal/20">
              <CardContent className="p-4">
                <h3 className="font-semibold text-abyss-ethereal mb-3">Explorer's Notes</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-abyss-amber rounded-full ring-2 ring-abyss-amber/30" />
                    <span className="text-abyss-muted">Current Position</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-abyss-teal rounded-full" />
                    <span className="text-abyss-muted">Accessible Layer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full opacity-50" />
                    <span className="text-abyss-muted">Requires More XP</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-abyss-dark/30 rounded border border-abyss-teal/20">
                  <p className="text-xs text-abyss-muted italic">
                    "The deeper you go, the stronger the curse becomes. Only those who have proven themselves worthy may descend further into the Abyss."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}