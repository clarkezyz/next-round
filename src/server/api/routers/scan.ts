import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { isValidCode } from "@/server/utils/code-generator";

export const scanRouter = createTRPCRouter({
  processCoasterScan: publicProcedure
    .input(z.object({
      code: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Validate code format
      if (!isValidCode(input.code)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid coaster code"
        });
      }

      // Find the coaster and its current state
      const coaster = await ctx.db.coaster.findUnique({
        where: { qrCode: input.code },
        include: {
          artwork: true,
          scans: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      });

      if (!coaster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coaster not found"
        });
      }

      // Check if this is the first scan
      const isFirstScan = coaster.scans.length === 0;

      // If it's the first scan, publish the artwork
      if (isFirstScan) {
        await ctx.db.artwork.update({
          where: { id: coaster.artworkId },
          data: { status: "APPROVED" },
        });
      }

      // Check if user has any previous sessions (for guest comment eligibility)
      // We'll implement this logic based on our auth setup

      // Return scan results
      return {
        isFirstScan,
        coaster,
        artwork: coaster.artwork,
        // We'll include session info here once we implement that part
      };
    }),
});