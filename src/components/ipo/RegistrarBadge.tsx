import { Registrar } from "@/Interface/IPO";
import { registrarShortName } from "@/Helper/registrar";
import { RegistrarLogo } from "@/pages/IPO/RegistrarSection";

/** Compact "logo + first name" for table cells. Shows "—" without a registrar. */
export default function RegistrarBadge({
  registrar,
}: {
  registrar?: Registrar | null;
}) {
  const fullName = registrar?.name?.trim();
  const shortName = registrarShortName(fullName);

  if (!fullName || !shortName) {
    return <span className="text-gray-400 dark:text-gray-500">—</span>;
  }

  return (
    <span
      title={fullName}
      className="inline-flex items-center gap-1.5 whitespace-nowrap text-theme-xs font-medium text-gray-700 dark:text-gray-300"
    >
      <RegistrarLogo
        name={fullName}
        logo={registrar?.logo}
        className="h-6 w-6 rounded-md text-[9px] [&>img]:p-0.5"
      />
      {shortName}
    </span>
  );
}
