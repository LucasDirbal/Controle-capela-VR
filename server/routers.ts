import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getActiveMembers,
  createMember,
  updateMember,
  deleteMember,
  reorderMembers,
  getCurrentChapelLocation,
  updateChapelLocation,
  generateCalendar,
  getChapelHistory,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chapel: router({
    // Members management
    members: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return getActiveMembers(ctx.user.id);
      }),
      create: protectedProcedure
        .input(
          z.object({
            name: z.string().min(1),
            email: z.string().email().optional(),
            phone: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          return createMember(
            ctx.user.id,
            input.name,
            input.email,
            input.phone
          );
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...data } = input;
          return updateMember(id, data);
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          return deleteMember(input.id);
        }),
      reorder: protectedProcedure
        .input(z.object({ memberIds: z.array(z.number()) }))
        .mutation(async ({ ctx, input }) => {
          return reorderMembers(ctx.user.id, input.memberIds);
        }),
    }),

    // Chapel tracking
    tracking: router({
      current: protectedProcedure.query(async ({ ctx }) => {
        const tracking = await getCurrentChapelLocation(ctx.user.id);
        if (!tracking) return null;

        const members = await getActiveMembers(ctx.user.id);
        const member = members.find((m) => m.id === tracking.currentMemberId);

        return { ...tracking, member };
      }),
      update: protectedProcedure
        .input(
          z.object({
            memberId: z.number(),
            notes: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          return updateChapelLocation(
            ctx.user.id,
            input.memberId,
            input.notes
          );
        }),
    }),

    // Calendar generation
    calendar: router({
      generate: protectedProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(async ({ ctx, input }) => {
          return generateCalendar(ctx.user.id, input.days);
        }),
    }),

    // History
    history: router({
      list: protectedProcedure
        .input(z.object({ limit: z.number().default(50) }))
        .query(async ({ ctx, input }) => {
          return getChapelHistory(ctx.user.id, input.limit);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
