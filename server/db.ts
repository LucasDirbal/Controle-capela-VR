import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, members as membersTable, chapelTracking, chapelHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Members queries
 */
export async function getMembersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(membersTable).where(eq(membersTable.userId, userId));
}

export async function getActiveMembers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(membersTable)
    .where(eq(membersTable.userId, userId))
    .orderBy(membersTable.rotationOrder);
}

export async function createMember(
  userId: number,
  name: string,
  email?: string,
  phone?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the next rotation order
  const lastMember = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.userId, userId))
    .orderBy(desc(membersTable.rotationOrder))
    .limit(1);

  const nextOrder = lastMember.length > 0 ? lastMember[0].rotationOrder + 1 : 0;

  const result = await db.insert(membersTable).values({
    userId,
    name,
    email,
    phone,
    rotationOrder: nextOrder,
    isActive: 1,
  });

  return result;
}

export async function updateMember(
  memberId: number,
  data: { name?: string; email?: string; phone?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(membersTable)
    .set(data)
    .where(eq(membersTable.id, memberId));
}

export async function deleteMember(memberId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(membersTable).where(eq(membersTable.id, memberId));
}

export async function reorderMembers(
  userId: number,
  memberIds: number[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update each member with their new order
  for (let i = 0; i < memberIds.length; i++) {
    await db
      .update(membersTable)
      .set({ rotationOrder: i })
      .where(eq(membersTable.id, memberIds[i]));
  }
}

/**
 * Chapel tracking queries
 */
export async function getCurrentChapelLocation(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(chapelTracking)
    .where(eq(chapelTracking.userId, userId))
    .orderBy(desc(chapelTracking.startDate))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateChapelLocation(
  userId: number,
  memberId: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current tracking
  const current = await getCurrentChapelLocation(userId);

  // If there's a current location, move it to history
  if (current && current.currentMemberId) {
    await db.insert(chapelHistory).values({
      userId,
      memberId: current.currentMemberId,
      startDate: current.startDate,
      endDate: new Date(),
      notes: current.notes,
    });
  }

  // Update or create tracking
  if (current) {
    return db
      .update(chapelTracking)
      .set({
        currentMemberId: memberId,
        startDate: new Date(),
        notes,
      })
      .where(eq(chapelTracking.userId, userId));
  } else {
    return db.insert(chapelTracking).values({
      userId,
      currentMemberId: memberId,
      startDate: new Date(),
      notes,
    });
  }
}

/**
 * Chapel history queries
 */
export async function getChapelHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chapelHistory)
    .where(eq(chapelHistory.userId, userId))
    .orderBy(desc(chapelHistory.startDate))
    .limit(limit);
}

/**
 * Generate calendar for next N days
 */
export async function generateCalendar(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  // Get all active members in order
  const allMembers = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.userId, userId))
    .orderBy(membersTable.rotationOrder);

  if (allMembers.length === 0) return [];

  // Get current location
  const current = await getCurrentChapelLocation(userId);
  let currentIndex = 0;

  if (current && current.currentMemberId) {
    currentIndex = allMembers.findIndex(
      (m: typeof allMembers[0]) => m.id === current.currentMemberId
    );
    if (currentIndex === -1) currentIndex = 0;
  }

  // Generate calendar
  const calendar = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const memberIndex = (currentIndex + i) % allMembers.length;
    const member = allMembers[memberIndex];

    calendar.push({
      date,
      member,
      dayOfWeek: date.toLocaleDateString("pt-BR", { weekday: "long" }),
    });
  }

  return calendar;
}
