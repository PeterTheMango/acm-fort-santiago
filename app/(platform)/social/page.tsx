"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type RecommendedUser = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  badges: string[];
  mutualCount?: number;
};

type RecommendationSection = {
  id: string;
  title: string;
  subtitle?: string;
  users: RecommendedUser[];
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

const sections: RecommendationSection[] = [
  {
    id: "mutuals",
    title: "Most Mutuals",
    users: [
      {
        id: "aisha-al-khalifa",
        fullName: "Aisha Al Khalifa",
        avatarUrl: "/vercel.svg",
        badges: ["Algorithms", "Frontend"],
        mutualCount: 12,
      },
      {
        id: "mohammed-salem",
        fullName: "Mohammed Salem",
        avatarUrl: "/next.svg",
        badges: ["Data Science", "Python"],
        mutualCount: 8,
      },
    ],
  },
  {
    id: "skills",
    title: "Same Skills",
    users: [
      {
        id: "fatima-hassan",
        fullName: "Fatima Hassan",
        avatarUrl: "/globe.svg",
        badges: ["React", "TypeScript", "UI/UX"],
      },
      {
        id: "omar-ali",
        fullName: "Omar Ali",
        avatarUrl: "/window.svg",
        badges: ["Go", "Distributed Systems"],
      },
    ],
  },
  {
    id: "organizations",
    title: "Organizations",
    users: [
      {
        id: "noor-ahmed",
        fullName: "Noor Ahmed",
        badges: ["ACM UDST", "Hackathon Lead"],
      },
      {
        id: "youssef-mansour",
        fullName: "Youssef Mansour",
        badges: ["ACM UDST", "Events"],
      },
    ],
  },
  {
    id: "interests",
    title: "Interests",
    users: [
      {
        id: "sara-rahman",
        fullName: "Sara Rahman",
        badges: ["Competitive Programming", "Open Source"],
      },
      {
        id: "ahmed-khan",
        fullName: "Ahmed Khan",
        badges: ["AI", "Robotics"],
      },
    ],
  },
];

function UserCard({ user }: { user: RecommendedUser }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          ) : null}
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="truncate text-base leading-tight">
            {user.fullName}
          </CardTitle>
          {typeof user.mutualCount === "number" ? (
            <p className="text-xs text-muted-foreground">
              {user.mutualCount} mutual{user.mutualCount === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {user.badges.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button size="sm" variant="default">Connect</Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/profile/${user.id}`} aria-label={`View ${user.fullName}'s profile`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SocialPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12; // 3 rows at lg (4 per row)

  const users = useMemo<RecommendedUser[]>(() => {
    // Flatten sections into a single users array; if duplicates, keep the highest mutualCount
    const map = new Map<string, RecommendedUser>();
    sections.forEach((section) => {
      section.users.forEach((u) => {
        const existing = map.get(u.id);
        if (!existing) {
          map.set(u.id, { ...u });
        } else {
          const mutualCount = Math.max(existing.mutualCount ?? -1, u.mutualCount ?? -1);
          map.set(u.id, { ...existing, ...u, mutualCount: mutualCount >= 0 ? mutualCount : undefined });
        }
      });
    });
    return Array.from(map.values());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const nameMatch = u.fullName.toLowerCase().includes(q);
      const badgeMatch = u.badges.some((b) => b.toLowerCase().includes(q));
      return nameMatch || badgeMatch;
    });
  }, [query, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paged = filtered.slice(start, end);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  function goPrev() {
    if (canPrev) setPage((p) => Math.max(1, p - 1));
  }

  function goNext() {
    if (canNext) setPage((p) => Math.min(totalPages, p + 1));
  }

  function goTo(pageNum: number) {
    const clamped = Math.min(Math.max(1, pageNum), totalPages);
    setPage(clamped);
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Social</h1>
        <p className="text-sm text-muted-foreground">
          Find people to connect with. Search by name or badge.
        </p>
        <div className="mt-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or skill..."
          />
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          {filtered.length > 0 ? (
            <div className="text-xs text-muted-foreground mr-auto">
              Showing {Math.max(0, start + 1)}-{Math.min(end, filtered.length)} of {filtered.length}
            </div>
          ) : null}
          <Button size="sm" variant="outline" onClick={goPrev} disabled={!canPrev}>
            Previous
          </Button>
          <div className="text-xs">
            Page {currentPage} / {totalPages}
          </div>
          <Button size="sm" variant="outline" onClick={goNext} disabled={!canNext}>
            Next
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {paged.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-6 flex items-center justify-end gap-2">
          <div className="text-xs text-muted-foreground mr-auto">
            Showing {start + 1}-{Math.min(end, filtered.length)} of {filtered.length}
          </div>
          <Button size="sm" variant="outline" onClick={goPrev} disabled={!canPrev}>
            Previous
          </Button>
          <div className="text-xs">
            Page {currentPage} / {totalPages}
          </div>
          <Button size="sm" variant="outline" onClick={goNext} disabled={!canNext}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}


