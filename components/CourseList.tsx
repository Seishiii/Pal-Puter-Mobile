import { getCoursesWithQuizPerformances } from "@/db/queries";
import Image from "next/image";
import Link from "next/link";

const CourseList = async () => {
  const courses = await getCoursesWithQuizPerformances();

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-23 h-23 mx-auto mb-4">
          <Image
            src="/mascot_sad.PNG"
            alt="Sad Mascot"
            height={100}
            width={100}
          />
        </div>
        <h3 className="text-xl font-medium text-white">No quiz attempts yet</h3>
        <p className="text-white mt-2">
          Complete quizzes to see your performance
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {courses.map((course) => (
        <Link key={course.id} href={`/performance/courses/${course.id}`}>
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-purple-300 hover:bg-purple-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16">
                <Image
                  src={course.imageSrc}
                  alt="Course Image"
                  width={70}
                  height={70}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-purple-800">
                  {course.title}
                </h3>
                <div className="flex flex-col justify-between mt-2">
                  <div className="flex gap-x-2">
                    <p className="text-sm text-black">Quiz Attempts: </p>
                    <p className="text-sm text-gray-700">{course.quizCount}</p>
                  </div>
                  <div className="flex gap-x-2">
                    <p className="text-sm text-black">Average Score: </p>
                    <p className="text-sm text-gray-700">
                      {course.averageScore}%
                    </p>
                  </div>
                  <div className="flex gap-x-2">
                    <p className="text-sm text-black">Highest Score: </p>
                    <p className="text-sm text-gray-700">
                      {course.highestScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CourseList;
