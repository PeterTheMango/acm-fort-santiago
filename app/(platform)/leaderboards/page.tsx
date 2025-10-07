import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Medal } from "lucide-react";
// Mock data - replace with actual data from your API
const topPlayers = [
  {
    rank: 1,
    name: "Blademir Malina Tori",
    username: "@popy_bob",
    avatar: "/placeholder-avatar-1.png",
    wins: 443,
    matches: 778,
    points: 44872,
    gifts: 32421,
    diamonds: 17500,
  },
  {
    rank: 2,
    name: "Robert Fox",
    username: "@robert_fox",
    avatar: "/placeholder-avatar-2.png",
    wins: 440,
    matches: 887,
    points: 42515,
    gifts: 31001,
    diamonds: 17421,
  },
  {
    rank: 3,
    name: "Molida Glinda",
    username: "@molida_glinda",
    avatar: "/placeholder-avatar-3.png",
    wins: 412,
    matches: 756,
    points: 40550,
    gifts: 30987,
    diamonds: 17224,
  },
];

const allPlayers = [
  {
    rank: 1,
    name: "Blademir Malina Tori",
    id: "ID 1587867",
    avatar: "/placeholder-avatar-1.png",
    matchWins: 443,
    spentTime: 778,
    victories: 43,
    bestWin: "1:05",
    points: 44872,
  },
  {
    rank: 2,
    name: "Robert Fox",
    id: "ID 1587634",
    avatar: "/placeholder-avatar-2.png",
    matchWins: 440,
    spentTime: 887,
    victories: 43,
    bestWin: "1:03",
    points: 42515,
  },
  {
    rank: 3,
    name: "Molida Glinda",
    id: "ID 1587689",
    avatar: "/placeholder-avatar-3.png",
    matchWins: 412,
    spentTime: 756,
    victories: 43,
    bestWin: "1:15",
    points: 40550,
  },
  {
    rank: 4,
    name: "Sarah Johnson",
    id: "ID 1587901",
    avatar: "/placeholder-avatar-1.png",
    matchWins: 398,
    spentTime: 720,
    victories: 41,
    bestWin: "1:18",
    points: 38920,
  },
  {
    rank: 5,
    name: "Michael Chen",
    id: "ID 1588045",
    avatar: "/placeholder-avatar-2.png",
    matchWins: 385,
    spentTime: 695,
    victories: 40,
    bestWin: "1:22",
    points: 37150,
  },
  {
    rank: 6,
    name: "Emma Williams",
    id: "ID 1588112",
    avatar: "/placeholder-avatar-3.png",
    matchWins: 372,
    spentTime: 680,
    victories: 39,
    bestWin: "1:25",
    points: 35840,
  },
  {
    rank: 7,
    name: "David Martinez",
    id: "ID 1588234",
    avatar: "/placeholder-avatar-1.png",
    matchWins: 360,
    spentTime: 665,
    victories: 38,
    bestWin: "1:28",
    points: 34520,
  },
  {
    rank: 8,
    name: "Lisa Anderson",
    id: "ID 1588356",
    avatar: "/placeholder-avatar-2.png",
    matchWins: 348,
    spentTime: 650,
    victories: 37,
    bestWin: "1:30",
    points: 33280,
  },
  {
    rank: 9,
    name: "James Taylor",
    id: "ID 1588478",
    avatar: "/placeholder-avatar-3.png",
    matchWins: 335,
    spentTime: 635,
    victories: 36,
    bestWin: "1:33",
    points: 32100,
  },
  {
    rank: 10,
    name: "Maria Garcia",
    id: "ID 1588590",
    avatar: "/placeholder-avatar-1.png",
    matchWins: 322,
    spentTime: 620,
    victories: 35,
    bestWin: "1:35",
    points: 30950,
  },
];

/**
 * Render the Leaderboard page containing top-stat cards and a global ranking table.
 *
 * Uses the file's static mock data to populate three statistic cards (points, experience, challenges)
 * and a scrollable table of player rankings with avatars and formatted points.
 *
 * @returns The page's JSX element showing the Leaderboard UI populated from mock data
 */
export default function LeaderboardPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Track the top performers and see who's leading in points, experience, and challenges completed.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Highest Points Achieved */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-yellow-500" />
                  <div className="text-sm text-muted-foreground">Highest Points Achieved</div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder-avatar-1.png" alt="Blademir Malina Tori" />
                    <AvatarFallback>BM</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">Blademir Malina Tori</div>
                    <div className="text-2xl font-bold">44,872</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highest Experience Gained */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-gray-400" />
                  <div className="text-sm text-muted-foreground">Highest Experience Gained</div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder-avatar-2.png" alt="Robert Fox" />
                    <AvatarFallback>RF</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">Robert Fox</div>
                    <div className="text-2xl font-bold">12,450</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highest Challenges Completed */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-700" />
                  <div className="text-sm text-muted-foreground">Highest Challenges Completed</div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder-avatar-3.png" alt="Molida Glinda" />
                    <AvatarFallback>MG</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">Molida Glinda</div>
                    <div className="text-2xl font-bold">78</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Ranking Table */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Global Ranking</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                      Rank
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                      Username
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                      Match Wins
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                      Spent time
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                      Victories
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                      Best Win (mm:ss)
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allPlayers.map((player) => (
                    <tr
                      key={player.rank}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          player.rank === 1
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-bold"
                            : player.rank === 2
                            ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 font-bold"
                            : player.rank === 3
                            ? "bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-bold"
                            : "bg-muted"
                        }`}>
                          {player.rank}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={player.avatar} alt={player.name} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-muted-foreground">{player.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{player.matchWins}</td>
                      <td className="py-4 px-4">{player.spentTime}</td>
                      <td className="py-4 px-4">{player.victories}</td>
                      <td className="py-4 px-4">{player.bestWin}</td>
                      <td className="py-4 px-4">{player.points.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}