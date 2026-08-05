import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Score Board Premium",
    short_name: "Score Board",
    description: "Le tableau de score des soirées jeux — glossy, animé, prêt pour le cast TV.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2fb",
    theme_color: "#d9c9f7",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
