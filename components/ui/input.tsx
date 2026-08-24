import { type InputHTMLAttributes } from "react";
import { ChevronDownIcon, SearchIcon } from "./icons";

const fieldBase =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-primary-400 transition-colors";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function TextInput({ className = "", ...props }: InputProps) {
  return <input className={`${fieldBase} ${className}`} {...props} />;
}

interface SearchInputProps extends InputProps {
  variant?: "default" | "lg";
}

export function SearchInput({
  placeholder = "Search anything...",
  className = "",
  variant = "default",
  ...props
}: SearchInputProps) {
  if (variant === "lg") {
    return (
      <div className={`relative ${className}`}>
        <SearchIcon
          size={20}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          type="search"
          placeholder={placeholder}
          className="h-20 w-full rounded-xl border border-neutral-200 bg-white pl-14 pr-28 text-lg text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary-400 transition-colors shadow-md"
          {...props}
        />
        <SearchIcon
          size={20}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <SearchIcon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
      />
      <input
        type="search"
        placeholder={placeholder}
        className={`${fieldBase} pl-9 pr-16`}
        {...props}
      />
      <SearchIcon
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
      />
    </div>
  );
}

interface SelectProps {
  options: { label: string; value: string }[];
  value?: string;
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  value,
  placeholder = "Select…",
  className = "",
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        defaultValue={value ?? ""}
        className={`${fieldBase} appearance-none pr-10 cursor-pointer`}
      >
        {!value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
      />
    </div>
  );
}
