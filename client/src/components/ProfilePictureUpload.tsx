import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userName?: string;
  onImageUpdate?: (newImageUrl: string | null) => void;
}

export default function ProfilePictureUpload({ 
  currentImageUrl, 
  userName, 
  onImageUpdate 
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Use user's actual profile image URL or fallback to currentImageUrl
  const displayImageUrl = user?.profileImageUrl || currentImageUrl;

  // Upload mutation
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
      setSelectedFile(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onImageUpdate?.(data.profileImageUrl);
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/user/profile-image");
      return response.json();
    },
    onSuccess: () => {
      // Clear any preview
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onImageUpdate?.(null);
      toast({
        title: "Profile Picture Removed",
        description: "Your profile picture has been removed successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Remove error:", error);
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove profile picture. Please try again.",
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
        description: "Please select an image file (PNG, JPG, GIF, or WebP).",
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

    // Validate file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported Format",
        description: "Please select a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    removeMutation.mutate();
  };

  const getInitials = (name?: string) => {
    if (!name) return "CA";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get the image URL to display (preview > actual profile image > fallback)
  const getImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (displayImageUrl) return displayImageUrl;
    return null;
  };

  return (
    <Card className="bg-abyss-purple/20 backdrop-blur-sm border-abyss-teal/20">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-abyss-amber">
              <AvatarImage 
                src={getImageUrl() || undefined} 
                alt="Profile picture" 
                className="object-cover"
                key={getImageUrl()} // Force re-render when image changes
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
                disabled={uploadMutation.isPending || removeMutation.isPending}
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
                    disabled={uploadMutation.isPending || !selectedFile}
                    className="bg-abyss-amber hover:bg-abyss-amber/90 text-abyss-dark font-semibold"
                    size="sm"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="border-abyss-ethereal/30 text-abyss-ethereal hover:bg-abyss-ethereal/10"
                    disabled={uploadMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-abyss-ethereal">Profile Picture</p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="border-abyss-amber/30 text-abyss-amber hover:bg-abyss-amber/10"
                    disabled={uploadMutation.isPending || removeMutation.isPending}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {displayImageUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  
                  {displayImageUrl && (
                    <Button
                      onClick={handleRemove}
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                      disabled={uploadMutation.isPending || removeMutation.isPending}
                    >
                      {removeMutation.isPending ? (
                        <>
                          <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}