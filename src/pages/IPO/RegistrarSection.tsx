import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Registrar } from "@/Interface/IPO";
import { isWebUrl, registrarInitials } from "@/Helper/registrar";

/** Registrar logo; initials are shown when it is missing or fails to load. */
export function RegistrarLogo({
  name,
  logo,
  className,
}: {
  name: string;
  logo?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = logo?.trim();

  return (
    <div
      className={twMerge(
        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-white/[0.04] dark:text-gray-400",
        className
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        registrarInitials(name)
      )}
    </div>
  );
}

/**
 * @param showStatusLink Show "Check allotment status". Only meaningful once
 * the IPO has reached the allotment stage, so the caller decides.
 */
export default function RegistrarSection({
  registrar,
  showStatusLink = true,
}: {
  registrar?: Registrar | null;
  showStatusLink?: boolean;
}) {
  const name = registrar?.name?.trim();
  const url = registrar?.url?.trim();

  return (
    <div>
      <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
        Registrar
      </h3>

      {!name ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registrar details have not been added yet.
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex min-w-0 items-center gap-3">
            <RegistrarLogo name={name} logo={registrar?.logo} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {name}
              </p>
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                Handles share allotment and refunds
              </p>
            </div>
          </div>

          {showStatusLink && isWebUrl(url) && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
            >
              Check allotment status
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
