"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { giveManualReward, TriviaReward } from "@/handlers/admin-handler";
import { getUserByEmail } from "@/handlers/user-handler";

export function ManualRewards() {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [rewardType, setRewardType] = useState<"xp" | "points">("xp");
  const [rewardValue, setRewardValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleGiveReward = async () => {
    if (!userIdentifier || rewardValue <= 0) {
      toast.error("Please enter a valid user ID/email and reward value");
      return;
    }

    setIsLoading(true);

    try {
      let userId = userIdentifier;

      // Check if input is an email (contains @)
      if (userIdentifier.includes("@")) {
        const user = await getUserByEmail(userIdentifier) as { docId?: string; id?: string } | null;
        const foundUserId = user?.docId || user?.id;

        if (!user || !foundUserId) {
          toast.error("User not found with that email");
          setIsLoading(false);
          return;
        }

        userId = foundUserId;
      }

      const rewards: TriviaReward[] = [
        {
          type: rewardType,
          value: rewardValue,
        },
      ];

      await giveManualReward(userId, rewards);
      toast.success(
        `Successfully gave ${rewardValue} ${rewardType} to user`
      );
      setUserIdentifier("");
      setRewardValue(0);
    } catch (error) {
      toast.error("Failed to give reward");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">User ID or Email</label>
            <Input
              value={userIdentifier}
              onChange={(e) => setUserIdentifier(e.target.value)}
              placeholder="Enter user ID or email address"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can enter either the user&apos;s ID or email address
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Reward Type</label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as "xp" | "points")}
                className="w-full p-2 border rounded"
              >
                <option value="xp">XP</option>
                <option value="points">Points</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Reward Value</label>
              <Input
                type="number"
                value={rewardValue}
                onChange={(e) => setRewardValue(Number(e.target.value))}
                placeholder="Reward amount"
                min="1"
              />
            </div>
          </div>

          <Button
            onClick={handleGiveReward}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Giving Reward..." : "Give Reward"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
