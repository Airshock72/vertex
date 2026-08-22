import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";
type ButtonSize = "default" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-400 disabled:bg-primary-300 disabled:cursor-not-allowed",
  secondary:
    "bg-white text-primary-500 border border-primary-500 hover:bg-primary-100 disabled:text-primary-300 disabled:border-primary-200 disabled:cursor-not-allowed",
  tertiary:
    "bg-transparent text-neutral-700 hover:text-neutral-900 disabled:text-neutral-300 disabled:cursor-not-allowed",
  text:
    "bg-transparent text-primary-500 hover:text-primary-400 disabled:text-primary-300 disabled:cursor-not-allowed",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "default",
  icon,
  iconPosition = "right",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {iconPosition === "left" && icon}
      {children}
      {iconPosition === "right" && icon}
    </button>
  );
}
