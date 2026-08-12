interface PrintTestButtonProps {
  label: string;
  icon: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick: () => void;
}

const buttonClass =
  "rounded-2xl px-6 py-3 text-xl font-semibold shadow-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

const VARIANT_CLASS = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700",
  secondary: "bg-sky-600 text-white hover:bg-sky-700",
} as const;

export default function PrintTestButton({
  label,
  icon,
  variant = "primary",
  disabled = false,
  onClick,
}: PrintTestButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClass} ${VARIANT_CLASS[variant]}`}
    >
      {icon} {label}
    </button>
  );
}
