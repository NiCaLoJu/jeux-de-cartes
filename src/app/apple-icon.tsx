import { ImageResponse } from "next/og";
import { SpadeGlyph } from "@/lib/clubGlyph";

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
          background: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
        }}
      >
        <SpadeGlyph box={108} />
      </div>
    ),
    { ...size }
  );
}
