import { Shield, Mountain, Zap, Skull, Crown, Eye, Flame } from "lucide-react";

export const LAYER_CONFIG = {
  1: {
    name: "Edge of Abyss",
    color: "bg-green-500",
    icon: Shield,
    grades: "V0-V1",
    description: "The surface layer where all adventures begin"
  },
  2: {
    name: "Forest of Temptation",
    color: "bg-blue-500",
    icon: Mountain,
    grades: "V2-V3",
    description: "Dense woods with challenging terrain"
  },
  3: {
    name: "Great Fault",
    color: "bg-yellow-500",
    icon: Zap,
    grades: "V4-V5",
    description: "A massive vertical cliff face"
  },
  4: {
    name: "The Goblets of Giants",
    color: "bg-orange-500",
    icon: Eye,
    grades: "V6-V7",
    description: "Mysterious formations that test your limits"
  },
  5: {
    name: "Sea of Corpses",
    color: "bg-red-500",
    icon: Skull,
    grades: "V8-V9",
    description: "A dangerous expanse of crystalline waters"
  },
  6: {
    name: "The Capital of the Unreturned",
    color: "bg-purple-500",
    icon: Crown,
    grades: "V10-V11",
    description: "The point of no return for most"
  },
  7: {
    name: "The Final Maelstrom",
    color: "bg-pink-500",
    icon: Flame,
    grades: "V12+",
    description: "The deepest layer, shrouded in mystery"
  }
};

export function getLayerInfo(layerNumber: number) {
  return LAYER_CONFIG[layerNumber as keyof typeof LAYER_CONFIG] || LAYER_CONFIG[1];
}

export function getLayerName(layerNumber: number): string {
  const layerInfo = getLayerInfo(layerNumber);
  return layerInfo.name;
}

export function getLayerDescription(layerNumber: number): string {
  const layerInfo = getLayerInfo(layerNumber);
  return layerInfo.description;
}