import { ImageResponse } from "next/og";
import { TrophyGlyph } from "@/lib/trophyGlyph";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 112,
          position: "relative",
        }}
      >
        {/* Soft glass highlight, upper-left, for depth. */}
        <div
          style={{
            position: "absolute",
            width: 460,
            height: 460,
            top: -160,
            left: -80,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
            display: "flex",
          }}
        />
        <TrophyGlyph size={276} />
      </div>
    ),
    { ...size }
  );
}
