// What a phone needs to put Milo on the home screen; on iPhone, that's also what lets it receive notifications.

export default function manifest() {
  return {
    name: "Milo",
    short_name: "Milo",
    description: "Manage your life in blocks.",
    start_url: "/daily",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
