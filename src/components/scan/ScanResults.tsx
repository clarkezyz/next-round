// src/components/scan/ScanResult.tsx
import { type Artwork, type Coaster } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

interface ScanResultProps {
  artwork: Artwork;
  coaster: Coaster;
  isFirstScan: boolean;
  scannedAt?: Date; // When was this previously scanned, if not first scan
  scannerName?: string; // Who scanned it first, if not first scan
}

export function ScanResult({ 
  artwork, 
  coaster, 
  isFirstScan,
  scannedAt,
  scannerName 
}: ScanResultProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Artwork preview */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden">
        <img
          src={artwork.webUrl}
          alt={artwork.title ?? "Scanned artwork"}
          className="object-cover w-full h-full"
        />
      </div>
      
      {/* Artwork info */}
      <div className="w-full text-center">
        {artwork.title && (
          <h2 className="text-2xl font-bold mb-2">{artwork.title}</h2>
        )}
        {artwork.description && (
          <p className="text-white/80 mb-4">{artwork.description}</p>
        )}

        {/* Scan Status */}
        {isFirstScan ? (
          <div className="space-y-4">
            <div className="py-2 px-4 bg-emerald-500/20 text-emerald-300 rounded-full inline-block">
              First Scan! 🎉 +10 points
            </div>
            <p className="text-white/80">
              You're the first to discover this artwork! Leave a comment to share your thoughts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="py-2 px-4 bg-purple-500/20 text-purple-300 rounded-full inline-block">
              +1 point
            </div>
            {scannedAt && scannerName && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/80">
                  First discovered by {scannerName}{' '}
                  {formatDistanceToNow(scannedAt, { addSuffix: true })}
                </p>
                <p className="text-sm text-white/60 mt-2">
                  Find this artwork in position #{artwork.id} in the gallery
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}