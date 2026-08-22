import Image from "next/image";

interface AvatarProps {
  initials?: string;
  src?: string;
  size?: number;
  className?: string;
}

export function Avatar({ initials = "?", src, size = 48, className = "" }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={`rounded-full object-cover border border-neutral-200 ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-neutral-200 text-neutral-700 font-semibold select-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
