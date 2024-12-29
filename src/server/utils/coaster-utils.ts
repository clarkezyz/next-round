import { db } from "@/server/db";
import { generateUniqueCode, generateCoasterUrl } from "./code-generator";

export async function createNewCoaster(artworkId: string, venueId?: string) {
  // Generate a unique code
  const code = await generateUniqueCode();
  
  // Create the coaster in the database
  const coaster = await db.coaster.create({
    data: {
      qrCode: code,
      artworkId,
      venueId,
      status: "ACTIVE",
    },
    include: {
      artwork: true,
      venue: true,
    },
  });

  return {
    ...coaster,
    url: generateCoasterUrl(code),
  };
}

export async function batchCreateCoasters(
    artworkId: string,
    count: number,
    venueId?: string
  ) {
  const coasters = [];
  
  for (let i = 0; i < count; i++) {
    const coaster = await createNewCoaster(artworkId, venueId);
    coasters.push(coaster);
  }

  return coasters;
}