/**
 * Validate if request is from Vercel
 * https://vercel.com/docs/concepts/edge-network/headers
 */

export function isVercelRequest(headers: Headers): boolean {
  // Check for Vercel-specific header that indicates the request is from Vercel
  const vercelReqId = headers.get("x-vercel-id");
  return Boolean(vercelReqId);
}

/**
 * Validate if request IP is from Vercel's IP ranges
 * This is a simple check - Vercel publishes their IP ranges
 * https://vercel.com/docs/concepts/edge-network/headers
 */
export function isVercelIP(ip: string | null): boolean {
  if (!ip) return false;

  // Common Vercel IP ranges (this is a subset - check Vercel docs for complete list)
  // For development, we mainly check for x-vercel-id header instead
  const vercelIPs = [
    "76.76.19.0/24", // Vercel's main IP range
    "127.0.0.1", // Localhost for testing
  ];

  // Simple IP matching (production would use proper IP parsing library)
  for (const range of vercelIPs) {
    if (range.includes("/")) {
      // Simplified: just check if IP starts with the base
      const baseParts = range.split("/")[0].split(".");
      const ipParts = ip.split(".");

      let matches = true;
      for (let i = 0; i < baseParts.length && i < 3; i++) {
        if (baseParts[i] !== ipParts[i]) {
          matches = false;
          break;
        }
      }

      if (matches) return true;
    } else {
      if (ip === range) return true;
    }
  }

  return false;
}

/**
 * Validate cron job request - check for Vercel headers
 * This should be called from Next.js route handlers that process cron jobs
 */
export function validateCronRequest(request: Request): boolean {
  const headers = request.headers;

  // Check for Vercel's request ID (most reliable indicator)
  const vercelId = headers.get("x-vercel-id");
  if (vercelId) return true;

  // Fallback: Check Authorization header if provided
  const auth = headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET_TOKEN;
  if (cronSecret && auth === `Bearer ${cronSecret}`) {
    return true;
  }

  // In development, allow localhost
  if (process.env.NODE_ENV === "development") {
    const forwarded = headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : null;
    if (ip === "127.0.0.1" || ip === "localhost") {
      return true;
    }
  }

  return false;
}
