"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function CoasterManagement() {
  const [artworkId, setArtworkId] = useState("");
  const [batchSize, setBatchSize] = useState(1);
  const [venueId, setVenueId] = useState("");
  const [error, setError] = useState("");

  const createMutation = api.coaster.create.useMutation({
    onError: (error) => {
      setError(error.message);
    },
  });

  const batchCreateMutation = api.coaster.batchCreate.useMutation({
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSingleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createMutation.mutateAsync({
        artworkId,
        venueId: venueId || undefined,
      });
      console.log("Created coaster:", result);
    } catch (e) {
      console.error("Error creating coaster:", e);
    }
  };

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await batchCreateMutation.mutateAsync({
        artworkId,
        count: batchSize,
        venueId: venueId || undefined,
      });
      console.log("Created coasters:", result);
    } catch (e) {
      console.error("Error creating coasters:", e);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Coaster Management</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Single Coaster Creation */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-xl font-semibold">Create Single Coaster</h2>
          <form onSubmit={handleSingleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Artwork ID
                <input
                  type="text"
                  value={artworkId}
                  onChange={(e) => setArtworkId(e.target.value)}
                  className="mt-1 block w-full rounded-md border p-2"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Venue ID (optional)
                <input
                  type="text"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="mt-1 block w-full rounded-md border p-2"
                />
              </label>
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? "Creating..." : "Create Coaster"}
            </button>
          </form>
        </div>

        {/* Batch Coaster Creation */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-xl font-semibold">Batch Create Coasters</h2>
          <form onSubmit={handleBatchCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Artwork ID
                <input
                  type="text"
                  value={artworkId}
                  onChange={(e) => setArtworkId(e.target.value)}
                  className="mt-1 block w-full rounded-md border p-2"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Batch Size
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border p-2"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Venue ID (optional)
                <input
                  type="text"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="mt-1 block w-full rounded-md border p-2"
                />
              </label>
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              disabled={batchCreateMutation.isLoading}
            >
              {batchCreateMutation.isLoading
                ? "Creating..."
                : "Create Coasters"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}