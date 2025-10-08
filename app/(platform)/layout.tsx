"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { subscribe } from "@/service/firebase-service";
import { Level } from "@/handlers/level-handler";
import { Timestamp, where } from "firebase/firestore";
import { toast } from "sonner";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Event Available",
    message: "Introduction to Web Development starts in 2 days",
    time: "2h ago",
    read: false,
  },
  {
    id: "2",
    title: "Achievement Unlocked",
    message: "You've reached level 2!",
    time: "5h ago",
    read: false,
  },
  {
    id: "3",
    title: "New Connection",
    message: "Aisha Al Khalifa accepted your connection request",
    time: "1d ago",
    read: false,
  },
  {
    id: "4",
    title: "Event Reminder",
    message: "Hackathon 2025 is tomorrow",
    time: "1d ago",
    read: false,
  },
  {
    id: "5",
    title: "Points Earned",
    message: "You earned 50 points for completing a workshop",
    time: "2d ago",
    read: false,
  },
];

/**
 * Layout component that provides a sidebar and breadcrumb header and renders the given main content.
 *
 * @param children - Content to display in the main content area of the layout
 * @returns A React element containing the platform layout with sidebar and header
 */
interface UserPoints {
  id: string;
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [experienceToNextLevel, setExperienceToNextLevel] = useState(100);
  const confettiRef = useRef<ConfettiRef>(null);
  const previousLevelRef = useRef(1);
  const previousPointsRef = useRef(0);
  const previousExperienceRef = useRef(0);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fireConfetti = () => {
    // Fire multiple bursts with delays to ensure visibility
    const duration = 1.5 * 1000; // 1.5 seconds
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      origin: { x: 0.95, y: 0.95 }
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confettiRef.current?.fire({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.85, 1), y: randomInRange(0.85, 1) }
      });
    }, 250);
  };

  // Subscribe to realtime points updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribe<UserPoints>(
      "points",
      (items) => {
        const userPoints = items.find((item) => item.id === user.id);
        if (userPoints) {
          // Check if points increased
          if (userPoints.points > previousPointsRef.current && previousPointsRef.current > 0) {
            const pointsGained = userPoints.points - previousPointsRef.current;
            toast.success(`Gained ${pointsGained} points!`);
            fireConfetti();
          }
          previousPointsRef.current = userPoints.points;
          setPoints(userPoints.points);
        }
      },
      {
        filters: [where("id", "==", user.id)],
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Subscribe to realtime level updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribe<Level>(
      "levels",
      (items) => {
        const userLevel = items.find((item) => item.id === user.id);
        if (userLevel) {
          // Calculate total experience to detect experience gains even across level ups
          const calculateTotalExp = (lvl: number, exp: number) => {
            let total = exp;
            for (let i = 1; i < lvl; i++) {
              total += 100 * i; // 100 XP per level
            }
            return total;
          };

          const currentTotalExp = calculateTotalExp(userLevel.level, userLevel.experience);
          const previousTotalExp = calculateTotalExp(previousLevelRef.current, previousExperienceRef.current);

          // Check if level increased
          if (userLevel.level > previousLevelRef.current && previousLevelRef.current > 0) {
            toast.success(`Level Up! You're now level ${userLevel.level}!`);
            fireConfetti();
          }
          // Check if experience increased (but don't show if we just leveled up)
          else if (currentTotalExp > previousTotalExp && previousTotalExp > 0) {
            const expGained = currentTotalExp - previousTotalExp;
            toast.success(`Gained ${expGained} experience!`);
            fireConfetti();
          }

          previousLevelRef.current = userLevel.level;
          previousExperienceRef.current = userLevel.experience;

          setLevel(userLevel.level);
          setExperience(userLevel.experience);
          setExperienceToNextLevel(userLevel.experienceToNextLevel);
        }
      },
      {
        filters: [where("id", "==", user.id)],
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const handleNotificationOpen = (open: boolean) => {
    setIsNotificationOpen(open);
    if (open && unreadCount > 0) {
      // Mark all notifications as read when popover opens
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }
  };
  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between gap-2 px-4 w-full">
            <SidebarTrigger className="md:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage className="text-muted-foreground">
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Popover open={isNotificationOpen} onOpenChange={handleNotificationOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Image
                            src={unreadCount > 0 ? "/notification_on.png" : "/notification_off.png"}
                            alt="Notifications"
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent align="end" className="w-80">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <Separator />
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {notifications.slice(0, visibleCount).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No notifications
                          </p>
                        ) : (
                          notifications.slice(0, visibleCount).map((notification) => (
                            <div
                              key={notification.id}
                              className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > visibleCount && (
                        <>
                          <Separator />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => setVisibleCount((prev) => prev + 4)}
                          >
                            View More
                          </Button>
                        </>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-4 cursor-pointer rounded-full p-2 hover:bg-accent transition-colors">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/currency.png"
                      alt="Currency"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    <span className="text-sm font-medium">{points}</span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <Image
                      src="/level.png"
                      alt="Level"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    <span className="absolute text-sm font-bold text-white">
                      {level}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Image
                    src="/currency.png"
                    alt="Currency"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                  View Points
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Image
                    src="/level.png"
                    alt="Level"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                  View Level
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </header>
        <Separator />
        <ScrollArea className="flex-1 h-0">
          <div className="flex flex-col gap-4 p-4">{children}</div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
    <Confetti
      ref={confettiRef}
      className="fixed top-0 left-0 z-50 size-full pointer-events-none"
      manualstart={true}
      globalOptions={{ resize: true, useWorker: false }}
    />
    </>
  );
}
