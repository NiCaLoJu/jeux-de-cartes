// Satori (next/og's ImageResponse renderer) has no font with the ♣ glyph,
// so the club suit is built from plain shapes instead of a text character.
export function ClubGlyph({ box = 300 }: { box?: number }) {
  const circle = box * 0.47;
  const half = circle / 2;
  const top = { left: box / 2 - half, top: box * 0.08 };
  const bottomLeft = { left: box * 0.08, top: box * 0.4 };
  const bottomRight = { left: box - circle - box * 0.08, top: box * 0.4 };
  const stemWidth = box * 0.16;
  const stemHeight = box * 0.42;

  const circleStyle = (pos: { left: number; top: number }) => ({
    position: "absolute" as const,
    left: pos.left,
    top: pos.top,
    width: circle,
    height: circle,
    borderRadius: "50%",
    background: "white",
    display: "flex",
  });

  return (
    <div style={{ position: "relative", width: box, height: box, display: "flex" }}>
      <div style={circleStyle(top)} />
      <div style={circleStyle(bottomLeft)} />
      <div style={circleStyle(bottomRight)} />
      <div
        style={{
          position: "absolute",
          left: box / 2 - stemWidth / 2,
          top: box - stemHeight,
          width: stemWidth,
          height: stemHeight,
          borderRadius: stemWidth / 2,
          background: "white",
          display: "flex",
        }}
      />
    </div>
  );
}
