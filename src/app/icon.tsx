import { ImageResponse } from "next/og";
import { FourSuitsGrid } from "@/lib/clubGlyph";

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
          background: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
          borderRadius: 96,
        }}
      >
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: 56,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FourSuitsGrid cell={150} />
        </div>
      </div>
    ),
    { ...size }
  );
}
