interface MarkProps {
  size?: number;
}

export function NextjsMark({ size = 72 }: MarkProps) {
  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-black shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: "#0F172A",
        fontSize: Math.round(size * 0.45),
        fontFamily: "Georgia, serif",
        letterSpacing: "-0.02em",
      }}
      aria-hidden
    >
      N
    </div>
  );
}

export function DockerMark({ size = 72 }: MarkProps) {
  const inner = Math.round(size * 0.65);
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: "#1d63ed" }}
      aria-hidden
    >
      <svg width={inner} height={inner} viewBox="0 0 40 32" fill="none">
        {/* Container rows */}
        <rect x="1" y="16" width="6" height="5" rx="0.75" fill="white" />
        <rect x="9" y="16" width="6" height="5" rx="0.75" fill="white" />
        <rect x="17" y="16" width="6" height="5" rx="0.75" fill="white" />
        <rect x="25" y="16" width="6" height="5" rx="0.75" fill="white" />
        <rect x="9" y="9" width="6" height="5" rx="0.75" fill="white" />
        <rect x="17" y="9" width="6" height="5" rx="0.75" fill="white" />
        <rect x="17" y="2" width="6" height="5" rx="0.75" fill="white" />
        {/* Whale body */}
        <path
          d="M0 23c0 5 8 9 20 9s20-4 20-9"
          fill="white"
          opacity="0.85"
        />
        {/* Water spout */}
        <path
          d="M34 21c1.5-3 5-3 6-1.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function TypescriptMark({ size = 72 }: MarkProps) {
  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: "#3178c6",
        fontSize: Math.round(size * 0.32),
        letterSpacing: "-0.01em",
      }}
      aria-hidden
    >
      TS
    </div>
  );
}
