import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userName?: string;
  onImageUpdate?: (newImageUrl: string) => void;
}

export default function ProfilePictureUpload({ 
  currentImageUrl, 
  userName, 
  onImageUpdate 
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await apiRequest("POST", "/api/user/profile-image", formData, {
        headers: {
          // Don't set Content-Type header, let browser set it with boundary
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewUrl(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Force refetch to get the updated user data
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      onImageUpdate?.(data.profileImageUrl);
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    uploadMutation.mutate(file);
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "CA";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="bg-abyss-purple/20 backdrop-blur-sm border-abyss-teal/20">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-abyss-amber">
              <AvatarImage 
                src={previewUrl || currentImageUrl} 
                alt="Profile picture" 
                className="object-cover"
                key={previewUrl || currentImageUrl} // Force re-render when image changes
              />
              <AvatarFallback className="bg-abyss-purple/50 text-abyss-ethereal font-semibold text-lg">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            
            {!previewUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark rounded-full p-2 transition-colors"
                title="Change profile picture"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex-1">
            {previewUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-abyss-ethereal">Preview new image</p>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold"
                    size="sm"
                  >
                    {uploadMutation.isPending ? "Uploading..." : <Upload className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="border-abyss-ethereal/30 text-abyss-ethereal hover:bg-abyss-ethereal/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-abyss-ethereal mb-2">Profile Picture</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="border-abyss-amber/30 text-abyss-amber hover:bg-abyss-amber/10"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}