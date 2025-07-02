// app/(main)/progress/UserRankings.tsx
import { getUserRank } from "@/db/queries";
import { getUserProgress } from "@/db/queries";
import { Gem, Star, Trophy } from "lucide-react";

const UserRankings = async () => {
  const userProgress = await getUserProgress();
  const [pointsRankings, xpRankings, levelRankings] = await Promise.all([
    getUserRank("points"),
    getUserRank("xp"),
    getUserRank("level"),
  ]);

  if (!userProgress) return null;

  // Find user position in each ranking
  const getPosition = (rankings: typeof pointsRankings, userId: string) => {
    const position = rankings.findIndex((user) => user.userId === userId);
    return position >= 0 ? position + 1 : "Not ranked";
  };

  const pointsPosition = getPosition(pointsRankings, userProgress.userId);
  const xpPosition = getPosition(xpRankings, userProgress.userId);
  const levelPosition = getPosition(levelRankings, userProgress.userId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Points Ranking */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h3 className="text-xl font-bold">Points Ranking</h3>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-700 rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-lg font-bold">{pointsPosition}</span>
            </div>
            <div>
              <p className="text-sm text-purple-200">Your Position</p>
              <p className="text-xl font-bold">{userProgress.points} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* XP Ranking */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-8 h-8 text-blue-400" />
          <h3 className="text-xl font-bold">XP Ranking</h3>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-700 rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-lg font-bold">{xpPosition}</span>
            </div>
            <div>
              <p className="text-sm text-purple-200">Your Position</p>
              <p className="text-xl font-bold">{userProgress.xp} XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Ranking */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Gem className="w-8 h-8 text-green-400" />
          <h3 className="text-xl font-bold">Level Ranking</h3>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-700 rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-lg font-bold">{levelPosition}</span>
            </div>
            <div>
              <p className="text-sm text-purple-200">Your Position</p>
              <p className="text-xl font-bold">Level {userProgress.level}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRankings;
