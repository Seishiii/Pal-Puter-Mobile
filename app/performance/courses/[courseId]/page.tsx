import CoursePerformance from "@/components/CoursePerformance";
import { redirect } from "next/navigation";

const CoursePerformancePage = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const courseId = parseInt((await params).courseId);
  if (isNaN(courseId)) redirect("/performance");

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <CoursePerformance courseId={courseId} />
    </div>
  );
};

export default CoursePerformancePage;
