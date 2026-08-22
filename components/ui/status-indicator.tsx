import { CheckCircleIcon, LoaderIcon, LockIcon, PlayCircleIcon } from "./icons";

type Status = "in-progress" | "completed" | "now-playing" | "locked";

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
}

const statusMap: Record<Status, StatusConfig> = {
  "in-progress": {
    label: "In Progress",
    icon: <LoaderIcon size={16} className="animate-spin" />,
    color: "text-neutral-500",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircleIcon size={16} />,
    color: "text-green-500",
  },
  "now-playing": {
    label: "Now Playing",
    icon: <PlayCircleIcon size={16} />,
    color: "text-primary-500",
  },
  locked: {
    label: "Locked",
    icon: <LockIcon size={16} />,
    color: "text-neutral-400",
  },
};

interface StatusIndicatorProps {
  status: Status;
  className?: string;
}

export function StatusIndicator({ status, className = "" }: StatusIndicatorProps) {
  const { label, icon, color } = statusMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${color} ${className}`}>
      {icon}
      {label}
    </span>
  );
}
