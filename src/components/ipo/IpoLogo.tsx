import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { registrarInitials } from "@/Helper/registrar";

/** Company logo; initials are shown when it is missing or fails to load. */
export default function IpoLogo({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = src?.trim();

  return (
    <div
      className={twMerge(
        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-white/[0.04] dark:text-gray-400",
        className
      )}
    >
      {url && !failed ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-0.5"
        />
      ) : (
        registrarInitials(name || "?")
      )}
    </div>
  );
}
