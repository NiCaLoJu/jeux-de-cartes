// Client-side canvas recap image (podium + scores) for a finished game, and
// the share/download helpers around it. Runs entirely in the user's own
// browser — real canvas + emoji rendering, not the sandboxed OG renderer.

import { GameRecord } from "@/lib/history";
import { createPublicShare } from "@/lib/publicShare";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const MEDALS = ["🥇", "🥈", "🥉"];

export async function generateRecapImage(record: GameRecord): Promise<Blob> {
  const sorted = [...record.players].sort((a, b) => a.rank - b.rank);
  const width = 800;
  const rowHeight = 100;
  const height = 300 + sorted.length * rowHeight + 90;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D non disponible");

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#f5f5f7");
  grad.addColorStop(1, "#e5e5ea");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "64px sans-serif";
  ctx.fillText(record.gameEmoji, width / 2, 130);

  ctx.font = "bold 44px sans-serif";
  ctx.fillText(record.gameName, width / 2, 200);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#6e6e73";
  ctx.fillText(
    new Date(record.playedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    width / 2,
    235
  );

  let y = 290;
  for (const [i, p] of sorted.entries()) {
    const isWinner = record.winnerIds.includes(p.id);
    ctx.fillStyle = isWinner ? "rgba(242,193,78,0.22)" : "rgba(0,0,0,0.04)";
    roundRect(ctx, 80, y, width - 160, 80, 20);
    ctx.fill();

    ctx.textAlign = "left";
    ctx.font = "34px sans-serif";
    ctx.fillStyle = "#1d1d1f";
    ctx.fillText(MEDALS[i] ?? `#${p.rank}`, 108, y + 52);

    ctx.font = "600 27px sans-serif";
    ctx.fillText(p.name, 185, y + 50);

    ctx.textAlign = "right";
    ctx.font = "bold 27px sans-serif";
    ctx.fillText(`${p.total} pts`, width - 108, y + 50);

    y += rowHeight;
  }

  ctx.textAlign = "center";
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#a1a1a6";
  ctx.fillText("🏆 Score Board", width / 2, height - 40);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Génération de l'image impossible"))), "image/png");
  });
}

/** Shares the recap image via the native share sheet, or downloads it if unsupported. */
export async function shareRecapImage(record: GameRecord): Promise<void> {
  const blob = await generateRecapImage(record);
  const file = new File([blob], `${record.gameName.replace(/\s+/g, "-")}.png`, { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: record.gameName });
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Publishes a public read-only recap link and shares/copies it. */
export async function shareRecapLink(record: GameRecord): Promise<"shared" | "copied"> {
  const id = await createPublicShare(record);
  const url = `${window.location.origin}/share/${id}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: record.gameName, url });
      return "shared";
    } catch {
      // User cancelled the share sheet — fall through to clipboard copy.
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}
