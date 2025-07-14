import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, ChevronDown, Eye, Compass, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState, memo } from "react";
import abyssMap from "@assets/image_1752500083424.png";

// Layer data moved outside component to prevent recreation on each render
const LAYERS = [
    {
      id: 1,
      name: "Edge of Abyss",
      description: "The entrance to the great pit. Sunlight still reaches here, and the curse is barely noticeable.",
      depth: "0-1,350m",
      curse: "Light dizziness and nausea",
      xpRequired: 0,
      color: "from-amber-400 to-orange-500",
      position: "top-[5%]",
      journalEntry: "The first layer welcomes all who dare to enter the Abyss. Here, the morning sun still bathes the ancient stones, and whistle-bearers gather to begin their descent. The curse is but a whisper at this depth, merely causing slight discomfort. Many delvers make camp here, preparing for the trials ahead.",
      discoveries: ["Ancient stone formations", "Delver camp remnants", "Surface wildlife", "Training grounds for new whistles"]
    },
    {
      id: 2,
      name: "Forest of Temptation",
      description: "A lush forest where the Abyss begins to show its true nature. Ancient trees hide mysterious creatures.",
      depth: "1,350-2,600m",
      curse: "Heavy nausea, headaches, and numbness in limbs",
      xpRequired: 800,
      color: "from-green-400 to-emerald-600",
      position: "top-[15%]",
      journalEntry: "The second layer reveals the Abyss's deceptive beauty. Towering trees create a canopy that filters the light into ethereal beams. The curse grows stronger here, causing disorientation and physical discomfort. Creatures begin to show signs of the Abyss's influence, becoming more aggressive and unpredictable.",
      discoveries: ["Inverted forest canopy", "Mutated plant life", "Territorial creatures", "Hidden cave systems", "Ancient tree hollows"]
    },
    {
      id: 3,
      name: "Great Fault",
      description: "A massive vertical cliff that tests every explorer's resolve. The point of no return approaches.",
      depth: "2,600-7,000m",
      curse: "Vertigo, hallucinations, and severe disorientation",
      xpRequired: 2500,
      color: "from-blue-400 to-cyan-600",
      position: "top-[30%]",
      journalEntry: "The third layer marks a crucial turning point. The great vertical shaft stretches endlessly downward, its walls carved with mysterious symbols. Here, the curse begins to affect the mind as well as the body. Hallucinations become common, and many delvers report seeing impossible sights. The temperature drops noticeably.",
      discoveries: ["Vertical cliff faces", "Ancient carved symbols", "Floating rock formations", "Abyssal winds", "Mysterious echoes"]
    },
    {
      id: 4,
      name: "Goblets of Giants",
      description: "Colossal cup-shaped structures dominate this layer. The curse grows stronger with each step down.",
      depth: "7,000-12,000m",
      curse: "Intense pain throughout the body",
      xpRequired: 5500,
      color: "from-purple-400 to-violet-600",
      position: "top-[45%]",
      journalEntry: "The fourth layer is home to massive cup-shaped formations that dwarf even the largest structures on the surface. The curse here inflicts severe physical pain, making every movement an ordeal. Strange creatures adapted to this environment patrol the goblet-shaped valleys. The air itself seems to pulse with malevolent energy.",
      discoveries: ["Massive cup formations", "Giant hollow spaces", "Adapted creatures", "Crystalline structures", "Pressure anomalies"]
    },
    {
      id: 5,
      name: "Sea of Corpses",
      description: "A crystalline sea where the boundary between life and death blurs. Only the strongest survive.",
      depth: "12,000-13,000m",
      curse: "Complete sensory confusion, loss of consciousness",
      xpRequired: 10000,
      color: "from-teal-400 to-cyan-700",
      position: "top-[60%]",
      journalEntry: "The fifth layer is a vast expanse of crystalline water that reflects no light. The curse here is devastating - complete sensory confusion and loss of consciousness await those who ascend. The water itself seems alive, responding to the presence of delvers. Ancient ruins peek through the crystal-clear depths, hinting at civilizations long lost.",
      discoveries: ["Crystalline waters", "Submerged ruins", "Sensory anomalies", "Living water", "Ancient artifacts"]
    },
    {
      id: 6,
      name: "Capital of Unreturned",
      description: "The ruins of an ancient civilization. Here, the curse of the Abyss becomes truly lethal.",
      depth: "13,000-15,500m",
      curse: "Severe mutations or death",
      xpRequired: 18000,
      color: "from-red-400 to-rose-600",
      position: "top-[75%]",
      journalEntry: "The sixth layer contains the ruins of an ancient civilization that once thrived in the Abyss. The curse here is lethal - ascension results in severe mutations or death. The city's architecture defies understanding, with buildings that seem to exist in multiple dimensions simultaneously. Few return from this depth, earning it the name 'Capital of Unreturned'.",
      discoveries: ["Ancient city ruins", "Impossible architecture", "Dimensional anomalies", "Cursed artifacts", "Mutated remains"]
    },
    {
      id: 7,
      name: "Final Maelstrom",
      description: "The deepest known layer. A realm of pure mystery where reality itself seems to bend.",
      depth: "15,500m+",
      curse: "Certain death or transformation",
      xpRequired: 35000,
      color: "from-indigo-400 to-purple-800",
      position: "top-[90%]",
      journalEntry: "The seventh layer is the deepest known region of the Abyss, where the very fabric of reality becomes unstable. The curse here guarantees death or complete transformation for any who attempt to ascend. Strange phenomena occur regularly - time flows differently, space bends impossibly, and the boundary between dream and reality dissolves. Only the most legendary delvers have ever reached this depth and returned changed forever.",
      discoveries: ["Reality distortions", "Temporal anomalies", "Impossible geometries", "Transformation chambers", "The Golden City"]
    }
  ];

