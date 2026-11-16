/** "MUFG Intime India Private Limited" -> "MUFG" (first word only). */
export const registrarShortName = (name?: string | null): string =>
  name?.trim().split(/\s+/)[0] ?? "";

/** "Bigshare Services Private Limited" -> "BS" */
export const registrarInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

/** Only plain web links are rendered as links (guards against odd URL schemes). */
export const isWebUrl = (url?: string | null): url is string =>
  !!url && /^https?:\/\//i.test(url.trim());
