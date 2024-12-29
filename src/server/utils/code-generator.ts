import { db } from "@/server/db";

// Characters chosen for clarity - avoiding similar looking characters
const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export async function generateUniqueCode(length: number = 4): Promise<string> {
  const maxAttempts = 10; // Prevent infinite loops
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Generate a random code
    let code = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * CHARS.length);
      code += CHARS[randomIndex];
    }

    // Check if code exists in database
    const existing = await db.coaster.findUnique({
      where: { qrCode: code },
    });

    // If code doesn't exist, return it
    if (!existing) {
      return code;
    }

    attempts++;
  }

  // If we hit max attempts, add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36).slice(-2);
  const baseCode = Array(length - 2).fill(0)
    .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
    .join("");
  
  return baseCode + timestamp;
}

// Helper function to validate a code format
export function isValidCode(code: string): boolean {
  if (code.length !== 4) return false;
  return code.split("").every(char => CHARS.includes(char));
}

// Helper function to generate the full URL for a code
export function generateCoasterUrl(code: string): string {
  // Use zd.md as default, but make it configurable
  const domain = process.env.COASTER_DOMAIN || "zd.md";
  return `https://${domain}/${code}`;
}