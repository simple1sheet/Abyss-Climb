import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, Gem, Crown, Star, Award } from "lucide-react";
import { type Relic } from "@shared/schema";

interface RelicStats {
  total: number;
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common": return "bg-gray-500 text-white";
    case "uncommon": return "bg-green-500 text-white";
    case "rare": return "bg-blue-500 text-white";
    case "epic": return "bg-purple-500 text-white";
    case "legendary": return "bg-yellow-500 text-black";
    default: return "bg-gray-500 text-white";
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case "common": return <Star className="w-4 h-4" />;
    case "uncommon": return <Award className="w-4 h-4" />;
    case "rare": return <Gem className="w-4 h-4" />;
    case "epic": return <Crown className="w-4 h-4" />;
    case "legendary": return <Trophy className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

interface GroupedRelic {
  name: string;
  description: string;
  rarity: string;
  category: string;
  loreText: string;
  count: number;
  relics: Relic[];
}

const RelicCard = ({ groupedRelic }: { groupedRelic: GroupedRelic }) => {
  const { toast } = useToast();
  
  const handleRelicClick = () => {
    const relicDetails = groupedRelic.relics.map(r => 
      `Found on ${new Date(r.foundAt).toLocaleDateString()} (Layer ${r.layer}, Grade ${r.grade})`
    ).join('\n');
    
    toast({
      title: groupedRelic.count > 1 ? `(${groupedRelic.count}) ${groupedRelic.name}` : groupedRelic.name,
      description: `${groupedRelic.loreText || groupedRelic.description}\n\n${relicDetails}`,
      duration: 6000,
    });
  };

  return (
    <Card 
      className="nature-card cursor-pointer hover:scale-105 transition-transform duration-200 border-2 border-amber-400/30"
      onClick={handleRelicClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold ancient-text text-amber-300">
            {groupedRelic.count > 1 ? `(${groupedRelic.count}) ${groupedRelic.name}` : groupedRelic.name}
          </CardTitle>
          <Badge className={`${getRarityColor(groupedRelic.rarity)} flex items-center gap-1`}>
            {getRarityIcon(groupedRelic.rarity)}
            {groupedRelic.rarity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-gray-300 italic">
          {groupedRelic.category.replace('_', ' ')}
        </p>
        <p className="text-sm text-gray-400">
          {groupedRelic.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>First found: Layer {groupedRelic.relics[0].layer}</span>
          <span>Grade {groupedRelic.relics[0].grade}</span>
        </div>
        <div className="text-xs text-gray-600">
          Found: {new Date(groupedRelic.relics[0].foundAt).toLocaleDateString()}
          {groupedRelic.count > 1 && (
            <span className="ml-2 text-amber-400">+{groupedRelic.count - 1} more</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const groupRelicsByName = (relics: Relic[]): GroupedRelic[] => {
  const grouped = relics.reduce((acc, relic) => {
    if (!acc[relic.name]) {
      acc[relic.name] = {
        name: relic.name,
        description: relic.description,
        rarity: relic.rarity,
        category: relic.category,
        loreText: relic.loreText || "",
        count: 0,
        relics: []
      };
    }
    acc[relic.name].count++;
    acc[relic.name].relics.push(relic);
    return acc;
  }, {} as Record<string, GroupedRelic>);

  return Object.values(grouped);
};

const RelicsByRarity = ({ rarity }: { rarity: string }) => {
  const { data: relics, isLoading } = useQuery<Relic[]>({
    queryKey: [`/api/relics/rarity/${rarity}`],
    enabled: rarity !== "all",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!relics || relics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No {rarity} relics found yet.</p>
        <p className="text-sm mt-2">Complete boulder problems to find relics!</p>
      </div>
    );
  }

  const groupedRelics = groupRelicsByName(relics);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groupedRelics.map((groupedRelic) => (
        <RelicCard key={groupedRelic.name} groupedRelic={groupedRelic} />
      ))}
    </div>
  );
};

const RelicsTab = () => {
  const { data: allRelics, isLoading: isLoadingRelics } = useQuery<Relic[]>({
    queryKey: ["/api/relics"],
  });

  const { data: relicStats, isLoading: isLoadingStats } = useQuery<RelicStats>({
    queryKey: ["/api/relics/stats"],
  });

  if (isLoadingRelics || isLoadingStats) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold ancient-text text-amber-300 mb-2">
          Abyss Relics Collection
        </h2>
        <p className="text-gray-400">
          Discover ancient artifacts while exploring the depths of the Abyss
        </p>
      </div>

      {/* Stats Overview */}
      {relicStats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="nature-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-300">{relicStats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </CardContent>
          </Card>
          <Card className="nature-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-300">{relicStats.common}</div>
              <div className="text-sm text-gray-400">Common</div>
            </CardContent>
          </Card>
          <Card className="nature-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-300">{relicStats.uncommon}</div>
              <div className="text-sm text-gray-400">Uncommon</div>
            </CardContent>
          </Card>
          <Card className="nature-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-300">{relicStats.rare}</div>
              <div className="text-sm text-gray-400">Rare</div>
            </CardContent>
          </Card>
          <Card className="nature-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-300">{relicStats.epic}</div>
              <div className="text-sm text-gray-400">Epic</div>
            </CardContent>
          </Card>
          <Card className="nature-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-300">{relicStats.legendary}</div>
              <div className="text-sm text-gray-400">Legendary</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relics by Rarity */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="common">Common</TabsTrigger>
          <TabsTrigger value="uncommon">Uncommon</TabsTrigger>
          <TabsTrigger value="rare">Rare</TabsTrigger>
          <TabsTrigger value="epic">Epic</TabsTrigger>
          <TabsTrigger value="legendary">Legendary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-[500px]">
            {allRelics && allRelics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupRelicsByName(allRelics).map((groupedRelic) => (
                  <RelicCard key={groupedRelic.name} groupedRelic={groupedRelic} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <p className="text-lg font-semibold">No relics found yet!</p>
                <p className="text-sm mt-2">Complete boulder problems during your climbing sessions to discover ancient artifacts.</p>
                <p className="text-xs mt-2 text-gray-500">Relic find rates: Common (10%), Uncommon (4%), Rare (1%), Epic (0.4%), Legendary (0.2%)</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="common" className="mt-6">
          <ScrollArea className="h-[500px]">
            <RelicsByRarity rarity="common" />
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="uncommon" className="mt-6">
          <ScrollArea className="h-[500px]">
            <RelicsByRarity rarity="uncommon" />
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="rare" className="mt-6">
          <ScrollArea className="h-[500px]">
            <RelicsByRarity rarity="rare" />
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="epic" className="mt-6">
          <ScrollArea className="h-[500px]">
            <RelicsByRarity rarity="epic" />
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="legendary" className="mt-6">
          <ScrollArea className="h-[500px]">
            <RelicsByRarity rarity="legendary" />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Card className="nature-card border-amber-400/30">
        <CardHeader>
          <CardTitle className="ancient-text text-amber-300">About Relics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-400">
          <p>Relics are ancient artifacts found throughout the Abyss, each with their own unique properties and lore.</p>
          <p>Complete boulder problems during your climbing sessions to have a chance of discovering these mysterious items.</p>
          <p>Higher layer progression and difficulty grades may unlock access to more powerful relics.</p>
          <p>Click on any relic to learn more about its history and significance in the Made in Abyss world.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelicsTab;