const PASTEL_GRADIENTS = [
  "from-[var(--pastel-mint)] to-[var(--pastel-sky)]",
  "from-[var(--pastel-peach)] to-[var(--pastel-lavender)]",
  "from-[var(--pastel-sky)] to-[var(--pastel-lavender)]",
  "from-[var(--pastel-lavender)] to-[var(--pastel-peach)]",
  "from-[var(--pastel-mint)] to-[var(--pastel-peach)]",
];

function gradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PASTEL_GRADIENTS[Math.abs(hash) % PASTEL_GRADIENTS.length];
}

export function PlayerAvatar({
  name,
  photo,
  size = 40,
  className = "",
}: {
  name: string;
  photo?: string;
  size?: number;
  className?: string;
}) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className={`rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white/90 bg-gradient-to-br ${gradientForName(
        name || "?"
      )} ${className}`}
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </div>
  );
}
