// src/components/scan/UserActions.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ArtworkUpload } from "./ArtworkUpload";

interface UserActionsProps {
  coasterId: string;
  isFirstScan: boolean;
  currentPoints: number;
  onActionComplete?: () => void;
}
const [showUpload, setShowUpload] = useState(false);
const [scanId, setScanId] = useState<string | null>(null);

export function UserActions({ 
  coasterId, 
  isFirstScan, 
  currentPoints,
  onActionComplete 
}: UserActionsProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scanMutation = api.coaster.scanCoaster.useMutation({
    onSuccess: (data) => {
        setIsSubmitting(false);
        if (isFirstScan) {
          setScanId(data.scan.id);
          setShowUpload(true);
        }
        onActionComplete?.();
      },
  });

  const handleScan = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    await scanMutation.mutate({ 
      qrCode: coasterId,
      // We could add location here if we want to implement that
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/5 rounded-lg p-6 space-y-6">
        {isFirstScan ? (
          <>
            <h3 className="text-xl font-semibold">
              First Scan! Earn 10 Points
            </h3>
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment about this artwork..."
                className="w-full h-32 px-4 py-2 rounded-lg bg-white/10 
                           text-white placeholder:text-white/50 resize-none
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSubmitting}
              />
            </div>
          </>
        ) : (
          <h3 className="text-xl font-semibold">
            Scan to Earn 1 Point
          </h3>
        )}
  
        <div className="flex items-center justify-between">
          <button
            onClick={handleScan}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-full bg-purple-600 text-white 
                     font-semibold transition hover:bg-purple-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Scan Coaster"}
          </button>
  
          <div className="text-white/60">
            Current Points: <span className="text-purple-400">{currentPoints}</span>
          </div>
        </div>
  
        {scanMutation.error && (
          <p className="text-red-400 mt-2">
            {scanMutation.error.message}
          </p>
        )}
  
        {showUpload && scanId && (
          <div className="mt-8">
            <ArtworkUpload 
              scanId={scanId} 
              onUploadComplete={() => {
                setShowUpload(false);
                onActionComplete?.();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 