"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@/components/social/connect-button";
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

/**
 * Produce uppercase initials from a person's full name.
 *
 * @param name - The full name to extract initials from
 * @returns The initials in uppercase formed from the first character of the first and last name parts; for a single-part name returns one initial, and for an empty or whitespace-only string returns an empty string
 */
function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  const first = parts[0]!.slice(0, 1);
  const last = parts[parts.length - 1]!.slice(0, 1);
  return (first + last).toUpperCase();
}

// Data is fetched from API; mock array removed
const sections: RecommendationSection[] = [];

/**
 * Render a recommendation card for a user, showing avatar (or initials), name, optional mutual count, badges, and action buttons.
 *
 * @param user - The recommended user object to display
 * @returns A React element representing the user's card
 */
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
          <ConnectButton targetUserId={user.id} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/profile/${user.id}`} aria-label={`View ${user.fullName}'s profile`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Render the Social recommendations page with searchable, paginated user cards.
 *
 * Provides a search input (filters by name or badge), pagination controls, and a responsive grid of user cards showing avatars, badges, and actions.
 *
 * @returns A JSX element containing the social recommendations UI
 */
export default function SocialPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12; // 3 rows at lg (4 per row)
  const [users, setUsers] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Get recommended user IDs (mutuals)
        const recRes = await fetch("/api/connections/recommendations", { credentials: "include", cache: "no-store" });
        if (!recRes.ok) throw new Error("Failed to load recommendations");
        const ids = (await recRes.json()) as string[];
        // Fetch user docs for each id
        const usersData = await Promise.all(
          ids.map(async (id) => {
            const uRes = await fetch(`/api/users?userId=${encodeURIComponent(id)}`, { credentials: "include", cache: "no-store" });
            if (!uRes.ok) return null;
            const u = await uRes.json();
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || id;
            const avatarUrl = u.profilePicture || undefined;
            return { id, fullName, avatarUrl, badges: [] as string[] } as RecommendedUser;
          })
        );
        const cleaned = usersData.filter(Boolean) as RecommendedUser[];
        if (!cancelled) setUsers(cleaned);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
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
          <div className="mt-4">
            <Input
              id="social-search"
              aria-label="Search users by name or skill"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by name or skill..."
            />
          </div>
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

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
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
