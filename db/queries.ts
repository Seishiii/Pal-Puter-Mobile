import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import db from "./drizzle";
import { and, desc, eq, exists, inArray, sql } from "drizzle-orm";
import {
  courseProgress,
  courses,
  quizPerformance,
  slideProgress,
  subtopics,
  topics,
  userProgress,
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

export const getUserProgress = cache(async () => {
  //Get userId from clerk
  const { userId } = await auth();
  //Make sure that there's a user
  if (!userId) {
    return null;
  }
  //Get the progress associated with the user
  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  return data;
});

export const getTopics = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();
  //Check if there's active course id or a user, if not, return no topics
  if (!userId || !userProgress?.activeCourseId) {
    return [];
  }

  //Get all the information within the active course
  const data = await db.query.topics.findMany({
    orderBy: (topics, { asc }) => [asc(topics.order)],
    where: eq(topics.courseId, userProgress.activeCourseId),
    with: {
      subtopics: {
        orderBy: (subtopics, { asc }) => [asc(subtopics.order)],
        with: {
          slides: {
            orderBy: (slides, { asc }) => [asc(slides.order)],
            with: {
              slideProgresses: {
                where: eq(slideProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  //Get all the slide progress within the topic and check whether they're completed or not
  const normalizedData = data.map((topic) => {
    const subtopicsWithCompletedStatus = topic.subtopics.map((subtopic) => {
      //Early check if there is no slides for the subtopic
      if (subtopic.slides.length === 0) {
        return { ...subtopic, completed: false };
      }

      const allCompletedSlides = subtopic.slides.every((slide) => {
        return (
          slide.slideProgresses &&
          slide.slideProgresses.length > 0 &&
          slide.slideProgresses.every((progress) => progress.completed)
        );
      });

      return { ...subtopic, completed: allCompletedSlides };
    });
    return { ...topic, subtopics: subtopicsWithCompletedStatus };
  });

  let quizScores: Record<number, number> = {};

  if (userId) {
    // Get all quiz subtopic IDs in this course
    const quizSubtopicIds = normalizedData.flatMap((topic) =>
      topic.subtopics.filter((st) => st.isQuiz).map((st) => st.id)
    );

    if (quizSubtopicIds.length > 0) {
      // Get max attempt numbers for each subtopic
      const maxAttempts = await db
        .select({
          subtopicId: quizPerformance.subtopicId,
          maxAttempt: sql<number>`MAX(${quizPerformance.attemptNumber})`,
        })
        .from(quizPerformance)
        .where(
          and(
            eq(quizPerformance.userId, userId),
            inArray(quizPerformance.subtopicId, quizSubtopicIds)
          )
        )
        .groupBy(quizPerformance.subtopicId);

      // Get scores for these max attempts
      const latestScores = await db
        .select({
          subtopicId: quizPerformance.subtopicId,
          score: quizPerformance.score,
        })
        .from(quizPerformance)
        .where(
          and(
            eq(quizPerformance.userId, userId),
            inArray(
              quizPerformance.subtopicId,
              maxAttempts.map((ma) => ma.subtopicId)
            ),
            inArray(
              quizPerformance.attemptNumber,
              maxAttempts.map((ma) => ma.maxAttempt)
            )
          )
        );

      quizScores = Object.fromEntries(
        latestScores.map((score) => [score.subtopicId, score.score])
      );
    }
  }

  // Attach scores to subtopics
  const result = normalizedData.map((topic) => ({
    ...topic,
    subtopics: topic.subtopics.map((subtopic) => ({
      ...subtopic,
      latestScore: subtopic.isQuiz ? quizScores[subtopic.id] : undefined,
    })),
  }));

  return result;
});

export const getCourseProgress = cache(async () => {
  console.log("Course Progress is called");
  const { userId } = await auth();
  const userProgress = await getUserProgress();
  //Check if there's a user or an active course, otherwise return nothing
  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }

  //Getting all the topics within the active course along with their progresses in the slides
  const topicsInActiveCourse = await db.query.topics.findMany({
    orderBy: (topics, { asc }) => [asc(topics.order)],
    where: eq(topics.courseId, userProgress.activeCourseId),
    with: {
      subtopics: {
        orderBy: (subtopics, { asc }) => [asc(subtopics.order)],
        with: {
          topic: true,
          slides: {
            with: {
              slideProgresses: {
                where: eq(slideProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  //Finding the first uncompleted subtopic
  const firstUncompletedSubtopic = topicsInActiveCourse
    .flatMap((topic) => topic.subtopics)
    .find((subtopic) => {
      return subtopic.slides.some((slide) => {
        return (
          !slide.slideProgresses ||
          slide.slideProgresses.length === 0 ||
          slide.slideProgresses.some((progress) => progress.completed === false)
        );
      });
    });

  return {
    activeSubtopic: firstUncompletedSubtopic,
    activeSubtopicId: firstUncompletedSubtopic?.id,
  };
});
