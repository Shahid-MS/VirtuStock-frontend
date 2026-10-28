import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- small pieces ---------- */

export function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-4 w-4 animate-spin rounded-full border-2 ${
        dark
          ? "border-gray-400/40 border-t-gray-600 dark:border-white/20 dark:border-t-white"
          : "border-white/40 border-t-white"
      }`}
    />
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

/** Server-side / form-level error. */
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-error-200 bg-error-50 px-3.5 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
    >
      <svg
        className="mt-0.5 shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.01" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

/**
 * Smoothly expands / collapses its content. While closed the content is
 * inert, so it can't be focused or tabbed to.
 */
export function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      inert={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      {/* Padding + negative margin keep input focus rings from being clipped */}
      <div className="-mx-1 -my-1 min-h-0 overflow-hidden px-1 py-1">
        {children}
      </div>
    </div>
  );
}

/* ---------- inputs ---------- */

export interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  hint?: string;
  /** Extra content shown inside the input, on the right (e.g. a button). */
  trailing?: ReactNode;
}

const STATE_CLASSES = {
  default:
    "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800",
  error:
    "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-800",
  success:
    "border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:border-success-500 dark:focus:border-success-800",
};

export function TextField({
  label,
  required,
  error,
  success,
  hint,
  trailing,
  className = "",
  id,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const state = error ? "error" : success ? "success" : "default";

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
      >
        {label}
        {required && <span className="text-error-500"> *</span>}
      </label>

      <div className="relative">
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error || hint ? messageId : undefined}
          {...rest}
          className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs transition-colors placeholder:text-gray-400 focus:outline-hidden focus:ring-3 read-only:cursor-default read-only:bg-gray-50 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:read-only:bg-white/[0.03] ${
            trailing || success ? "pr-11" : ""
          } ${STATE_CLASSES[state]} ${className}`}
        />

        {trailing ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        ) : (
          success && (
            <CheckIcon className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-success-500" />
          )
        )}
      </div>

      {(error || hint) && (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={`mt-1.5 text-xs ${
            error ? "text-error-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

/** Password input with a show/hide button and a Caps Lock warning. */
export function PasswordField(props: Omit<TextFieldProps, "type" | "trailing">) {
  const { onBlur, onKeyUp, onKeyDown, ...rest } = props;
  const [show, setShow] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const detectCapsLock = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <div>
      <TextField
        {...rest}
        type={show ? "text" : "password"}
        onKeyDown={(e) => {
          detectCapsLock(e);
          onKeyDown?.(e);
        }}
        onKeyUp={(e) => {
          detectCapsLock(e);
          onKeyUp?.(e);
        }}
        onBlur={(e) => {
          setCapsLock(false);
          onBlur?.(e);
        }}
        trailing={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
          >
            {show ? (
              <EyeIcon className="size-5 fill-current" />
            ) : (
              <EyeCloseIcon className="size-5 fill-current" />
            )}
          </button>
        }
      />

      {capsLock && (
        <p
          role="status"
          className="mt-1.5 flex items-center gap-1.5 text-xs text-warning-600 dark:text-warning-400"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3 4 12h4v5h8v-5h4L12 3ZM8 21h8" />
          </svg>
          Caps Lock is on
        </p>
      )}
    </div>
  );
}

/* ---------- shared by sign up and reset password ---------- */

export const OTP_LENGTH = 6;

/* ---------- one-time code: six boxes ---------- */

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** True while the boxes are on screen; focuses the first one when it turns on. */
  active: boolean;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({ value, onChange, active, disabled, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (index: number) =>
    refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();

  // Wait for the section to finish expanding, then put the cursor in the first box.
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => refs.current[0]?.focus(), 320);
    return () => clearTimeout(timer);
  }, [active]);

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");

    // The box was cleared
    if (digits === "") {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }

    // One digit typed (or a multi-digit autofill landing in an empty box)
    const next = (value.slice(0, index) + digits + value.slice(index + 1)).slice(
      0,
      OTP_LENGTH
    );
    onChange(next);
    focusBox(next.length);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      e.preventDefault();
      onChange(value.slice(0, index - 1) + value.slice(index));
      focusBox(index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusBox(pasted.length);
  };

  return (
    <div role="group" aria-label="One-time code" className="flex gap-2">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => {
        const filled = Boolean(value[i]);
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            aria-invalid={error}
            // A filled box takes one character (typing replaces); an empty one
            // allows a full pasted / autofilled code.
            maxLength={filled ? 1 : OTP_LENGTH}
            disabled={disabled}
            value={value[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`h-12 w-full min-w-0 max-w-12 rounded-lg border text-center text-lg font-semibold shadow-theme-xs transition focus:outline-hidden focus:ring-3 disabled:opacity-50 dark:text-white/90 ${
              error
                ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                : filled
                ? "border-brand-300 bg-brand-25 text-gray-800 focus:border-brand-400 focus:ring-brand-500/20 dark:border-brand-500/50 dark:bg-brand-500/10"
                : "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
            }`}
          />
        );
      })}
    </div>
  );
}

/* ---------- progress ---------- */

export type StepState = "done" | "current" | "upcoming";

export function Stepper({
  steps,
  label = "Progress",
}: {
  steps: { label: string; state: StepState }[];
  label?: string;
}) {
  return (
    <ol className="mb-6 grid grid-cols-3 gap-2" aria-label={label}>
      {steps.map((step) => (
        <li
          key={step.label}
          aria-current={step.state === "current" ? "step" : undefined}
        >
          <div
            className={`h-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
              step.state === "done"
                ? "bg-brand-500"
                : step.state === "current"
                ? "bg-brand-300"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
          <p
            className={`mt-1.5 flex items-center gap-1 text-xs ${
              step.state === "upcoming"
                ? "text-gray-400 dark:text-gray-500"
                : "font-medium text-gray-700 dark:text-gray-300"
            }`}
          >
            {step.state === "done" && (
              <CheckIcon className="h-3 w-3 text-brand-500" />
            )}
            {step.label}
          </p>
        </li>
      ))}
    </ol>
  );
}

/* ---------- password strength ---------- */

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = [
  "bg-gray-200 dark:bg-gray-700",
  "bg-error-500",
  "bg-warning-500",
  "bg-brand-500",
  "bg-success-500",
];

const passwordScore = (password: string) => {
  if (password.length < 6) return 0;
  let score = 1;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export function PasswordStrength({ password }: { password: string }) {
  if (!password) {
    return (
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Use 6–20 characters. Mixing cases, numbers and symbols makes it stronger.
      </p>
    );
  }

  const score = passwordScore(password);
  const lengthOk = password.length >= 6 && password.length <= 20;

  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
              segment <= score
                ? STRENGTH_COLORS[score]
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {STRENGTH_LABELS[score]}
        </span>
        <span
          className={`flex items-center gap-1 ${
            lengthOk
              ? "text-success-600 dark:text-success-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {lengthOk && <CheckIcon className="h-3 w-3" />}
          6–20 characters
        </span>
      </div>
    </div>
  );
}