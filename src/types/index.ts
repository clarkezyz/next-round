import { type Prisma } from "@prisma/client";

export type DashboardStats = {
  stats: {
    totalCoasters: number;
    pendingArtwork: number;
    activeVenues: number;
    totalScans: number;
  };
  recentActivity: Array<{
    id: string;
    createdAt: Date;
    user: {
      name: string | null;
      email: string;
    };
    coaster: {
      venue: {
        name: string;
      } | null;
    };
  }>;
  topVenues: Array<{
    id: string;
    name: string;
    totalScans: number;
  }>;
  popularArtwork: Array<{
    id: string;
    title: string | null;
    coasters: Array<{
      scans: Array<{ id: string }>;
    }>;
  }>;
  userGrowth: Array<{
    createdAt: Date;
    _count: number;
  }>;
};