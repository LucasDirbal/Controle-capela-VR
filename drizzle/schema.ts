import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Members table - stores chapel members and their order in the rotation
 */
export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  /** Order in the rotation (0-indexed, 0 is first in line) */
  rotationOrder: int("rotationOrder").notNull().default(0),
  /** Whether this member is active in the rotation */
  isActive: int("isActive").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

/**
 * Chapel tracking - tracks current location of the chapel
 */
export const chapelTracking = mysqlTable("chapelTracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Current member responsible for the chapel */
  currentMemberId: int("currentMemberId"),
  /** When the chapel arrived at current member */
  startDate: timestamp("startDate").notNull(),
  /** Notes about the current location */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChapelTracking = typeof chapelTracking.$inferSelect;
export type InsertChapelTracking = typeof chapelTracking.$inferInsert;

/**
 * Chapel history - records of past chapel rotations
 */
export const chapelHistory = mysqlTable("chapelHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  memberId: int("memberId").notNull(),
  /** When the chapel arrived */
  startDate: timestamp("startDate").notNull(),
  /** When the chapel left (null if still with member) */
  endDate: timestamp("endDate"),
  /** Notes about this period */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChapelHistory = typeof chapelHistory.$inferSelect;
export type InsertChapelHistory = typeof chapelHistory.$inferInsert;

/**
 * Notifications - tracks notifications sent to members
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  memberId: int("memberId").notNull(),
  /** Type of notification: 'reminder', 'arrival', 'departure' */
  type: varchar("type", { length: 50 }).notNull(),
  /** Notification message */
  message: text("message"),
  /** When the notification was sent */
  sentAt: timestamp("sentAt"),
  /** When the notification was scheduled for */
  scheduledFor: timestamp("scheduledFor"),
  /** Whether notification was successfully sent */
  isSent: int("isSent").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;