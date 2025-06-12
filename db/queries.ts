import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import db from "./drizzle";
import { and, desc, eq, exists } from "drizzle-orm";
import {
  courseProgress,
  courses,
  quizPerformance,
  subtopics,
  topics,
} from "./schema";

export const formatSeconds = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const getCoursesWithQuizPerformances = cache(async () => {
  //Get userId from clerk
  const { userId } = await auth();
  //Make sure that there's a user
  if (!userId) {
    return null;
  }

  return db.query.courses
    .findMany({
      with: {
        topics: {
          with: {
            subtopics: {
              where: eq(subtopics.isQuiz, true),
              with: {
                quizPerformances: {
                  where: eq(quizPerformance.userId, userId),
                },
              },
            },
          },
        },
      },
    })
    .then(
      (courses) =>
        courses
          .map((course) => {
            // Flatten all quiz performances for this course
            const allPerformances = course.topics.flatMap((topic) =>
              topic.subtopics.flatMap((subtopic) => subtopic.quizPerformances)
            );

            if (allPerformances.length === 0) {
              return {
                ...course,
                quizCount: 0,
                averageScore: 0,
                highestScore: 0,
              };
            }

            const totalScore = allPerformances.reduce(
              (sum, perf) => sum + perf.score,
              0
            );
            const averageScore = Math.round(
              totalScore / allPerformances.length
            );
            const highestScore = Math.max(
              ...allPerformances.map((p) => p.score)
            );

            return {
              ...course,
              quizCount: allPerformances.length,
              averageScore,
              highestScore,
            };
          })
          .filter((course) => course.quizCount > 0) //Only show courses with quizzes
    );
});

export const getOverallQuizStats = cache(async () => {
  //Get userId from clerk
  const { userId } = await auth();
  //Make sure that there's a user
  if (!userId) {
    return {
      overallPercentage: 0,
      totalAttempts: 0,
      highestScore: 0,
      passRate: 0,
    };
  }

  const performances = await db.query.quizPerformance.findMany({
    where: eq(quizPerformance.userId, userId),
  });

  if (performances.length === 0) {
    return {
      overallPercentage: 0,
      totalAttempts: 0,
      highestScore: 0,
      passRate: 0,
    };
  }

  const totalScore = performances.reduce((sum, perf) => sum + perf.score, 0);
  const overallPercentage = Math.round(totalScore / performances.length);
  const highestScore = Math.max(...performances.map((p) => p.score));
  const passRate = Math.round(
    (performances.filter((p) => p.passed).length / performances.length) * 100
  );

  return {
    overallPercentage,
    totalAttempts: performances.length,
    highestScore,
    passRate,
  };
});

export const getCourseQuizPerformances = cache(async (courseId: number) => {
  //Get userId from clerk
  const { userId } = await auth();
  //Make sure that there's a user
  if (!userId) {
    return { course: null, subtopicsRes: [] };
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { id: true, title: true },
  });

  if (!course) {
    return { course: null, subtopicsRes: [] };
  }

  // Get all subtopics with quiz performances for this course
  const subtopicsWithPerformances = await db.query.subtopics.findMany({
    where: and(
      eq(subtopics.isQuiz, true),
      exists(
        db
          .select()
          .from(topics)
          .where(
            and(eq(topics.id, subtopics.topicId), eq(topics.courseId, courseId))
          )
      )
    ),
    with: {
      topic: true,
      quizPerformances: {
        where: eq(quizPerformance.userId, userId),
        orderBy: [desc(quizPerformance.createdAt)],
      },
    },
  });

  // Add calculated stats to each subtopic
  const subtopicsRes = subtopicsWithPerformances.map((subtopic) => {
    const performances = subtopic.quizPerformances;
    const totalScore = performances.reduce((sum, perf) => sum + perf.score, 0);
    const averageScore = performances.length
      ? Math.round(totalScore / performances.length)
      : 0;

    return {
      ...subtopic,
      averageScore,
      quizCount: performances.length,
    };
  });

  return {
    course,
    subtopicsRes,
  };
});

export const getUserCertificates = cache(async () => {
  //Get userId from clerk
  const { userId } = await auth();
  //Make sure that there's a user
  if (!userId) {
    return [];
  }

  return db.query.courseProgress
    .findMany({
      where: and(
        eq(courseProgress.userId, userId),
        eq(courseProgress.isIssued, true)
      ),
      with: {
        course: {
          columns: { title: true },
        },
        certificate: true,
      },
    })
    .then((data) =>
      data
        .filter((progress) => progress.certificate)
        .map((progress) => ({
          id: progress.certificate!.id,
          courseTitle: progress.course.title,
          issuedAt: progress.certificate!.issuedAt,
          hash: progress.certificate!.hash,
          fileName: progress.certificate!.fileName,
        }))
    );
});
