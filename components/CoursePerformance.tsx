import { formatSeconds, getCourseQuizPerformances } from "@/db/queries";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const CoursePerformance = async ({ courseId }: { courseId: number }) => {
  const { course, subtopicsRes } = await getCourseQuizPerformances(courseId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-y-3">
        <Link href="/performance">
          <Button
            variant="ghost"
            className="text-white border-2 border-gray-600"
          >
            &larr; Back to Performance
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-purple-500">{course?.title}</h1>
        <div></div> {/* Spacer */}
      </div>

      {subtopicsRes.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white">
            No quiz attempts for this course
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {subtopicsRes.map((subtopic) => (
            <Card key={subtopic.id} className="border-gray-200 w-70">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{subtopic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between">
                    <p className="text-white">
                      Average:{" "}
                      <span className="font-bold">
                        {subtopic.averageScore}%
                      </span>
                    </p>
                    <p className="text-white">
                      Attempts:{" "}
                      <span className="font-bold">
                        {subtopic.quizPerformances.length}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {subtopic.quizPerformances
                    .sort(
                      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                    )
                    .map((perf) => (
                      <div
                        key={perf.id}
                        className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Attempt #{perf.attemptNumber}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                perf.passed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {perf.passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {perf.createdAt.toLocaleDateString()} •{" "}
                            {formatSeconds(perf.timeTaken)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              perf.passed ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {perf.score}%
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursePerformance;
