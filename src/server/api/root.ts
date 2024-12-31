import { coasterRouter } from "@/server/api/routers/coaster";
import { adminRouter } from "@/server/api/routers/admin";
import { scanRouter } from "@/server/api/routers/scan";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  coaster: coasterRouter,
  admin: adminRouter,
  scan: scanRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);