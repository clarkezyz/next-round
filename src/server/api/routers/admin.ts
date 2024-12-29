import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Check if user is admin
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Get all the stats in parallel
      const [
        totalCoasters,
        pendingArtwork,
        activeVenues,
        totalScans,
      ] = await Promise.all([
        // Total coasters
        ctx.db.coaster.count(),
        
        // Pending artwork submissions
        ctx.db.artwork.count({
          where: { status: "PENDING" },
        }),
        
        // Active venues
        ctx.db.venue.count({
          where: { status: "ACTIVE" },
        }),
        
        // Total scans
        ctx.db.scan.count(),
      ]);

      // Recent activity - last 5 scans with details
      const recentActivity = await ctx.db.scan.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          coaster: {
            include: {
              artwork: true,
              venue: true,
            },
          },
        },
      });

      // Top venues by scan count
      const topVenues = await ctx.db.venue.findMany({
        take: 5,
        where: { status: "ACTIVE" },
        orderBy: {
          totalScans: "desc",
        },
      });

      // Popular artwork by scan count
      const popularArtwork = await ctx.db.artwork.findMany({
        take: 5,
        include: {
          coasters: {
            include: {
              scans: true,
            },
          },
        },
        orderBy: {
          coasters: {
            _count: "desc",
          },
        },
      });

      // User growth - count of users created per day for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const userGrowth = await ctx.db.user.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        _count: true,
      });

      return {
        stats: {
          totalCoasters,
          pendingArtwork,
          activeVenues,
          totalScans,
        },
        recentActivity,
        topVenues,
        popularArtwork,
        userGrowth,
      };
    }),
});