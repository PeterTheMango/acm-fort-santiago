"use client";

import { Target, Code, Brain, Flame, Calendar, Trophy, Award, Check, X, MapPin, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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

/**
 * Platform page showing a dashboard with bento-grid layout.
 *
 * @returns The React element representing the dashboard page.
 */
export default function PlatformPage() {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const triviaChoices = [
    { id: "a", text: "Hypertext Markup Language" },
    { id: "b", text: "High-Level Machine Language" },
    { id: "c", text: "Home Tool Markup Language" },
    { id: "d", text: "Hyperlinks and Text Markup Language" },
  ];

  const correctAnswer = "a";

  const handleSubmitAnswer = () => {
    setIsSubmitted(true);
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
        <Card>
          <CardHeader>
            <div className="text-xs font-medium text-primary mb-3">COMMUNITY QUEST</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Build a Discord Bot</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Create a bot with at least 3 commands
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">12/50 contributors</span>
              </div>
              <Progress value={24} />
            </div>

            {/* Rewards Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Rewards</h4>
              <TooltipProvider>
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-2 bg-amber-500/10 rounded-lg cursor-help">
                        <Trophy className="h-5 w-5 text-amber-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">All Contributors</p>
                        <p className="text-xs text-muted-foreground">+50 XP</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-2 bg-purple-500/10 rounded-lg cursor-help">
                        <Award className="h-5 w-5 text-purple-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">Top Contributor</p>
                        <p className="text-xs text-muted-foreground">+200 XP + Special Badge</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Coding Challenge */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="text-xs font-medium text-primary mb-3">WEEKLY CODING CHALLENGE</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Code className="h-6 w-6 text-primary" />
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
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Daily Tech Trivia</CardTitle>
            </div>
            <CardDescription className="line-clamp-3">
              Test your tech knowledge with today&apos;s question
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Answer Today&apos;s Trivia</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>What does HTML stand for?</DialogTitle>
                  <DialogDescription>
                    Select the correct answer from the options below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    {triviaChoices.map((choice) => {
                      const isCorrect = choice.id === correctAnswer;
                      const isSelected = selectedChoice === choice.id;
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
                          key={choice.id}
                          variant={variant}
                          className={`w-full justify-start text-left h-auto py-3 ${
                            showResult && isCorrect ? "bg-green-600 hover:bg-green-700" : ""
                          }`}
                          onClick={() => !isSubmitted && setSelectedChoice(choice.id)}
                          disabled={isSubmitted}
                        >
                          <span className="font-medium mr-2">{choice.id.toUpperCase()}.</span>
                          <span className="flex-1">{choice.text}</span>
                          {showResult && isCorrect && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <X className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    className="w-full"
                    disabled={!selectedChoice || isSubmitted}
                    onClick={handleSubmitAnswer}
                  >
                    Submit Answer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
              <CardTitle>Daily Trivia Streak</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold">0</div>
              <p className="text-muted-foreground mt-2">days active</p>
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
                    href={`/event/${event.id}`}
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