const AbyssMap = memo(() => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  
  const { data: layerProgress } = useQuery({
    queryKey: ["/api/layer-progress"],
    enabled: !!user,
  });

  const currentLayer = layerProgress?.currentLayer || 1;
  const currentXP = layerProgress?.currentXP || 0;
  const selectedLayerData = selectedLayer ? LAYERS[selectedLayer - 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-abyss-dark via-slate-900 to-abyss-purple relative overflow-hidden">
      {/* Mystical Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      {/* Floating Particles */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-abyss-amber/30 rounded-full blur-sm floating-animation" />
      <div className="absolute top-60 right-20 w-3 h-3 bg-abyss-teal/20 rounded-full blur-sm floating-animation" style={{animationDelay: '2s'}} />
      <div className="absolute bottom-40 left-16 w-1 h-1 bg-abyss-purple/40 rounded-full blur-sm floating-animation" style={{animationDelay: '4s'}} />
      
      <div className="relative z-10 container mx-auto px-4 py-4 lg:py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-abyss-ethereal hover:bg-abyss-teal/10 group px-2 lg:px-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2 group-hover:text-abyss-amber transition-colors" />
              <span className="text-sm lg:text-base">Return to Surface</span>
            </Button>
            <div>
              <h1 className="text-xl lg:text-3xl font-bold text-abyss-ethereal mystical-glow">The Abyss</h1>
              <p className="text-abyss-muted flex items-center text-sm lg:text-base">
                <Compass className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 text-abyss-amber relic-glow" />
                Current Depth: Layer {currentLayer} • {currentXP.toLocaleString()} XP
              </p>
              <div className="mt-1 text-xs lg:text-sm text-abyss-amber/60 italic">
                "The Abyss is a place of mystery and wonder, where relics of the past await discovery"
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-abyss-amber">
            <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-xs lg:text-sm">Explorer's View</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="bg-abyss-purple/10 backdrop-blur-sm border-abyss-teal/20 relative overflow-hidden abyss-shimmer">
              <CardContent className="p-4 lg:p-8">
                <div className="relative w-full h-[400px] lg:h-[600px] bg-gradient-to-b from-amber-100 via-slate-200 to-slate-800 rounded-lg overflow-hidden relic-shimmer">
                  {/* Map Background */}
                  <img
                    src={abyssMap}
                    alt="Map of the Abyss"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 curse-distortion"
                  />
                  
                  {/* Layer Markers */}
                  {LAYERS.map((layer) => (
                    <div
                      key={layer.id}
                      className={`absolute left-1/2 transform -translate-x-1/2 ${layer.position} group cursor-pointer`}
                      onClick={() => setSelectedLayer(layer.id)}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${layer.color} ${
                        layer.id <= currentLayer ? 'ring-4 ring-abyss-amber/50' : 'opacity-50'
                      } shadow-lg group-hover:scale-125 transition-transform`} />
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-abyss-dark/90 text-abyss-ethereal px-2 py-1 rounded text-xs lg:text-sm whitespace-nowrap">
                          Layer {layer.id}: {layer.name}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Current Position Indicator */}
                  <div className={`absolute left-1/2 transform -translate-x-1/2 ${LAYERS[currentLayer - 1]?.position} animate-pulse`}>
                    <div className="w-6 h-6 bg-abyss-amber rounded-full ring-4 ring-abyss-amber/30 animate-ping" />
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-abyss-muted text-xs lg:text-sm italic">
                    "The Abyss... it calls to those who dare to explore its depths."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Layer Details */}
          <div className="space-y-4 lg:space-y-6">
            <Card className="bg-abyss-purple/10 backdrop-blur-sm border-abyss-teal/20">
              <CardContent className="p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-abyss-ethereal mb-3 lg:mb-4 flex items-center">
                  <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-abyss-amber" />
                  Layer Details
                </h2>
                
                <div className="space-y-3 lg:space-y-4">
                  {LAYERS.map((layer) => {
                    const isCurrentLayer = layer.id === currentLayer;
                    const isAccessible = layer.id <= currentLayer;
                    const layerStyle = isCurrentLayer
                      ? 'border-abyss-amber bg-abyss-amber/10'
                      : isAccessible
                      ? 'border-abyss-teal/30 bg-abyss-teal/5'
                      : 'border-gray-600 bg-gray-800/30 opacity-60';
                    
                    return (
                      <div
                        key={layer.id}
                        className={`p-3 lg:p-4 rounded-lg border transition-all cursor-pointer hover:bg-abyss-teal/5 ${layerStyle}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-abyss-ethereal text-sm lg:text-base">
                            <span className="text-abyss-amber mr-2">Layer {layer.id}:</span>
                            {layer.name}
                          </h3>
                          <span className="text-xs lg:text-sm text-abyss-muted ml-2 shrink-0">{layer.depth}</span>
                        </div>
                        
                        <p className="text-xs lg:text-sm text-abyss-muted mb-2 leading-relaxed">{layer.description}</p>
                        
                        <div className="flex items-center justify-between text-xs lg:text-sm">
                          <span className="text-abyss-amber">
                            {layer.xpRequired.toLocaleString()} XP Required
                          </span>
                          {isAccessible && (
                            <span className="text-abyss-teal">✓ Accessed</span>
                          )}
                        </div>
                        
                        <div className="mt-2 text-xs text-red-400 italic">
                          Curse: {layer.curse}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Legend */}
            <Card className="bg-abyss-purple/10 backdrop-blur-sm border-abyss-teal/20">
              <CardContent className="p-4">
                <h3 className="font-semibold text-abyss-ethereal mb-3 text-sm lg:text-base">Explorer's Notes</h3>
                <div className="space-y-2 text-xs lg:text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-abyss-amber rounded-full ring-2 ring-abyss-amber/30 shrink-0" />
                    <span className="text-abyss-muted">Current Position</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-abyss-teal rounded-full shrink-0" />
                    <span className="text-abyss-muted">Accessible Layer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full opacity-50 shrink-0" />
                    <span className="text-abyss-muted">Requires More XP</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-abyss-dark/30 rounded border border-abyss-teal/20">
                  <p className="text-xs lg:text-sm text-abyss-muted italic leading-relaxed">
                    "The deeper you go, the stronger the curse becomes. Only those who have proven themselves worthy may descend further into the Abyss."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Layer Journal Modal */}
      <Dialog open={selectedLayer !== null} onOpenChange={() => setSelectedLayer(null)}>
        <DialogContent className="max-w-2xl bg-abyss-dark/95 border-abyss-teal/30 text-abyss-ethereal">
          <DialogDescription className="sr-only">
            Detailed information about Layer {selectedLayer} of the Abyss
          </DialogDescription>
          {selectedLayerData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-abyss-ethereal flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-abyss-amber relic-glow" />
                  Layer {selectedLayer}: {selectedLayerData.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="p-4 bg-abyss-purple/20 rounded-lg border border-abyss-teal/20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-abyss-muted">Depth:</span>
                      <span className="ml-2 text-abyss-ethereal">{selectedLayerData.depth}</span>
                    </div>
                    <div>
                      <span className="text-abyss-muted">XP Required:</span>
                      <span className="ml-2 text-abyss-amber">{selectedLayerData.xpRequired.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-abyss-muted">Curse:</span>
                    <span className="ml-2 text-red-400 italic">{selectedLayerData.curse}</span>
                  </div>
                </div>

                {/* Journal Entry */}
                <div className="p-4 bg-amber-50/5 rounded-lg border border-amber-200/20">
                  <h4 className="font-semibold text-abyss-amber mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Delver's Journal Entry
                  </h4>
                  <p className="text-abyss-ethereal/90 text-sm leading-relaxed italic">
                    "{selectedLayerData.journalEntry}"
                  </p>
                </div>

                {/* Discoveries */}
                <div className="p-4 bg-abyss-teal/10 rounded-lg border border-abyss-teal/20">
                  <h4 className="font-semibold text-abyss-teal mb-2">Notable Discoveries</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {selectedLayerData.discoveries.map((discovery, index) => (
                      <div key={index} className="flex items-center text-sm text-abyss-ethereal/80">
                        <span className="w-2 h-2 bg-abyss-teal/60 rounded-full mr-2 shrink-0"></span>
                        {discovery}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="p-3 bg-abyss-purple/10 rounded-lg border border-abyss-purple/20">
                  <div className="flex items-center justify-between">
                    <span className="text-abyss-muted text-sm">Access Status:</span>
                    <span className={`text-sm font-medium ${
                      selectedLayer && selectedLayer <= currentLayer ? 'text-abyss-teal' : 'text-abyss-muted'
                    }`}>
                      {selectedLayer && selectedLayer <= currentLayer ? '✓ Accessible' : '⚠ Requires More XP'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

AbyssMap.displayName = 'AbyssMap';

export default AbyssMap;