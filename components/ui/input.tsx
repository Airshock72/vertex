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

export function SearchInput({
  placeholder = "Search anything...",
  className = "",
  ...props
}: InputProps) {
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
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-sans select-none">
        ⌘K
      </kbd>
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
