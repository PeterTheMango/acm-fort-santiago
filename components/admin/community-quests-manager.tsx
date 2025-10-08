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
import {
  createCommunityQuest,
  updateCommunityQuest,
  deleteCommunityQuest,
  getAllCommunityQuests,
  CommunityQuest,
  QuestReward,
  createPlatformAnnouncement,
} from "@/handlers/admin-handler";
import { Progress } from "@/components/ui/progress";

export function CommunityQuestsManager() {
  const [quests, setQuests] = useState<CommunityQuest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questType, setQuestType] = useState<"gain_experience" | "answer_trivia" | "gain_points" | "level_up">("gain_experience");
  const [targetContributors, setTargetContributors] = useState(50);

  // All contributors rewards (multiple)
  const [allRewards, setAllRewards] = useState<QuestReward[]>([
    { type: "xp", value: 50, tier: "all" }
  ]);

  // Top/First contributors rewards
  const [topRewardTier, setTopRewardTier] = useState<"top" | "first">("top");
  const [topRewardCount, setTopRewardCount] = useState(3);
  const [topRewards, setTopRewards] = useState<QuestReward[]>([
    { type: "xp", value: 200, tier: "top", count: 3 }
  ]);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    const data = await getAllCommunityQuests();
    setQuests(data);
  };

  const handleCreateQuest = async () => {
    if (!title || !description || targetContributors <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Combine all rewards and top/first rewards
      const rewards: QuestReward[] = [...allRewards, ...topRewards];

      const questId = await createCommunityQuest({
        title,
        description,
        questType,
        targetContributors,
        currentContributors: 0,
        rewards,
        status: "active",
      });

      if (questId) {
        toast.success("Community quest created successfully!");

        // Send platform alert for new community quest
        await createPlatformAnnouncement({
          message: "New community quest available! Join the community and complete challenges together!",
          type: "info",
          createdBy: "admin",
        });

        setIsDialogOpen(false);
        resetForm();
        loadQuests();
      } else {
        toast.error("Failed to create quest");
      }
    } catch (error) {
      toast.error("Error creating quest");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    try {
      await deleteCommunityQuest(questId);
      toast.success("Quest deleted successfully");
      loadQuests();
    } catch (error) {
      toast.error("Failed to delete quest");
      console.error(error);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      await updateCommunityQuest(questId, { status: "completed" });
      toast.success("Quest marked as completed");
      loadQuests();
    } catch (error) {
      toast.error("Failed to complete quest");
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setQuestType("gain_experience");
    setTargetContributors(50);
    setAllRewards([{ type: "xp", value: 50, tier: "all" }]);
    setTopRewardTier("top");
    setTopRewardCount(3);
    setTopRewards([{ type: "xp", value: 200, tier: "top", count: 3 }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Community Quests Management
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Quest</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Community Quest</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Build a Discord Bot"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Create a bot with at least 3 commands"
                    className="w-full p-2 border rounded min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Quest Type *</label>
                  <select
                    value={questType}
                    onChange={(e) => setQuestType(e.target.value as "gain_experience" | "answer_trivia" | "gain_points" | "level_up")}
                    className="w-full p-2 border rounded"
                  >
                    <option value="gain_experience">Gain Experience</option>
                    <option value="answer_trivia">Answer Trivia Correctly</option>
                    <option value="gain_points">Gain Points</option>
                    <option value="level_up">Level Up</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {questType === "gain_experience" || questType === "gain_points"
                      ? `Target ${questType === "gain_experience" ? "XP" : "Points"} Goal *`
                      : "Target Contributors *"}
                  </label>
                  <Input
                    type="number"
                    value={targetContributors}
                    onChange={(e) =>
                      setTargetContributors(Number(e.target.value))
                    }
                    placeholder={questType === "gain_experience" ? "10000" : questType === "gain_points" ? "5000" : "50"}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {questType === "gain_experience"
                      ? "Total XP the community needs to gain collectively"
                      : questType === "gain_points"
                      ? "Total points the community needs to gain collectively"
                      : "Number of unique contributors needed"}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold">
                      All Contributors Rewards
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAllRewards([...allRewards, { type: "xp", value: 50, tier: "all" }])}
                    >
                      Add Reward
                    </Button>
                  </div>
                  {allRewards.map((reward, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={reward.type}
                        onChange={(e) => {
                          const newRewards = [...allRewards];
                          newRewards[idx].type = e.target.value as "xp" | "points" | "badge";
                          setAllRewards(newRewards);
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="xp">XP</option>
                        <option value="points">Points</option>
                        <option value="badge">Badge</option>
                      </select>
                      <Input
                        type={reward.type === "badge" ? "text" : "number"}
                        value={reward.value}
                        onChange={(e) => {
                          const newRewards = [...allRewards];
                          newRewards[idx].value = reward.type === "badge" ? e.target.value : Number(e.target.value);
                          setAllRewards(newRewards);
                        }}
                        placeholder={reward.type === "badge" ? "Badge ID" : "Value"}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setAllRewards(allRewards.filter((_, i) => i !== idx))}
                        disabled={allRewards.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">
                    Top/First Contributors Rewards
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-sm font-medium">Tier Type</label>
                      <select
                        value={topRewardTier}
                        onChange={(e) => {
                          const tier = e.target.value as "top" | "first";
                          setTopRewardTier(tier);
                          setTopRewards(topRewards.map(r => ({ ...r, tier })));
                        }}
                        className="w-full p-2 border rounded"
                      >
                        <option value="top">Top X Contributors</option>
                        <option value="first">First X Contributors</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Count</label>
                      <Input
                        type="number"
                        value={topRewardCount}
                        onChange={(e) => {
                          const count = Number(e.target.value);
                          setTopRewardCount(count);
                          setTopRewards(topRewards.map(r => ({ ...r, count })));
                        }}
                        placeholder="3"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground">
                      Rewards for {topRewardTier} {topRewardCount} contributor(s)
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTopRewards([...topRewards, { type: "xp", value: 200, tier: topRewardTier, count: topRewardCount }])}
                    >
                      Add Reward
                    </Button>
                  </div>
                  {topRewards.map((reward, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={reward.type}
                        onChange={(e) => {
                          const newRewards = [...topRewards];
                          newRewards[idx].type = e.target.value as "xp" | "points" | "badge";
                          setTopRewards(newRewards);
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="xp">XP</option>
                        <option value="points">Points</option>
                        <option value="badge">Badge</option>
                      </select>
                      <Input
                        type={reward.type === "badge" ? "text" : "number"}
                        value={reward.value}
                        onChange={(e) => {
                          const newRewards = [...topRewards];
                          newRewards[idx].value = reward.type === "badge" ? e.target.value : Number(e.target.value);
                          setTopRewards(newRewards);
                        }}
                        placeholder={reward.type === "badge" ? "Badge ID" : "Value"}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setTopRewards(topRewards.filter((_, i) => i !== idx))}
                        disabled={topRewards.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleCreateQuest}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Creating..." : "Create Quest"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No community quests yet
            </p>
          ) : (
            quests.map((quest, index) => {
              const questId = (quest as { docId?: string; id?: string }).docId || (quest as { id?: string }).id || `quest-${index}`;
              const progress =
                (quest.currentContributors / quest.targetContributors) * 100;
              const isGainQuest = quest.questType === "gain_experience" || quest.questType === "gain_points";

              return (
                <Card key={questId || index}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {quest.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                quest.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {quest.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {quest.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {quest.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteQuest(questId)}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteQuest(questId)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {quest.currentContributors}/{quest.targetContributors}{" "}
                            {isGainQuest
                              ? (quest.questType === "gain_experience" ? "XP" : "points")
                              : "contributors"}
                          </span>
                        </div>
                        <Progress value={progress} />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Quest Type: </span>
                          <span className="font-medium">
                            {quest.questType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium">Rewards</h4>
                        <div className="space-y-2 text-sm">
                          {quest.rewards.filter((r: QuestReward) => r.tier === "all").length > 0 && (
                            <div>
                              <span className="text-muted-foreground">All Contributors: </span>
                              <span className="font-medium">
                                {quest.rewards
                                  .filter((r: QuestReward) => r.tier === "all")
                                  .map((r: QuestReward) =>
                                    r.type === "badge" ? `Badge: ${r.value}` : `+${r.value} ${r.type}`
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                          {quest.rewards.filter((r: QuestReward) => r.tier === "top" || r.tier === "first").length > 0 && (
                            <div>
                              <span className="text-muted-foreground">
                                {quest.rewards.find((r: QuestReward) => r.tier === "top" || r.tier === "first")?.tier === "top" ? "Top" : "First"}{" "}
                                {quest.rewards.find((r: QuestReward) => r.tier === "top" || r.tier === "first")?.count || 1} Contributor(s):{" "}
                              </span>
                              <span className="font-medium">
                                {quest.rewards
                                  .filter((r: QuestReward) => r.tier === "top" || r.tier === "first")
                                  .map((r: QuestReward) =>
                                    r.type === "badge" ? `Badge: ${r.value}` : `+${r.value} ${r.type}`
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
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
