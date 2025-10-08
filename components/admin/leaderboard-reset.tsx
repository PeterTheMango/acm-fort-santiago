"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  resetWeeklyLeaderboard,
  resetDailyLeaderboard,
} from "@/handlers/admin-handler";

export function LeaderboardReset() {
  const [isWeeklyDialogOpen, setIsWeeklyDialogOpen] = useState(false);
  const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetWeekly = async () => {
    setIsLoading(true);
    try {
      await resetWeeklyLeaderboard();
      toast.success("Weekly leaderboard reset successfully!");
      setIsWeeklyDialogOpen(false);
    } catch (error) {
      toast.error("Failed to reset weekly leaderboard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDaily = async () => {
    setIsLoading(true);
    try {
      await resetDailyLeaderboard();
      toast.success("Daily leaderboard reset successfully!");
      setIsDailyDialogOpen(false);
    } catch (error) {
      toast.error("Failed to reset daily leaderboard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Weekly Leaderboard</h3>
              <p className="text-sm text-muted-foreground">
                Reset all weekly experience records
              </p>
            </div>
            <Dialog
              open={isWeeklyDialogOpen}
              onOpenChange={setIsWeeklyDialogOpen}
            >
              <Button
                variant="destructive"
                onClick={() => setIsWeeklyDialogOpen(true)}
              >
                Reset Weekly
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Weekly Leaderboard</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to reset the weekly leaderboard? This
                    action will delete all weekly experience records and cannot
                    be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsWeeklyDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleResetWeekly}
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Daily Leaderboard</h3>
              <p className="text-sm text-muted-foreground">
                Reset all daily experience records
              </p>
            </div>
            <Dialog
              open={isDailyDialogOpen}
              onOpenChange={setIsDailyDialogOpen}
            >
              <Button
                variant="destructive"
                onClick={() => setIsDailyDialogOpen(true)}
              >
                Reset Daily
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Daily Leaderboard</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to reset the daily leaderboard? This
                    action will delete all daily experience records and cannot
                    be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDailyDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleResetDaily}
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
