import { auth } from "@/server/auth";
import { createAPI } from "@/trpc/server";
import { isValidCode } from "@/server/utils/code-generator";
import { redirect } from "next/navigation";
// import { ScanResult } from "@/components/scan/ScanResult";
//import { UserActions } from "@/components/scan/UserActions";

export default async function CoasterPage({
  params,
}: {
  params: { code: string };
}) {
  const session = await auth();
  
  if (!isValidCode(params.code)) {
    redirect('/invalid-code');
  }

  try {
    const scanResult = await api.coaster.initialScanCheck.query({
      code: params.code,
    });

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <ScanResult 
  artwork={scanResult.artwork}
  coaster={scanResult.coaster}
  isFirstScan={scanResult.isFirstScan}
  scannedAt={!scanResult.isFirstScan ? scanResult.coaster.scans[0]?.createdAt : undefined}
  scannerName={!scanResult.isFirstScan ? scanResult.coaster.scans[0]?.user.name : undefined}
/>
          
          {session?.user ? (
            <UserActions 
              coasterId={scanResult.coaster.id}
              isFirstScan={scanResult.isFirstScan}
              currentPoints={session.user.points}
            />
          ) : (
            // Simple form for guest comments on first scan
            scanResult.isFirstScan && (
              <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    First Discovery!
                  </h3>
                  <p className="text-white/60 mb-4">
                    Leave a quick note about this artwork or{' '}
                    <a href="/auth/signin" className="text-purple-400 hover:text-purple-300">
                      sign in
                    </a>
                    {' '}to earn points and share your own art.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    );
  } catch (error) {
    redirect('/scan-error');
  }
}