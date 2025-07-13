import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Climbing specific fields
  currentLayer: integer("current_layer").default(1),
  whistleLevel: integer("whistle_level").default(1),
  totalXP: integer("total_xp").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Climbing sessions
export const climbingSessions = pgTable("climbing_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionType: varchar("session_type").notNull(), // 'indoor', 'outdoor'
  location: varchar("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  pausedAt: timestamp("paused_at"), // When session was paused
  resumedAt: timestamp("resumed_at"), // When session was resumed
  totalPausedTime: integer("total_paused_time").default(0), // Total time paused in minutes
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  xpEarned: integer("xp_earned").default(0),
  status: varchar("status").default("active"), // active, paused, completed
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual boulder problems in sessions
export const boulderProblems = pgTable("boulder_problems", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => climbingSessions.id).notNull(),
  grade: varchar("grade").notNull(), // V0, V1, etc.
  gradeSystem: varchar("grade_system").default("V-Scale"), // V-Scale, Font, German
  style: varchar("style"), // crimps, dynos, overhangs, etc.
  holdType: varchar("hold_type"), // crimps, slopers, pinches, jugs, etc.
  wallAngle: varchar("wall_angle"), // overhang, vertical, slab
  completed: boolean("completed").default(false),
  attempts: integer("attempts").default(1),
  xpEarned: integer("xp_earned").default(0), // XP earned from this problem
  notes: text("notes"),
  skillsGained: jsonb("skills_gained").default('{}'), // Track which skills were practiced
  createdAt: timestamp("created_at").defaultNow(),
});

// Quests based on Abyss layers
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  layer: integer("layer").notNull(), // 1-7
  difficulty: varchar("difficulty").notNull(),
  difficultyRating: integer("difficulty_rating").default(1), // 1-10 numeric rating
  xpReward: integer("xp_reward").notNull(),
  requirements: jsonb("requirements").notNull(), // JSON object with quest requirements
  status: varchar("status").default("active"), // active, completed, failed, discarded
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress").notNull(),
  questType: varchar("quest_type").default("daily"), // daily, weekly, layer
  generatedByAi: boolean("generated_by_ai").default(true),
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements and milestones
// Skills table for tracking climbing abilities (4 main categories with subcategories)
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  category: varchar("category").notNull(), // Movement, Technique, Strength, Mind
  skillType: varchar("skill_type").notNull(), // dynos, crimps, slabs, overhangs, etc.
  maxGrade: varchar("max_grade").default("V0"), // Highest grade achieved in this skill
  totalProblems: integer("total_problems").default(0),
  bestSession: integer("best_session").default(0), // Reference to session with best performance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: varchar("achievement_id").notNull(), // unique identifier for achievement type
  type: varchar("type").notNull(), // quest, session, skill, progression, etc.
  title: varchar("title").notNull(),
  description: text("description"),
  icon: varchar("icon").default("trophy"), // Font Awesome icon name
  category: varchar("category").notNull(), // Explorer, Climber, Master, etc.
  xpReward: integer("xp_reward").default(0),
  isUnlocked: boolean("is_unlocked").default(true),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User titles system
export const userTitles = pgTable("user_titles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  titleName: varchar("title_name").notNull(),
  titleCategory: varchar("title_category").notNull(),
  xpRequired: integer("xp_required").notNull(),
  requirement: text("requirement").notNull(),
  isActive: boolean("is_active").default(false),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(climbingSessions),
  quests: many(quests),
  achievements: many(achievements),
  skills: many(skills),
  titles: many(userTitles),
}));

export const climbingSessionsRelations = relations(climbingSessions, ({ one, many }) => ({
  user: one(users, { fields: [climbingSessions.userId], references: [users.id] }),
  problems: many(boulderProblems),
}));

export const boulderProblemsRelations = relations(boulderProblems, ({ one }) => ({
  session: one(climbingSessions, { fields: [boulderProblems.sessionId], references: [climbingSessions.id] }),
}));

export const questsRelations = relations(quests, ({ one }) => ({
  user: one(users, { fields: [quests.userId], references: [users.id] }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  user: one(users, { fields: [skills.userId], references: [users.id] }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, { fields: [achievements.userId], references: [users.id] }),
}));

export const userTitlesRelations = relations(userTitles, ({ one }) => ({
  user: one(users, { fields: [userTitles.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertClimbingSessionSchema = createInsertSchema(climbingSessions, {
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
});
export const insertBoulderProblemSchema = createInsertSchema(boulderProblems);
export const insertQuestSchema = createInsertSchema(quests);
export const insertSkillSchema = createInsertSchema(skills);
export const insertAchievementSchema = createInsertSchema(achievements);
export const insertUserTitleSchema = createInsertSchema(userTitles);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertClimbingSession = z.infer<typeof insertClimbingSessionSchema>;
export type ClimbingSession = typeof climbingSessions.$inferSelect;
export type InsertBoulderProblem = z.infer<typeof insertBoulderProblemSchema>;
export type BoulderProblem = typeof boulderProblems.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type Quest = typeof quests.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertUserTitle = z.infer<typeof insertUserTitleSchema>;
export type UserTitle = typeof userTitles.$inferSelect;
