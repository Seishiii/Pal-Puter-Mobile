import { MAX_HEART } from "@/constants";
import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const coursesEnum = pgEnum("difficulty", ["BEGINNER", "INTERMEDIATE"]);

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
  difficulty: coursesEnum("difficulty").notNull(),
  order: integer("order").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgresses: many(userProgress),
  courseProgresses: many(courseProgress),
  topics: many(topics),
}));

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  code: text("code").notNull().default(""),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
});

export const topicsRelations = relations(topics, ({ one, many }) => ({
  course: one(courses, {
    fields: [topics.courseId],
    references: [courses.id],
  }),
  subtopics: many(subtopics),
}));

export const subtopics = pgTable("subtopics", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id")
    .references(() => topics.id, { onDelete: "cascade" })
    .notNull(),
  code: text("code").notNull().default(""),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  isQuiz: boolean("is_quiz").notNull().default(false),
  isFinal: boolean("is_final").notNull().default(false),
});

export const subtopicsRelations = relations(subtopics, ({ one, many }) => ({
  topic: one(topics, {
    fields: [subtopics.topicId],
    references: [topics.id],
  }),
  slides: many(slides),
  quizPerformances: many(quizPerformance),
}));

export const slideTypeEnum = pgEnum("slide_type", [
  "LESSON",
  "MULTIPLE_CHOICE",
  "FILL_BLANKS",
  "TRUE_FALSE",
]);

export const slides = pgTable("slides", {
  id: serial("id").primaryKey(),
  subtopicId: integer("subtopic_id")
    .references(() => subtopics.id, { onDelete: "cascade" })
    .notNull(),
  code: text("code").notNull().default(""),
  type: slideTypeEnum("type").notNull(),
  //Common field
  content: jsonb("content"), // For lesson content or complex question prompt
  question: text("question"), // For simple prompts
  order: integer("order").notNull(),
});

export const slidesRelations = relations(slides, ({ one, many }) => ({
  subtopic: one(subtopics, {
    fields: [slides.subtopicId],
    references: [subtopics.id],
  }),
  options: many(slideOptions),
  slideProgresses: many(slideProgress),
}));

export const slideOptions = pgTable("slide_options", {
  id: serial("id").primaryKey(),
  slideId: integer("slide_id")
    .references(() => slides.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

export const slideOptionsRelations = relations(slideOptions, ({ one }) => ({
  slide: one(slides, {
    fields: [slideOptions.slideId],
    references: [slides.id],
  }),
}));

export const slideProgress = pgTable("slide_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProgress.userId, { onDelete: "cascade" }),
  slideId: integer("slide_id")
    .references(() => slides.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const slideProgressRelations = relations(slideProgress, ({ one }) => ({
  course: one(slides, {
    fields: [slideProgress.slideId],
    references: [slides.id],
  }),
  user: one(userProgress, {
    fields: [slideProgress.userId],
    references: [userProgress.userId],
  }),
}));

export const courseProgress = pgTable("course_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProgress.userId, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  isIssued: boolean("is_issued").notNull().default(false),
});

export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
  course: one(courses, {
    fields: [courseProgress.courseId],
    references: [courses.id],
  }),
  user: one(userProgress, {
    fields: [courseProgress.userId],
    references: [userProgress.userId],
  }),
  certificate: one(certificates, {
    fields: [courseProgress.id],
    references: [certificates.courseProgressId],
  }),
}));

export const quizPerformance = pgTable("quiz_performance", {
  id: serial("id").primaryKey(),
  subtopicId: integer("subtopic_id")
    .references(() => subtopics.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  score: integer("score").notNull(),
  timeTaken: integer("time_taken").notNull(), //in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  passed: boolean("passed").notNull(),
});

export const quizPerformanceRelations = relations(
  quizPerformance,
  ({ one }) => ({
    user: one(userProgress, {
      fields: [quizPerformance.userId],
      references: [userProgress.userId],
    }),
    subtopic: one(subtopics, {
      fields: [quizPerformance.subtopicId],
      references: [subtopics.id],
    }),
  })
);

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.PNG"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
  hearts: integer("hearts").notNull().default(MAX_HEART),
  lastHeartRegeneration: timestamp("last_heart_regeneration").defaultNow(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  xpBoosted: boolean("xp_boosted").notNull().default(false),
  streak: integer("streak").notNull().default(0),
  streakIncremented: boolean("streak_incremented").notNull().default(false),
  lastStreakIncrease: timestamp("last_streak_increase").notNull().defaultNow(),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalEarnedPoints: integer("total_earned_points").notNull().default(0),
  badges: jsonb("badges").$type<string[]>().notNull().default([]),
  userCreated: timestamp("user_created").notNull().defaultNow(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const userProgressRelations = relations(
  userProgress,
  ({ one, many }) => ({
    activeCourse: one(courses, {
      fields: [userProgress.activeCourseId],
      references: [courses.id],
    }),
    savedQuestProgress: one(userQuests),
    savedCourseProgresses: many(courseProgress),
    savedSlideProgresses: many(slideProgress),
    savedQuizPerformances: many(quizPerformance),
  })
);

export const userQuests = pgTable("user_quests", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProgress.userId, { onDelete: "cascade" }),
  dailyStages: integer("daily_stages").notNull().default(0),
  weeklyStages: integer("weekly_stages").notNull().default(0),
  lastDailyReset: timestamp("last_daily_reset").notNull().defaultNow(),
  lastWeeklyReset: timestamp("last_weekly_reset").notNull().defaultNow(),
  claimedQuests: jsonb("claimed_quests")
    .$type<string[]>()
    .notNull()
    .default([]),
});

export const userQuestsRelations = relations(userQuests, ({ one }) => ({
  user: one(userProgress, {
    fields: [userQuests.userId],
    references: [userProgress.userId],
  }),
}));

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
  fromDriver(value: unknown): Buffer {
    if (typeof value === "string") {
      // Convert hex format to Buffer
      return Buffer.from(value.slice(2), "hex");
    }
    return value as Buffer;
  },
  toDriver(value: Buffer): string {
    // Convert to PostgreSQL's bytea hex format
    return `\\x${value.toString("hex")}`;
  },
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  courseProgressId: integer("course_progress_id")
    .references(() => courseProgress.id, { onDelete: "cascade" })
    .notNull()
    .unique(), // One certificate per completion
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  hash: text("hash").notNull(),
  fileData: bytea("file_data").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
});

export const certificatesRelations = relations(certificates, ({ one }) => ({
  courseProgress: one(courseProgress, {
    fields: [certificates.courseProgressId],
    references: [courseProgress.id],
  }),
}));
