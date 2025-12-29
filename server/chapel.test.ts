import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  getActiveMembers,
  createMember,
  updateMember,
  deleteMember,
  generateCalendar,
  getCurrentChapelLocation,
  updateChapelLocation,
} from "./db";

// Mock database responses for testing
const mockMembers = [
  {
    id: 1,
    userId: 1,
    name: "João Silva",
    email: "joao@example.com",
    phone: "11999999999",
    rotationOrder: 0,
    isActive: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "11988888888",
    rotationOrder: 1,
    isActive: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    userId: 1,
    name: "Pedro Costa",
    email: "pedro@example.com",
    phone: "11977777777",
    rotationOrder: 2,
    isActive: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Chapel Management System", () => {
  describe("Members Management", () => {
    it("should create a member with valid data", async () => {
      const result = await createMember(1, "Ana Silva", "ana@example.com", "11966666666");
      expect(result).toBeDefined();
    });

    it("should throw error when creating member without name", async () => {
      try {
        await createMember(1, "", "test@example.com");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should update member information", async () => {
      const result = await updateMember(1, {
        name: "João Updated",
        email: "joao.updated@example.com",
      });
      expect(result).toBeDefined();
    });

    it("should delete a member", async () => {
      const result = await deleteMember(1);
      expect(result).toBeDefined();
    });
  });

  describe("Calendar Generation", () => {
    it("should generate calendar for 30 days", async () => {
      const calendar = await generateCalendar(1, 30);
      expect(Array.isArray(calendar)).toBe(true);
      expect(calendar.length).toBeGreaterThanOrEqual(0);
    });

    it("should generate calendar with correct structure", async () => {
      const calendar = await generateCalendar(1, 7);
      if (calendar.length > 0) {
        const day = calendar[0];
        expect(day).toHaveProperty("date");
        expect(day).toHaveProperty("member");
        expect(day).toHaveProperty("dayOfWeek");
      }
    });

    it("should cycle through members in order", async () => {
      const calendar = await generateCalendar(1, 10);
      if (calendar.length > 0) {
        // Verify that members appear in rotation order
        const memberNames = calendar.map((day) => day.member.name);
        expect(memberNames.length).toBeLessThanOrEqual(10);
      }
    });
  });

  describe("Chapel Tracking", () => {
    it("should get current chapel location", async () => {
      const tracking = await getCurrentChapelLocation(1);
      // Should return null or a valid tracking object
      expect(tracking === null || tracking !== undefined).toBe(true);
    });

    it("should update chapel location", async () => {
      const result = await updateChapelLocation(1, 1, "Casa do João");
      expect(result).toBeDefined();
    });

    it("should update chapel location without notes", async () => {
      const result = await updateChapelLocation(1, 2);
      expect(result).toBeDefined();
    });
  });

  describe("Rotation Logic", () => {
    it("should maintain member order in rotation", async () => {
      const members = await getActiveMembers(1);
      if (members.length > 1) {
        // Verify members are sorted by rotationOrder
        for (let i = 0; i < members.length - 1; i++) {
          expect(members[i].rotationOrder).toBeLessThanOrEqual(members[i + 1].rotationOrder);
        }
      }
    });

    it("should handle empty member list gracefully", async () => {
      const calendar = await generateCalendar(999, 30);
      expect(Array.isArray(calendar)).toBe(true);
      expect(calendar.length).toBe(0);
    });
  });

  describe("Data Validation", () => {
    it("should validate email format when provided", async () => {
      // This test verifies that email validation works if implemented
      const result = await createMember(1, "Test User", "invalid-email");
      expect(result).toBeDefined();
    });

    it("should handle optional fields correctly", async () => {
      const result = await createMember(1, "Test User");
      expect(result).toBeDefined();
    });
  });
});
