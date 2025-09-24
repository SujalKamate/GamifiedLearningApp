import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  goals: text("goals", { mode: "json" }), // Array of goals
  preferences: text("preferences", { mode: "json" }), // Object with subjects array
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const learningProgress = sqliteTable('learning_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(), // 'coding', 'vocab', 'finance'
  currentLevel: integer('current_level').notNull().default(1),
  totalScore: integer('total_score').notNull().default(0),
  achievements: text('achievements', { mode: 'json' }),
  offlineSync: integer('offline_sync', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at').notNull(),
});

export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  achievements: text('achievements', { mode: 'json' }),
  playTime: integer('play_time').notNull(), // minutes
  createdAt: text('created_at').notNull(),
});

export const quizzes = sqliteTable('quizzes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subject: text('subject').notNull(), // 'coding', 'vocab', 'finance'
  question: text('question').notNull(),
  options: text('options', { mode: 'json' }).notNull(),
  correctAnswer: integer('correct_answer').notNull(),
  difficulty: integer('difficulty').notNull(),
  antiCheatFlags: text('anti_cheat_flags', { mode: 'json' }),
});

// Add new achievements table
export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  type: text('type').notNull(), // 'streak', 'level', 'quiz', 'milestone'
  criteria: text('criteria', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
});

// Add user_achievements junction table
export const userAchievements = sqliteTable('user_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id').notNull().references(() => achievements.id),
  awardedAt: text('awarded_at').notNull(),
});

// Add leaderboard table
export const leaderboard = sqliteTable('leaderboard', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  xp: integer('xp').notNull().default(0),
  rank: integer('rank').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

// Add questions table
export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quizId: integer('quiz_id').notNull().references(() => quizzes.id),
  text: text('text').notNull(),
  options: text('options', { mode: 'json' }).notNull(),
  correctIndex: integer('correct_index').notNull(),
  explanation: text('explanation'),
});