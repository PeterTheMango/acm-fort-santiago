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
import { Timestamp } from "firebase/firestore";
import {
  createDailyTrivia,
  endDailyTrivia,
  deleteDailyTrivia,
  getAllDailyTrivia,
  DailyTrivia,
  TriviaReward,
} from "@/handlers/admin-handler";

export function DailyTriviaManager() {
  const [trivias, setTrivias] = useState<DailyTrivia[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [rewards, setRewards] = useState<TriviaReward[]>([
    { type: "xp", value: 50 }
  ]);
  const [endType, setEndType] = useState<"auto" | "manual">("auto");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadTrivias();
  }, []);

  const loadTrivias = async () => {
    const data = await getAllDailyTrivia();
    setTrivias(data);
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleCreateTrivia = async () => {
    if (!question || !correctAnswer || choices.some((c) => !c)) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!choices.includes(correctAnswer)) {
      toast.error("Correct answer must be one of the choices");
      return;
    }

    setIsLoading(true);

    try {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      const todayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );

      let endDateTime = todayEnd;
      if (endType === "auto" && endDate) {
        endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59);
      }

      const triviaId = await createDailyTrivia({
        question,
        correctAnswer,
        choices,
        rewards,
        startDate: Timestamp.fromDate(todayStart),
        endDate: Timestamp.fromDate(endDateTime),
        status: "active",
      });

      if (triviaId) {
        toast.success("Daily trivia created successfully!");
        setIsDialogOpen(false);
        resetForm();
        loadTrivias();
      } else {
        toast.error("Failed to create trivia");
      }
    } catch (error) {
      toast.error("Error creating trivia");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndTrivia = async (triviaId: string) => {
    try {
      await endDailyTrivia(triviaId);
      toast.success("Trivia ended successfully");
      loadTrivias();
    } catch (error) {
      toast.error("Failed to end trivia");
      console.error(error);
    }
  };

  const handleDeleteTrivia = async (triviaId: string) => {
    try {
      await deleteDailyTrivia(triviaId);
      toast.success("Trivia deleted successfully");
      loadTrivias();
    } catch (error) {
      toast.error("Failed to delete trivia");
      console.error(error);
    }
  };

  const resetForm = () => {
    setQuestion("");
    setCorrectAnswer("");
    setChoices(["", "", "", ""]);
    setRewards([{ type: "xp", value: 50 }]);
    setEndType("auto");
    setEndDate("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Daily Trivia Quiz Management
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Trivia</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Daily Trivia Quiz</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Question</label>
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter trivia question"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Choices</label>
                  {choices.map((choice, index) => (
                    <Input
                      key={index}
                      value={choice}
                      onChange={(e) => handleChoiceChange(index, e.target.value)}
                      placeholder={`Choice ${index + 1}`}
                      className="mt-2"
                    />
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium">Correct Answer</label>
                  <Input
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="Enter the correct answer (must match one choice exactly)"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold">Rewards</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRewards([...rewards, { type: "xp", value: 50 }])}
                    >
                      Add Reward
                    </Button>
                  </div>
                  {rewards.map((reward, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={reward.type}
                        onChange={(e) => {
                          const newRewards = [...rewards];
                          newRewards[idx].type = e.target.value as "xp" | "points";
                          setRewards(newRewards);
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="xp">XP</option>
                        <option value="points">Points</option>
                      </select>
                      <Input
                        type="number"
                        value={reward.value}
                        onChange={(e) => {
                          const newRewards = [...rewards];
                          newRewards[idx].value = Number(e.target.value);
                          setRewards(newRewards);
                        }}
                        placeholder="Value"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRewards(rewards.filter((_, i) => i !== idx))}
                        disabled={rewards.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium">End Type</label>
                  <select
                    value={endType}
                    onChange={(e) =>
                      setEndType(e.target.value as "auto" | "manual")
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="auto">Auto (11:59 PM today or custom date)</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                {endType === "auto" && (
                  <div>
                    <label className="text-sm font-medium">
                      End Date (optional, defaults to today)
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  onClick={handleCreateTrivia}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Creating..." : "Create Trivia"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trivias.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No trivia quizzes yet
            </p>
          ) : (
            trivias.map((trivia, index) => {
              const triviaId = (trivia as { docId?: string; id?: string }).docId || (trivia as { id?: string }).id || `trivia-${index}`;
              return (
                <Card key={triviaId}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{trivia.question}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Correct Answer: {trivia.correctAnswer}
                        </p>
                        <div className="text-sm text-muted-foreground mt-1">
                          Rewards:{" "}
                          {trivia.rewards
                            .map((r) => `${r.value} ${r.type}`)
                            .join(", ")}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Status:{" "}
                          <span
                            className={
                              trivia.status === "active"
                                ? "text-green-600"
                                : "text-gray-600"
                            }
                          >
                            {trivia.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {trivia.status === "active" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleEndTrivia(triviaId)}
                          >
                            End Quiz
                          </Button>
                        )}
                        {trivia.status === "ended" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTrivia(triviaId)}
                          >
                            Delete
                          </Button>
                        )}
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
