"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

type Event = {
  id: string;
  title: string;
  organizer: string;
  date: Date;
  location: string;
  description: string;
  imageUrl: string;
  isRegistered: boolean;
};

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Introduction to Web Development",
    organizer: "ACM UDST",
    date: new Date("2025-10-15T14:00:00"),
    location: "Building A, Room 101",
    description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
    imageUrl: "/leaderboards.png",
    isRegistered: true,
  },
  {
    id: "2",
    title: "Hackathon 2025",
    organizer: "ACM UDST",
    date: new Date("2025-10-20T09:00:00"),
    location: "Main Hall",
    description: "24-hour hackathon to build innovative solutions for real-world problems.",
    imageUrl: "/leaderboards.png",
    isRegistered: true,
  },
  {
    id: "3",
    title: "AI and Machine Learning Workshop",
    organizer: "Tech Club",
    date: new Date("2025-10-25T15:00:00"),
    location: "Building B, Lab 202",
    description: "Hands-on workshop covering neural networks and deep learning basics.",
    imageUrl: "/leaderboards.png",
    isRegistered: false,
  },
  {
    id: "4",
    title: "Career Fair 2025",
    organizer: "University Career Services",
    date: new Date("2025-11-01T10:00:00"),
    location: "Student Center",
    description: "Meet with top employers and explore internship and job opportunities.",
    imageUrl: "/leaderboards.png",
    isRegistered: false,
  },
  {
    id: "5",
    title: "Cybersecurity Fundamentals",
    organizer: "Security Society",
    date: new Date("2025-11-05T13:00:00"),
    location: "Building C, Room 305",
    description: "Learn about network security, encryption, and ethical hacking principles.",
    imageUrl: "/leaderboards.png",
    isRegistered: false,
  },
];

/**
 * Format a date into a readable string showing day, date, and time.
 */
function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Render an event card with image on left and event details on right.
 */
function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 w-full sm:h-auto sm:w-48 flex-shrink-0">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <p className="text-sm text-muted-foreground">By {event.organizer}</p>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatEventDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              {event.description}
            </p>
            <div>
              {event.isRegistered ? (
                <Button className="w-full sm:w-auto">
                  Attend Event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button className="w-full sm:w-auto">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

/**
 * Render the Events page with "Your Events" and "Upcoming Events" sections.
 */
export default function EventsPage() {
  const sortedEvents = useMemo(() => {
    return [...mockEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  const yourEvents = useMemo(() => {
    return sortedEvents.filter((e) => e.isRegistered).slice(0, 4);
  }, [sortedEvents]);

  const upcomingEvents = useMemo(() => {
    return sortedEvents.filter((e) => !e.isRegistered).slice(0, 4);
  }, [sortedEvents]);

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Discover and join upcoming events and workshops.
        </p>
      </div>

      {/* Your Events Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Events</h2>
        {yourEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven't registered for any events yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {yourEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming events at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
