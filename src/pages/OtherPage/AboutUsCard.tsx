import { useState } from "react";

interface MemberInterface {
  name: string;
  role: string;
  instagramUrl: string;
  linkedInUrl?: string;
  details: string;
  image: string;
}
interface AboutUsCardProps {
  member: MemberInterface;
  index: number;
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

interface SocialLinkProps {
  href: string;
  label: string;
  /** Brand-colour hover styles for this network */
  hoverClass: string;
  children: React.ReactNode;
}

const SocialLink = ({ href, label, hoverClass, children }: SocialLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`group/btn relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition duration-200 hover:-translate-y-0.5 hover:border-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-95 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 ${hoverClass}`}
  >
    {children}
    {/* Name tooltip (hover / keyboard focus; hidden on small touch screens) */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-150 group-hover/btn:opacity-100 group-focus-visible/btn:opacity-100 max-sm:hidden dark:bg-white dark:text-gray-900"
    >
      {label.split(" on ").pop()}
    </span>
  </a>
);

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// Longer bios start collapsed on phones/tablets, with a Read more toggle.
const LONG_DETAILS = 110;

const AboutUsCard = ({ member, index }: AboutUsCardProps) => {
  const isReverse = index % 2 !== 0;
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const isLong = member.details.length > LONG_DETAILS;
  const align = isReverse ? "lg:text-right" : "lg:text-left";

  return (
    <article
      className={`group relative mb-5 rounded-2xl border border-gray-200 bg-white p-5 transition-colors duration-200 hover:border-brand-300 focus-within:border-brand-300 motion-reduce:transition-none dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40 dark:focus-within:border-brand-500/40 sm:p-6 lg:w-3/4 lg:p-4 ${
        isReverse ? "lg:ml-auto" : "lg:mr-auto"
      }`}
    >
      {/* Accent edge: sits on the side the photo is on and grows in on hover */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-4 w-1 origin-center scale-y-0 rounded-full bg-brand-500 transition-transform duration-300 ease-out group-hover:scale-y-100 group-focus-within:scale-y-100 motion-reduce:transition-none ${
          isReverse ? "right-0" : "left-0"
        }`}
      />

      <div
        className={`flex flex-col items-center gap-4 sm:gap-5 lg:items-center lg:gap-6 ${
          isReverse ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        {/* Photo */}
        <div className="shrink-0">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 ring-2 ring-transparent ring-offset-2 ring-offset-white transition duration-300 group-hover:ring-brand-400 motion-reduce:transition-none dark:border-gray-800 dark:bg-gray-800 dark:ring-offset-gray-900 dark:group-hover:ring-brand-500/70 sm:h-28 sm:w-28 lg:h-20 lg:w-20">
            {imageFailed || !member.image ? (
              <span className="text-xl font-semibold text-gray-500 dark:text-gray-300">
                {getInitials(member.name)}
              </span>
            ) : (
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            )}
          </div>
        </div>

        {/* Text (below the links on small screens, between photo and links on large) */}
        <div className="order-3 min-w-0 text-center lg:order-2 lg:flex-1">
          <h3
            className={`text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl ${align}`}
          >
            {member.name}
          </h3>

          <p
            className={`mb-3 text-sm font-medium text-brand-600 dark:text-brand-400 ${align}`}
          >
            {member.role}
          </p>

          <div
            className={`text-sm leading-relaxed text-gray-600 dark:text-gray-300 ${align} ${
              isLong
                ? `max-lg:overflow-hidden max-lg:transition-[max-height] max-lg:duration-300 motion-reduce:transition-none ${
                    expanded
                      ? "max-lg:max-h-96"
                      : "max-lg:max-h-[4.75rem] max-lg:[mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
                  }`
                : ""
            }`}
          >
            <p id={`about-details-${index}`}>{member.details}</p>
          </div>

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls={`about-details-${index}`}
              className="mt-1 rounded text-sm font-medium text-brand-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 lg:hidden dark:text-brand-400"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Social links */}
        <div className="order-2 flex items-center gap-2.5 lg:order-3">
          {member.linkedInUrl && (
            <SocialLink
              href={member.linkedInUrl}
              label={`${member.name} on LinkedIn`}
              hoverClass="hover:bg-[#0A66C2]"
            >
              <LinkedInIcon />
            </SocialLink>
          )}

          <SocialLink
            href={member.instagramUrl}
            label={`${member.name} on Instagram`}
            hoverClass="hover:bg-linear-to-tr hover:from-[#feda75] hover:via-[#d62976] hover:to-[#4f5bd5]"
          >
            <InstagramIcon />
          </SocialLink>
        </div>
      </div>
    </article>
  );
};

export default AboutUsCard;