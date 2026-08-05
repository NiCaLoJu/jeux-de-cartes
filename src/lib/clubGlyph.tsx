// Satori (next/og's ImageResponse renderer) has no font with the suit
// glyphs (♣♦♥♠), so every suit is built from plain shapes — circles, a
// rotated square, and SVG triangles — instead of a text character.
// (CSS border-triangles are silently ignored by Satori and paint as a
// solid rectangle, so triangles go through an inline <svg><polygon>.)

interface SuitProps {
  box?: number;
  color?: string;
}

export function ClubGlyph({ box = 300, color = "white" }: SuitProps) {
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
    background: color,
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
          background: color,
          display: "flex",
        }}
      />
    </div>
  );
}

/** Spade (♠): a triangle point + a circle lobe + a stem. */
export function SpadeGlyph({ box = 300, color = "white" }: SuitProps) {
  const triangleHalfWidth = box * 0.21;
  const triangleHeight = box * 0.4;
  const circle = box * 0.62;
  const stemWidth = box * 0.16;
  const stemHeight = box * 0.28;

  return (
    <div style={{ position: "relative", width: box, height: box, display: "flex" }}>
      <svg
        width={triangleHalfWidth * 2}
        height={triangleHeight}
        viewBox={`0 0 ${triangleHalfWidth * 2} ${triangleHeight}`}
        style={{ position: "absolute", left: box / 2 - triangleHalfWidth, top: box * 0.02 }}
      >
        <polygon
          points={`${triangleHalfWidth},0 0,${triangleHeight} ${triangleHalfWidth * 2},${triangleHeight}`}
          fill={color}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: box / 2 - circle / 2,
          top: box * 0.3,
          width: circle,
          height: circle,
          borderRadius: "50%",
          background: color,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: box / 2 - stemWidth / 2,
          top: box - stemHeight,
          width: stemWidth,
          height: stemHeight,
          borderRadius: stemWidth / 2,
          background: color,
          display: "flex",
        }}
      />
    </div>
  );
}

/** Heart (♥): two circle lobes + a downward triangle joining them to a point. */
export function HeartGlyph({ box = 300, color = "red" }: SuitProps) {
  const circle = box * 0.42;
  const overlap = circle * 0.32;
  const leftCircle = { left: box / 2 - circle + overlap / 2, top: box * 0.1 };
  const rightCircle = { left: box / 2 - overlap / 2, top: box * 0.1 };
  const triangleWidth = circle * 2 - overlap;
  const triangleHeight = box * 0.5;
  const triangleTop = box * 0.34;

  const circleStyle = (pos: { left: number; top: number }) => ({
    position: "absolute" as const,
    left: pos.left,
    top: pos.top,
    width: circle,
    height: circle,
    borderRadius: "50%",
    background: color,
    display: "flex",
  });

  return (
    <div style={{ position: "relative", width: box, height: box, display: "flex" }}>
      <div style={circleStyle(leftCircle)} />
      <div style={circleStyle(rightCircle)} />
      <svg
        width={triangleWidth}
        height={triangleHeight}
        viewBox={`0 0 ${triangleWidth} ${triangleHeight}`}
        style={{ position: "absolute", left: box / 2 - triangleWidth / 2, top: triangleTop }}
      >
        <polygon points={`0,0 ${triangleWidth},0 ${triangleWidth / 2},${triangleHeight}`} fill={color} />
      </svg>
    </div>
  );
}

/** Diamond (♦): a square rotated 45°. */
export function DiamondGlyph({ box = 300, color = "red" }: SuitProps) {
  const side = box * 0.52;
  return (
    <div style={{ position: "relative", width: box, height: box, display: "flex" }}>
      <div
        style={{
          position: "absolute",
          left: box / 2 - side / 2,
          top: box / 2 - side / 2,
          width: side,
          height: side,
          background: color,
          transform: "rotate(45deg)",
          display: "flex",
        }}
      />
    </div>
  );
}

/** 2x2 grid of all four suits, black for ♠♣ and red for ♥♦, like a card's corner index. */
export function FourSuitsGrid({ cell = 150, black = "black", red = "#dc143c" }: { cell?: number; black?: string; red?: string }) {
  const quadrant = {
    flex: 1,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", width: cell * 2, height: cell * 2 }}>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={quadrant}>
          <SpadeGlyph box={cell * 0.78} color={black} />
        </div>
        <div style={quadrant}>
          <HeartGlyph box={cell * 0.78} color={red} />
        </div>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={quadrant}>
          <DiamondGlyph box={cell * 0.78} color={red} />
        </div>
        <div style={quadrant}>
          <ClubGlyph box={cell * 0.78} color={black} />
        </div>
      </div>
    </div>
  );
}
