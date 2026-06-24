import type { MetadataRoute } from "next";

// Web App Manifest — makes callsheet installable ("Add to Home Screen").
// Next serves this at /manifest.webmanifest and auto-links it in <head>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "callsheet — shot lists for creators",
    short_name: "callsheet",
    description:
      "Join brand campaigns, get an AI shot-by-shot brief, and film it — right from your phone.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
