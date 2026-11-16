import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import { UserInterface } from "@/Interface/IPO";

export type EditableField =
  | "firstName"
  | "lastName"
  | "phone"
  | "linkedinUrl"
  | "instagramUrl";

/** Sent from the hero to the editor ("+ Phone" opens the editor on that field). */
export interface EditRequest {
  field?: EditableField;
  nonce: number;
}

interface UserMetaCardProps {
  user: UserInterface;
  onEdit?: (field?: EditableField) => void;
}

const FALLBACK_AVATAR = "/images/user/user.png";

const formatRole = (role: string) => {
  const name = role.replace("ROLE_", "");
  return name.charAt(0) + name.slice(1).toLowerCase();
};

// "linkedin.com/in/me" without a protocol would otherwise open as a path inside the app.
const withProtocol = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

/** Counts 0 → target with an ease-out; jumps straight there for reduced motion. */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

const LinkedInIcon = () => (
  <svg
    className="fill-current"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    className="fill-current"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z" />
  </svg>
);

/** Frosted-glass social button for the dark hero. */
function SocialLink({
  href,
  name,
  children,
}: {
  href: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <a
      href={withProtocol(href)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} profile`}
      className="group/btn relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-900 opacity-0 shadow-theme-sm transition-opacity duration-150 group-hover/btn:opacity-100 group-focus-visible/btn:opacity-100 max-sm:hidden"
      >
        {name}
      </span>
    </a>
  );
}

const RING_RADIUS = 30;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

interface StrengthCheck {
  key: string;
  label: string;
  done: boolean;
  field?: EditableField;
}

export default function UserMetaCard({ user, onEdit }: UserMetaCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(false);

  const photoSrc =
    !imageFailed && user.profilePicUrl ? user.profilePicUrl : FALLBACK_AVATAR;
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const hasSocial = Boolean(user.linkedinUrl || user.instagramUrl);

  // Profile strength: name + email always exist, the rest the user can add.
  const checks: StrengthCheck[] = [
    { key: "photo", label: "Photo", done: Boolean(user.profilePicUrl) },
    { key: "lastName", label: "Last name", done: Boolean(user.lastName), field: "lastName" },
    { key: "phone", label: "Phone", done: Boolean(user.phone), field: "phone" },
    { key: "linkedin", label: "LinkedIn", done: Boolean(user.linkedinUrl), field: "linkedinUrl" },
    { key: "instagram", label: "Instagram", done: Boolean(user.instagramUrl), field: "instagramUrl" },
  ];
  const BASE_DONE = 2;
  const total = checks.length + BASE_DONE;
  const doneCount = BASE_DONE + checks.filter((c) => c.done).length;
  const percent = Math.round((doneCount / total) * 100);
  const missing = checks.filter((c) => !c.done);
  const shownPercent = useCountUp(percent);

  // Soft spotlight that follows the mouse (mouse only: no effect on touch screens).
  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  // Photo viewer: Esc closes it and the page behind doesn't scroll.
  useEffect(() => {
    if (!viewPhoto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewPhoto(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [viewPhoto]);

  return (
    <>
      <section
        onPointerMove={handlePointerMove}
        className="group/hero relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-5 text-white shadow-theme-md sm:p-7"
      >
        {/* Dot grid, fading out downwards */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        {/* Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl"
        />
        {/* Spotlight following the cursor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/hero:opacity-100 max-lg:hidden"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.13), transparent 60%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-6 text-center xl:flex-row xl:gap-8 xl:text-left">
          {/* Photo with gradient ring: tap to enlarge */}
          <div className="shrink-0 rounded-full bg-[conic-gradient(from_200deg,#7592ff,#22d3ee,#a78bfa,#7592ff)] p-[3px] shadow-theme-lg">
            <button
              type="button"
              onClick={() => setViewPhoto(true)}
              aria-label="View profile photo"
              className="group/photo relative block h-24 w-24 overflow-hidden rounded-full border-4 border-brand-800 bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-28 sm:w-28"
            >
              <img
                className="h-full w-full object-cover transition-transform duration-500 group-hover/photo:scale-110 motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100"
                src={photoSrc}
                alt={user.firstName}
                onError={() => setImageFailed(true)}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
                </svg>
              </span>
            </button>
          </div>

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {fullName}
            </h2>
            <p className="mt-1 truncate text-sm text-brand-100">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 xl:justify-start">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur"
                >
                  {formatRole(role)}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2.5 xl:justify-start">
              {user.linkedinUrl && (
                <SocialLink href={user.linkedinUrl} name="LinkedIn">
                  <LinkedInIcon />
                </SocialLink>
              )}
              {user.instagramUrl && (
                <SocialLink href={user.instagramUrl} name="Instagram">
                  <InstagramIcon />
                </SocialLink>
              )}
              {!hasSocial && (
                <p className="text-sm text-brand-100/80">
                  No social links added yet
                </p>
              )}
            </div>
          </div>

          {/* Profile strength */}
          <div className="w-full max-w-sm rounded-2xl bg-white/10 p-4 text-left ring-1 ring-white/15 backdrop-blur xl:w-72 xl:max-w-none xl:shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative h-[72px] w-[72px] shrink-0">
                <svg
                  viewBox="0 0 72 72"
                  className="h-full w-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="36"
                    cy="36"
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth="6"
                    className="stroke-white/20"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="stroke-white"
                    strokeDasharray={RING_LENGTH}
                    strokeDashoffset={RING_LENGTH * (1 - shownPercent / 100)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-base font-semibold tabular-nums">
                  {shownPercent}%
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Profile strength</p>
                <p className="text-xs text-brand-100">
                  {missing.length === 0
                    ? "Your profile is complete"
                    : `${doneCount} of ${total} details added`}
                </p>
              </div>
            </div>

            {missing.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {missing.slice(0, 3).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onEdit?.(item.field)}
                    className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium ring-1 ring-white/20 transition hover:bg-white hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-white active:scale-95 motion-reduce:transition-none"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {viewPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${fullName || "Profile"} photo`}
          onClick={() => setViewPhoto(false)}
          className="fixed inset-0 z-99999 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setViewPhoto(false)}
            aria-label="Close photo"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <img
            src={photoSrc}
            alt={fullName || "Profile photo"}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}