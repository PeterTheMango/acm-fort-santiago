"use client";

import { Flame, Calendar, Trophy, Award, Check, X, MapPin, Clock, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { subscribe, WithId } from "@/service/firebase-service";
import {
  getActiveDailyTrivia,
  submitTriviaAnswer,
  hasUserAnsweredTrivia,
  DailyTrivia,
  hasUserContributedToQuest,
  CommunityQuest,
} from "@/handlers/admin-handler";
import { getUserStreak, updateStreak, UserStreak } from "@/handlers/streak-handler";
import { toast } from "sonner";

/**
 * Platform page showing a dashboard with bento-grid layout.
 *
 * @returns The React element representing the dashboard page.
 */
export default function PlatformPage() {
  const { user } = useUser();
  const userId = user?.id;

  // Trivia state
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyTrivia, setDailyTrivia] = useState<WithId<DailyTrivia> | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  // Quest state
  const [activeQuests, setActiveQuests] = useState<WithId<CommunityQuest>[]>([]);
  const [_hasContributed, setHasContributed] = useState<Record<string, boolean>>({});

  // Streak state
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);

  // Subscribe to active daily trivia for real-time updates
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribe<DailyTrivia>("daily-trivia", async (trivias) => {
      const activeTrivia = trivias.find((t) => t.status === "active");

      if (activeTrivia) {
        const triviaWithId = activeTrivia as WithId<DailyTrivia>;
        setDailyTrivia(triviaWithId);
        const triviaId = triviaWithId.id || triviaWithId.docId;
        if (triviaId) {
          const answered = await hasUserAnsweredTrivia(triviaId, userId);
          setHasAnswered(answered);
        }
      } else {
        setDailyTrivia(null);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to active quests with real-time updates
  useEffect(() => {
    const unsubscribe = subscribe<CommunityQuest>(
      "community-quests",
      async (quests) => {
        const activeQuestsList = quests.filter((q) => q.status === "active");
        setActiveQuests(activeQuestsList);

        // Check contribution status for each quest
        if (userId) {
          const contributionStatus: Record<string, boolean> = {};
          for (const quest of activeQuestsList) {
            const questId = quest.id || quest.docId;
            if (questId) {
              const contributed = await hasUserContributedToQuest(questId, userId);
              contributionStatus[questId] = contributed;
            }
          }
          setHasContributed(contributionStatus);
        }
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to user streak for real-time updates
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribe<UserStreak>("user-streaks", (streaks) => {
      const currentStreak = streaks.find(
        (s) => (s.id || s.docId) === userId
      );
      setUserStreak(currentStreak || null);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleSubmitAnswer = async () => {
    if (!userId || !dailyTrivia || !selectedChoice) return;

    const triviaId = dailyTrivia.id || dailyTrivia.docId;
    if (!triviaId) {
      toast.error("Invalid trivia ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitTriviaAnswer(
        triviaId,
        userId,
        selectedChoice
      );

      if (result.success) {
        setIsSubmitted(true);
        setWasCorrect(result.isCorrect);

        // Update streak
        const streakResult = await updateStreak(userId);
        if (streakResult.success) {
          setUserStreak(streakResult.streak);
          toast.success(
            result.isCorrect
              ? `Correct! 🎉 Streak: ${streakResult.streak?.currentStreak} days`
              : "Better luck next time! Streak updated."
          );
        } else if (streakResult.alreadyUpdatedToday) {
          toast.success(
            result.isCorrect
              ? "Correct! 🎉 (Streak already updated today)"
              : "Better luck next time!"
          );
        }

        if (result.isCorrect && result.rewards) {
          const rewardText = result.rewards
            .map((r) => `+${r.value} ${r.type.toUpperCase()}`)
            .join(", ");
          toast.success(`Rewards earned: ${rewardText}`);
        }
      } else {
        toast.error("Failed to submit answer");
      }
    } catch (error) {
      console.error("Error submitting trivia:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };


  const upcomingEvents = [
    {
      id: "1",
      title: "Web Development Workshop",
      description: "Learn modern web development with React and Next.js",
      time: "Saturday, 2:00 PM",
      location: "Room 301, Tech Building",
    },
    {
      id: "2",
      title: "AI/ML Seminar Series",
      description: "Introduction to Machine Learning fundamentals and applications",
      time: "Monday, 4:00 PM",
      location: "Auditorium Hall",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* First Row - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Community Quest */}
        {activeQuests.length > 0 ? (
          activeQuests.slice(0, 1).map((quest) => (
            <Card key={quest.docId}>
              <CardHeader>
                <div className="text-xs font-medium text-primary mb-3">COMMUNITY QUEST</div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Image src="/quest.png" alt="Quest" width={24} height={24} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{quest.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {quest.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {quest.currentContributors}/{quest.targetContributors} contributors
                    </span>
                  </div>
                  <Progress
                    value={(quest.currentContributors / quest.targetContributors) * 100}
                  />
                </div>

                {/* Rewards Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Rewards</h4>
                  <TooltipProvider>
                    <div className="flex items-center gap-3">
                      {quest.rewards.map((reward, idx) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <div
                              className={`p-2 rounded-lg cursor-help ${
                                reward.tier === "all"
                                  ? "bg-amber-500/10"
                                  : "bg-purple-500/10"
                              }`}
                            >
                              {reward.tier === "all" ? (
                                <Trophy
                                  className={`h-5 w-5 ${
                                    reward.tier === "all" ? "text-amber-500" : "text-purple-500"
                                  }`}
                                />
                              ) : (
                                <Award className="h-5 w-5 text-purple-500" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-medium">
                                {reward.tier === "all" ? "All Contributors" : "Top Contributor"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                +{reward.value} {reward.type.toUpperCase()}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <div className="text-xs font-medium text-primary mb-3">COMMUNITY QUEST</div>
              <CardTitle className="text-lg">No Active Quests</CardTitle>
              <CardDescription className="text-xs mt-1">
                Check back later for new community challenges!
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Weekly Coding Challenge */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="text-xs font-medium text-primary mb-3">WEEKLY CODING CHALLENGE</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Image src="/coding.png" alt="Coding" width={24} height={24} />
              </div>
              <CardTitle className="text-lg">Two Sum Problem</CardTitle>
            </div>
            <CardDescription className="line-clamp-3">
              Given an array of integers and a target, return indices of the two numbers that add up to the target.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <Button className="w-full">Create Submission</Button>
          </CardContent>
        </Card>

        {/* Daily Tech Trivia */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="text-xs font-medium text-primary mb-3">DAILY TECH TRIVIA</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Image src="/trivia.png" alt="Trivia" width={24} height={24} />
              </div>
              <CardTitle className="text-lg">Daily Tech Trivia</CardTitle>
            </div>
            <CardDescription className="line-clamp-3">
              {dailyTrivia
                ? "Test your tech knowledge with today's question"
                : "No trivia available today"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            {dailyTrivia ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={hasAnswered}>
                    {hasAnswered ? "Already Answered Today" : "Answer Today's Trivia"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{dailyTrivia.question}</DialogTitle>
                    <DialogDescription>
                      Select the correct answer from the options below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      {dailyTrivia.choices.map((choice, idx) => {
                        const isCorrect = choice === dailyTrivia.correctAnswer;
                        const isSelected = selectedChoice === choice;
                        const showResult = isSubmitted;

                        let variant: "default" | "outline" | "destructive" = "outline";
                        if (showResult) {
                          if (isCorrect) {
                            variant = "default";
                          } else if (isSelected && !isCorrect) {
                            variant = "destructive";
                          }
                        } else if (isSelected) {
                          variant = "default";
                        }

                        return (
                          <Button
                            key={idx}
                            variant={variant}
                            className={`w-full justify-start text-left h-auto py-3 ${
                              showResult && isCorrect ? "bg-green-600 hover:bg-green-700" : ""
                            }`}
                            onClick={() => !isSubmitted && setSelectedChoice(choice)}
                            disabled={isSubmitted}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className="flex-1">{choice}</span>
                            {showResult && isCorrect && <Check className="h-4 w-4 ml-2" />}
                            {showResult && isSelected && !isCorrect && (
                              <X className="h-4 w-4 ml-2" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    {!isSubmitted ? (
                      <Button
                        className="w-full"
                        disabled={!selectedChoice || isSubmitting}
                        onClick={handleSubmitAnswer}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Answer"}
                      </Button>
                    ) : (
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <p className="text-lg font-semibold">
                          {wasCorrect
                            ? "🎉 Congratulations on solving today's trivia!"
                            : "Better luck next time!"}
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button className="w-full" disabled>
                No Trivia Available
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row - 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Streak */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <CardTitle>Activity Streak</CardTitle>
            </div>
            <CardDescription>
              Daily trivia or quest contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="relative text-center">
              <Image
                src="/streak.png"
                alt="Streak"
                width={200}
                height={200}
                className="mx-auto"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {userStreak?.currentStreak ?? 0}
                </div>
                <p className="text-white text-sm font-medium mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">days active</p>
              </div>
              {userStreak && userStreak.longestStreak > userStreak.currentStreak && (
                <p className="text-xs text-muted-foreground mt-2">
                  Best: {userStreak.longestStreak} days
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Upcoming Events</CardTitle>
            </div>
            <CardDescription>
              Don&apos;t miss out on upcoming events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-base">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
                  >
                    View Event
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
