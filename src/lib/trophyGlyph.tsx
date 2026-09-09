// A trophy built from plain shapes (Satori/next-og's ImageResponse has no
// emoji font by default, and we want crisp, consistent rendering without a
// network fetch at build time) — used by the app icon and Apple touch icon.
// The cup body is an SVG trapezoid (CSS clip-path isn't supported by
// Satori) so it actually tapers like a goblet instead of reading as a dome.

export function TrophyGlyph({ size = 276 }: { size?: number }) {
  const gold = "#fde68a";
  const goldMid = "#fbbf24";
  const goldDeep = "#d97706";

  const cupTopWidth = size * 0.56;
  const cupNeckWidth = size * 0.24;
  const rimHeight = size * 0.11;
  const bodyHeight = size * 0.3;

  const rimTop = size * 0.08;
  const rimLeft = size / 2 - cupTopWidth / 2;
  const bodyTop = rimTop + rimHeight - 1;
  const bodyBottom = bodyTop + bodyHeight;
  const neckLeft = size / 2 - cupNeckWidth / 2;
  const neckRight = size / 2 + cupNeckWidth / 2;

  const handleR = size * 0.14;
  const handleThickness = size * 0.045;
  const handleCenterY = rimTop + rimHeight + bodyHeight * 0.18;

  const stemWidth = size * 0.09;
  const stemHeight = size * 0.15;
  const stemTop = bodyBottom - 1;

  const base1Width = size * 0.3;
  const base1Height = size * 0.045;
  const base1Top = stemTop + stemHeight - 1;

  const base2Width = size * 0.46;
  const base2Height = size * 0.06;
  const base2Top = base1Top + base1Height - 1;

  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex" }}>
      {/* Handles — half-rings whose open side attaches to the cup's edge. */}
      <div
        style={{
          position: "absolute",
          left: rimLeft - handleR * 1.15,
          top: handleCenterY - handleR,
          width: handleR * 2,
          height: handleR * 2,
          borderRadius: "50%",
          border: `${handleThickness}px solid ${goldMid}`,
          borderRight: "none",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: rimLeft - handleR * 1.15,
          top: handleCenterY - handleR,
          width: handleR * 2,
          height: handleR * 2,
          borderRadius: "50%",
          border: `${handleThickness}px solid ${goldMid}`,
          borderLeft: "none",
          display: "flex",
        }}
      />

      {/* Cup rim (rounded cap) */}
      <div
        style={{
          position: "absolute",
          left: rimLeft,
          top: rimTop,
          width: cupTopWidth,
          height: rimHeight * 2,
          borderRadius: cupTopWidth / 2,
          background: `linear-gradient(180deg, ${gold} 0%, ${goldMid} 100%)`,
          display: "flex",
        }}
      />

      {/* Cup body — true taper via SVG polygon. */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <defs>
          <linearGradient id="cupBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={goldMid} />
            <stop offset="100%" stopColor={goldDeep} />
          </linearGradient>
        </defs>
        <polygon
          points={`${rimLeft},${bodyTop} ${rimLeft + cupTopWidth},${bodyTop} ${neckRight},${bodyBottom} ${neckLeft},${bodyBottom}`}
          fill="url(#cupBody)"
        />
      </svg>

      {/* Stem */}
      <div
        style={{
          position: "absolute",
          left: size / 2 - stemWidth / 2,
          top: stemTop,
          width: stemWidth,
          height: stemHeight,
          background: goldDeep,
          display: "flex",
        }}
      />

      {/* Base */}
      <div
        style={{
          position: "absolute",
          left: size / 2 - base1Width / 2,
          top: base1Top,
          width: base1Width,
          height: base1Height,
          borderRadius: size * 0.012,
          background: goldMid,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: size / 2 - base2Width / 2,
          top: base2Top,
          width: base2Width,
          height: base2Height,
          borderRadius: size * 0.015,
          background: goldDeep,
          display: "flex",
        }}
      />
    </div>
  );
}
