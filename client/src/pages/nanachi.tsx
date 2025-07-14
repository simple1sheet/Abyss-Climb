import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Image as ImageIcon, Camera, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string;
}

export default function Nanachi() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get user stats for personalization
  const { data: userStats } = useQuery({
    queryKey: ["/api/enhanced-progress"],
    enabled: !!user,
  });

  const { data: userSkills } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; image?: File }) => {
      const formData = new FormData();
      formData.append("message", messageData.message);
      if (messageData.image) {
        formData.append("image", messageData.image);
      }

      const response = await fetch("/api/nanachi/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
      setInputMessage("");
      setSelectedImage(null);
      setPreviewImage(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      image: previewImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessageMutation.mutate({ message: inputMessage, image: selectedImage || undefined });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message when first opening
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello there, ${user?.firstName || "fellow delver"}! I'm Nanachi, naa! 

I'm your personal climbing assistant from the depths of the Abyss, and I'm here to help you navigate your climbing journey through the layers of difficulty.

**What I can help you with:**
• 📸 **Boulder Problem Analysis** - Send me pictures of boulder problems and I'll give you beta advice on holds, movement, and technique
• 🧗 **Climbing Techniques** - Ask me about specific climbing moves, body positioning, or training methods
• 📈 **Personal Progress** - Get recommendations based on your current skills and climbing data
• 🎯 **Training Plans** - Suggestions for improving your weakest areas and advancing to the next layer
• 💬 **General Chat** - Just talk about climbing, challenges, or anything on your mind, naa!

${user?.firstName ? `I can see you're currently exploring Layer ${userStats?.currentLayer || 1} with ${userStats?.currentXP || 0} XP earned on your ${userStats?.whistleName || "Bell"} whistle. Your best grade so far is ${userStats?.enhancedStats?.bestGrade || "V0"} - impressive progress, naa!

` : ""}I have access to all your climbing data, so my advice will be perfectly tailored to your current skill level and goals. Whether you're stuck on a tricky problem or looking to push into the next grade, I'm here to help you succeed!

What would you like to explore together today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [user, userStats, messages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-abyss-dark via-abyss-midnight to-abyss-void relative overflow-hidden">
      {/* Background Effects */}
      <div className="nature-background"></div>
      <div className="moss-overlay"></div>
      
      {/* Natural Floating Particles */}
      <div className="nature-spore" style={{left: '5%', animationDelay: '0s'}}></div>
      <div className="nature-spore" style={{left: '25%', animationDelay: '4s'}}></div>
      <div className="nature-spore" style={{left: '50%', animationDelay: '8s'}}></div>
      <div className="nature-spore" style={{left: '75%', animationDelay: '12s'}}></div>
      <div className="nature-spore" style={{left: '95%', animationDelay: '16s'}}></div>
      
      {/* Firefly Particles */}
      <div className="firefly" style={{left: '10%', bottom: '60%', animationDelay: '1s'}}></div>
      <div className="firefly" style={{left: '30%', bottom: '30%', animationDelay: '5s'}}></div>
      <div className="firefly" style={{left: '60%', bottom: '80%', animationDelay: '9s'}}></div>
      <div className="firefly" style={{left: '80%', bottom: '45%', animationDelay: '13s'}}></div>
      
      {/* Layer Fog Effect */}
      <div className="layer-fog"></div>

      {/* Header */}
      <header className="relative z-20 px-6 pt-12 pb-6 border-b border-abyss-amber/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              size="sm"
              className="text-abyss-amber hover:text-abyss-ethereal hover:bg-abyss-purple/20"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-abyss-amber/30">
                <AvatarImage src="/attached_assets/nanachi-avatar.svg" alt="Nanachi" />
                <AvatarFallback className="bg-abyss-purple/50 text-abyss-ethereal font-semibold">
                  N
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-abyss-ethereal ancient-text">
                  Nanachi
                </h1>
                <p className="text-sm text-abyss-amber opacity-80">
                  Your Personal Climbing Assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 h-[calc(100vh-280px)]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] ${
                message.role === "user"
                  ? "bg-abyss-amber/20 text-abyss-ethereal"
                  : "bg-abyss-purple/20 text-abyss-ethereal"
              } rounded-lg px-4 py-3 nature-card`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Uploaded boulder problem"
                  className="w-full max-w-sm rounded-lg mb-2"
                />
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs text-abyss-muted mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-abyss-purple/20 text-abyss-ethereal rounded-lg px-4 py-3 nature-card">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-abyss-amber" />
                <span className="text-sm">Nanachi is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {previewImage && (
        <div className="px-6 py-2">
          <Card className="nature-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-sm text-abyss-ethereal">Image selected</span>
                </div>
                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewImage(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-abyss-amber hover:text-abyss-ethereal"
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Input Area */}
      <div className="relative z-20 px-6 pb-6">
        <Card className="nature-card">
          <CardContent className="p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Nanachi about climbing techniques, send a boulder problem picture, or chat about your progress..."
                  className="w-full resize-none bg-abyss-midnight/50 border border-abyss-amber/30 rounded-lg px-4 py-3 text-black placeholder-abyss-muted focus:outline-none focus:ring-2 focus:ring-abyss-amber/50 focus:border-abyss-amber/50"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="border-abyss-amber/30 text-abyss-amber hover:bg-abyss-amber/10"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={(!inputMessage.trim() && !selectedImage) || sendMessageMutation.isPending}
                  className="abyss-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}