"use client";

import { Player } from "@/lib/engine";
import { computeRunningTotals } from "@/lib/runningTotals";
import { RoundRecord } from "@/store/gameSessionStore";

const LINE_COLORS = [
  "#0a84ff", // blue
  "#ff9f0a", // orange
  "#30d158", // green
  "#ff375f", // pink
  "#bf5af2", // purple
  "#64d2ff", // cyan
  "#ffd60a", // yellow
  "#a2845e", // brown
];

function colorForIndex(i: number) {
  return LINE_COLORS[i % LINE_COLORS.length];
}

/** SVG line chart of each player's running total across rounds. Renders nothing below 2 rounds. */
export function ScoreChart({ players, rounds }: { players: Player[]; rounds: RoundRecord[] }) {
  const snapshots = computeRunningTotals(players, rounds);
  if (snapshots.length < 2) return null;

  const width = 320;
  const height = 140;
  const padX = 8;
  const padY = 12;

  const allValues = snapshots.flatMap((s) => players.map((p) => s.totals[p.id] ?? 0));
  const min = Math.min(0, ...allValues);
  const max = Math.max(1, ...allValues);
  const range = max - min || 1;

  const stepX = (width - padX * 2) / (snapshots.length - 1);
  const yFor = (v: number) => height - padY - ((v - min) / range) * (height - padY * 2);
  const xFor = (i: number) => padX + i * stepX;

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        <line
          x1={0}
          y1={yFor(0)}
          x2={width}
          y2={yFor(0)}
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeDasharray="3 3"
        />
        {players.map((p, i) => {
          const points = snapshots.map((s, si) => `${xFor(si)},${yFor(s.totals[p.id] ?? 0)}`).join(" ");
          return (
            <polyline
              key={p.id}
              points={points}
              fill="none"
              stroke={colorForIndex(i)}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {players.map((p, i) => {
          const last = snapshots[snapshots.length - 1].totals[p.id] ?? 0;
          return (
            <div key={p.id} className="flex items-center gap-1.5 text-xs opacity-70">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorForIndex(i) }} />
              {p.name} <span className="tabular-nums font-medium">{last}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
