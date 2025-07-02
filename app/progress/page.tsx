import { getCourseProgress, getTopics, getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import ProgressHeader from "./ProgressHeader";
import ProgressTopic from "./ProgressTopic";

const ProgressPage = async () => {
  const userProgressData = getUserProgress();
  const topicsData = getTopics();
  const courseProgressData = getCourseProgress();

  const [userProgress, topics, courseProgress] = await Promise.all([
    userProgressData,
    topicsData,
    courseProgressData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  if (!courseProgress) {
    redirect("/courses");
  }

  // Calculate overall progress
  const totalSubtopics = topics.flatMap((topic) => topic.subtopics).length;
  const completedSubtopics = topics.flatMap((topic) =>
    topic.subtopics.filter((st) => st.completed)
  ).length;
  const overallProgress = Math.round(
    (completedSubtopics / totalSubtopics) * 100
  );

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <ProgressHeader
          course={userProgress.activeCourse}
          progress={overallProgress}
        />

        <div className="mt-8 grid gap-8">
          {topics.map((topic) => (
            <ProgressTopic
              key={topic.id}
              topic={topic}
              activeSubtopicId={courseProgress.activeSubtopic?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
