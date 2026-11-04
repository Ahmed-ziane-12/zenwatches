import type { NextConfig } from "next";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  pathname: string;
};

// Supabase Storage public URLs live under /storage/v1/object/public/<bucket>/...
const remotePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: "*.supabase.co",
    pathname: "/storage/v1/object/public/**",
  },
];

// Also allow the exact project host when it uses a custom domain.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.endsWith(".supabase.co")) {
      remotePatterns.push({
        protocol: url.protocol === "http:" ? "http" : "https",
        hostname: url.hostname,
        pathname: "/storage/v1/object/public/**",
      });
    }
  } catch {
    // Ignore a malformed env value and keep the default Supabase pattern.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
