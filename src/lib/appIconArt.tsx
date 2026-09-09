// Full app-icon artwork (background + two fanned playing cards), shared by
// icon.tsx and apple-icon.tsx. Renders full-bleed to `size` — no corner
// rounding of its own (CSS clip-path isn't supported by Satori anyway, and
// baking in our own radius double-rounds against the OS's own icon mask,
// leaving visible background wedges in the corners on iOS/Android). Suit
// pips are built from plain shapes since Satori has no emoji/suit-glyph font.

function SpadePip({ box, color }: { box: number; color: string }) {
  const triHalf = box * 0.24;
  const triH = box * 0.42;
  const circle = box * 0.6;
  const stemW = box * 0.16;
  const stemH = box * 0.26;
  return (
    <div style={{ position: "relative", width: box, height: box, display: "flex" }}>
      <svg
        width={triHalf * 2}
        height={triH}
        viewBox={`0 0 ${triHalf * 2} ${triH}`}
        style={{ position: "absolute", left: box / 2 - triHalf, top: 0 }}
      >
        <polygon points={`${triHalf},0 0,${triH} ${triHalf * 2},${triH}`} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: box / 2 - circle / 2,
          top: box * 0.28,
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
          left: box / 2 - stemW / 2,
          top: box - stemH,
          width: stemW,
          height: stemH,
          borderRadius: stemW / 2,
          background: color,
          display: "flex",
        }}
      />
    </div>
  );
}

function HeartPip({ box, color }: { box: number; color: string }) {
  const circle = box * 0.46;
  const overlap = circle * 0.3;
  const triW = circle * 2 - overlap;
  const triH = box * 0.54;
  return (
    <div style={{ position: "relative", width: box, height: box, display: "flex" }}>
      <div
        style={{
          position: "absolute",
          left: box / 2 - circle + overlap / 2,
          top: box * 0.08,
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
          left: box / 2 - overlap / 2,
          top: box * 0.08,
          width: circle,
          height: circle,
          borderRadius: "50%",
          background: color,
          display: "flex",
        }}
      />
      <svg
        width={triW}
        height={triH}
        viewBox={`0 0 ${triW} ${triH}`}
        style={{ position: "absolute", left: box / 2 - triW / 2, top: box * 0.3 }}
      >
        <polygon points={`0,0 ${triW},0 ${triW / 2},${triH}`} fill={color} />
      </svg>
    </div>
  );
}

function PlayingCard({
  x,
  y,
  width,
  height,
  rotate,
  background,
  pip,
  pipColor,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  background: string;
  pip: "spade" | "heart";
  pipColor: string;
}) {
  const cornerPip = width * 0.16;
  const centerPip = width * 0.52;
  const Pip = pip === "spade" ? SpadePip : HeartPip;

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        borderRadius: width * 0.12,
        background,
        boxShadow: "0 14px 28px rgba(17, 12, 46, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div style={{ position: "absolute", left: width * 0.1, top: height * 0.07, display: "flex" }}>
        <Pip box={cornerPip} color={pipColor} />
      </div>
      <Pip box={centerPip} color={pipColor} />
    </div>
  );
}

export function AppIconArt({ size = 512 }: { size?: number }) {
  const cardW = size * 0.46;
  const cardH = size * 0.66;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        position: "relative",
        background: "linear-gradient(160deg, #7c3aed 0%, #4f46e5 55%, #1e1b4b 100%)",
      }}
    >
      {/* Soft glass highlight, upper-left, for depth. */}
      <div
        style={{
          position: "absolute",
          width: size * 0.9,
          height: size * 0.9,
          top: size * -0.32,
          left: size * -0.18,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 70%)",
          display: "flex",
        }}
      />

      <PlayingCard
        x={size * 0.4}
        y={size * 0.54}
        width={cardW}
        height={cardH}
        rotate={-13}
        background="linear-gradient(160deg, #fff1f2 0%, #fecdd3 100%)"
        pip="heart"
        pipColor="#e11d48"
      />
      <PlayingCard
        x={size * 0.6}
        y={size * 0.5}
        width={cardW}
        height={cardH}
        rotate={11}
        background="linear-gradient(160deg, #ffffff 0%, #f4f4f5 100%)"
        pip="spade"
        pipColor="#18181b"
      />
    </div>
  );
}
