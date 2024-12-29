"use client";

import { type ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { TRPCReactProvider } from "@/trpc/react";
import { AuthProvider } from "./AuthProvider";

export function Providers({ 
  children,
  headers,
}: { 
  children: React.ReactNode;
  headers: ReadonlyHeaders;
}) {
  return (
    <AuthProvider>
      <TRPCReactProvider headers={headers}>
        {children}
      </TRPCReactProvider>
    </AuthProvider>
  );
}