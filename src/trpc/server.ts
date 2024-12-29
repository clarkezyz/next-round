import "server-only";

import { headers } from "next/headers";
import { createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from "superjson";

export async function createAPI() {
  const headersList = await headers();
  const heads = new Headers();
  heads.set('x-trpc-source', 'rsc');
  
  // Type the entries explicitly
  const headerEntries: [string, string][] = Array.from(headersList.entries());
  headerEntries.forEach(([key, value]) => {
    heads.set(key, value);
  });

  const context = await createTRPCContext({
    headers: heads,
  });

  return createServerSideHelpers({
    router: appRouter,
    ctx: context,
    transformer: superjson,
  });
}