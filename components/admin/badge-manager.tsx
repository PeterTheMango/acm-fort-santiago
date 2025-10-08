"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Badge {
  id?: string;
  docId?: string;
  name: string;
  description: string;
  icon: string;
  category: "achievement" | "award" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  createdAt?: unknown;
  updatedAt?: unknown;
}

export function BadgeManager() {
  const [badges, _setBadges] = useState<Badge[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [category, setCategory] = useState<"achievement" | "award" | "special">("achievement");
  const [rarity, setRarity] = useState<"common" | "rare" | "epic" | "legendary">("common");

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    // TODO: Implement loadBadges from Firebase
    // const data = await getAllBadges();
    // setBadges(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBadge = async () => {
    if (!name || !description || !iconFile) {
      toast.error("Please fill in all required fields including an image");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement createBadge function with image upload
      // 1. Upload image to storage (Firebase Storage)
      // 2. Get the download URL
      // 3. Create badge with the image URL
      // const badgeId = await createBadge({
      //   name,
      //   description,
      //   icon: downloadURL,
      //   category,
      //   rarity,
      // });

      // if (badgeId) {
      toast.success("Badge created successfully!");
      setIsDialogOpen(false);
      resetForm();
      loadBadges();
      // } else {
      //   toast.error("Failed to create badge");
      // }
    } catch (error) {
      toast.error("Error creating badge");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBadge = async (_badgeId: string) => {
    try {
      // TODO: Implement deleteBadge function
      // await deleteBadge(badgeId);
      toast.success("Badge deleted successfully");
      loadBadges();
    } catch (error) {
      toast.error("Failed to delete badge");
      console.error(error);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIconFile(null);
    setIconPreview("");
    setCategory("achievement");
    setRarity("common");
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800";
      case "rare":
        return "bg-blue-100 text-blue-800";
      case "epic":
        return "bg-purple-100 text-purple-800";
      case "legendary":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Badge, Achievement & Award Management
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Badge</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Badge/Achievement/Award</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Code Master"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Complete 100 coding challenges"
                    className="w-full p-2 border rounded min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Badge Icon Image *</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {iconPreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={iconPreview}
                        alt="Badge preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <span className="text-sm text-muted-foreground">Preview</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as "achievement" | "award" | "special")}
                      className="w-full p-2 border rounded"
                    >
                      <option value="achievement">Achievement</option>
                      <option value="award">Award</option>
                      <option value="special">Special</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rarity *</label>
                    <select
                      value={rarity}
                      onChange={(e) => setRarity(e.target.value as "common" | "rare" | "epic" | "legendary")}
                      className="w-full p-2 border rounded"
                    >
                      <option value="common">Common</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleCreateBadge}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Creating..." : "Create Badge"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {badges.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No badges created yet. Create your first badge to get started!
            </p>
          ) : (
            badges.map((badge, index) => {
              const badgeId = badge.docId || badge.id || `badge-${index}`;
              return (
                <Card key={badgeId}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4 flex-1">
                        <img
                          src={badge.icon}
                          alt={badge.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {badge.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded ${getRarityColor(badge.rarity)}`}
                            >
                              {badge.rarity}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                              {badge.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBadge(badgeId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
