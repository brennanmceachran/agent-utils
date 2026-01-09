import { headers } from "next/headers";

export function getSiteOrigin() {
  const headerList = headers();
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "https://your-site-url";
}
