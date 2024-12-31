// src/components/scan/ArtworkUpload.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

interface ArtworkUploadProps {
  scanId: string;
  onUploadComplete?: () => void;
}

export function ArtworkUpload({ scanId, onUploadComplete }: ArtworkUploadProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadMutation = api.coaster.submitArtwork.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      onUploadComplete?.();
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });

      await uploadMutation.mutate({
        title,
        description: description.trim() || undefined,
        imageData: base64,
        scanId,
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          Submit Your Artwork
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Artwork Image
            </label>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-500/50 transition-colors">
              {previewUrl ? (
                <div className="relative w-full max-w-md aspect-square">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="artwork-upload"
                  />
                  <label
                    htmlFor="artwork-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-white/60">
                      Click to upload your artwork
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 
                       text-white placeholder:text-white/50
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Give your artwork a title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 px-4 py-2 rounded-lg bg-white/10 
                       text-white placeholder:text-white/50 resize-none
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell us about your artwork..."
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedFile || !title.trim()}
            className="w-full px-6 py-3 rounded-full bg-purple-600 text-white 
                     font-semibold transition hover:bg-purple-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Uploading..." : "Submit Artwork"}
          </button>

          {uploadMutation.error && (
            <p className="text-red-400 mt-2">
              {uploadMutation.error.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}