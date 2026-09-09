import { ImageResponse } from "next/og";
import { TrophyGlyph } from "@/lib/trophyGlyph";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #6d28d9 0%, #4338ca 55%, #1e1b4b 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            top: -56,
            left: -28,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
            display: "flex",
          }}
        />
        <TrophyGlyph size={97} />
      </div>
    ),
    { ...size }
  );
}
