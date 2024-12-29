import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Next Round",
  description: "Connect through coasters",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <Providers headers={headersList}>
          {children}
        </Providers>
      </body>
    </html>
  );
}