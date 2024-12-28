import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "./AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Next Round",
  description: "Connect through coasters",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <AuthProvider>
          <TRPCReactProvider headers={headers()}>
            {children}
          </TRPCReactProvider>
        </AuthProvider>
      </body>
    </html>
  );
}