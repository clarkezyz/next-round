import { coasterRouter } from "@/server/api/routers/coaster";
import { adminRouter } from "@/server/api/routers/admin";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  coaster: coasterRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);