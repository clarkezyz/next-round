import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { createNewCoaster, batchCreateCoasters } from "@/server/utils/coaster-utils";
import { TRPCError } from "@trpc/server";

export const coasterRouter = createTRPCRouter({
  // Admin procedures for creating coasters
  create: protectedProcedure
    .input(z.object({
      artworkId: z.string(),
      venueId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Add admin check here
      const coaster = await createNewCoaster(input.artworkId, input.venueId);
      return coaster;
    }),

  batchCreate: protectedProcedure
    .input(z.object({
      artworkId: z.string(),
      count: z.number().min(1).max(100), // Limit batch size
      venueId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Add admin check here
      const coasters = await batchCreateCoasters(
        input.artworkId,
        input.count,
        input.venueId
      );
      return coasters;
    }),

  // Public procedures
  getByCode: publicProcedure
    .input(z.object({
      code: z.string().length(4),
    }))
    .query(async ({ ctx, input }) => {
      const coaster = await ctx.db.coaster.findUnique({
        where: { qrCode: input.code },
        include: {
          artwork: {
            include: {
              artist: {
                select: {
                  name: true,
                },
              },
            },
          },
          venue: true,
          scans: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!coaster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coaster not found",
        });
      }

      return coaster;
    }),

  // Previous procedures remain unchanged
  getLatestArtwork: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.artwork.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        artist: {
          select: {
            name: true,
          },
        },
      },
    });
  }),

  scanCoaster: protectedProcedure
    .input(z.object({ 
      qrCode: z.string(),
      location: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Find the coaster
      const coaster = await ctx.db.coaster.findUnique({
        where: { qrCode: input.qrCode },
        include: { artwork: true },
      });

      if (!coaster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coaster not found",
        });
      }

      // Check daily scan limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const scanCount = await ctx.db.dailyScanCount.findUnique({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: today,
          },
        },
      });

      if (scanCount && scanCount.count >= 5) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Daily scan limit reached",
        });
      }

      // Check if this is the first scan
      const existingScan = await ctx.db.scan.findFirst({
        where: { coasterId: coaster.id },
      });

      const isFirstScan = !existingScan;
      const pointsEarned = isFirstScan ? 10 : 1;

      // Create the scan
      const scan = await ctx.db.scan.create({
        data: {
          userId: ctx.session.user.id,
          coasterId: coaster.id,
          isFirstScan,
          pointsEarned,
          location: input.location,
        },
      });

      // Update or create daily scan count
      await ctx.db.dailyScanCount.upsert({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: today,
          },
        },
        update: {
          count: { increment: 1 },
        },
        create: {
          userId: ctx.session.user.id,
          date: today,
          count: 1,
        },
      });

      // Update user points
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          points: { increment: pointsEarned },
        },
      });

      return {
        scan,
        isFirstScan,
        pointsEarned,
        artwork: coaster.artwork,
      };
    }),

  getUserScans: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.scan.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        coaster: {
          include: {
            artwork: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});