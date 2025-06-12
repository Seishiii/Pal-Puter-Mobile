import { getOverallQuizStats } from "@/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import CourseList from "./CourseList";

const PerformanceDashboard = async () => {
  const stats = await getOverallQuizStats();

  return (
    <div className="space-y-6">
      <Card className="bg-purple-400 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-black">Average Score</span>
            <span className="font-bold text-xl text-purple-700">
              {stats.overallPercentage}%
            </span>
          </div>
          <Progress
            value={stats.overallPercentage}
            className="h-3 bg-purple-600"
          />
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-black text-sm">Quizzes Taken</p>
              <p className="font-bold text-lg">{stats.totalAttempts}</p>
            </div>
            <div>
              <p className="text-black text-sm">Highest Score</p>
              <p className="font-bold text-lg">{stats.highestScore}%</p>
            </div>
            <div>
              <p className="text-black text-sm">Pass Rate</p>
              <p className="font-bold text-lg">{stats.passRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-purple-500">By Course:</h2>
        <CourseList />
      </div>
    </div>
  );
};

export default PerformanceDashboard;
