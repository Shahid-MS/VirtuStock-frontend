const Community = () => {
  const WHATSAPP_LINK =
    "https://chat.whatsapp.com/FlK8sMxzeg2E1PUYd5rbt1";
  const INSTAGRAM_URL = "https://www.instagram.com/virtustock.in";
  const YOUTUBE_LINK = "https://youtube.com/@virtustock";

  const socials = [
    {
      name: "WhatsApp",
      description: "Join our community",
      href: WHATSAPP_LINK,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/40",
      border: "hover:border-green-500",
      icon: (
        <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor">
          <path d="M16.04 2C8.84 2 3 7.84 3 15.04c0 2.66.74 5.14 2.03 7.26L3 30l7.9-2.06a13 13 0 0 0 5.14 1.03c7.2 0 13.04-5.84 13.04-13.04C29.08 8.84 23.24 2 16.04 2Zm0 23.78a10.7 10.7 0 0 1-4.98-1.24l-.36-.19-4.69 1.22 1.25-4.56-.23-.37a10.69 10.69 0 1 1 9.01 5.14Zm5.8-7.89c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.35-.26-.63-.52-.55-.71-.56h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.27 3.46 5.49 4.86.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.89-.77 2.16-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      description: "Follow our updates",
      href: INSTAGRAM_URL,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-950/40",
      border: "hover:border-pink-500",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      description: "Watch our videos",
      href: YOUTUBE_LINK,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40",
      border: "hover:border-red-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.5v-7l6.1 3.5-6.1 3.5Z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative grid grid-cols-1 items-center gap-6 p-5 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <div className="flex items-center justify-center">
          <img
            src="/images/community/community.png"
            alt="VirtuStock community"
            className="h-44 w-full max-w-sm object-contain transition-transform duration-500 hover:scale-105 sm:h-56 lg:h-64"
          />
        </div>

        <div className="space-y-5 text-center lg:text-left">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              THE VIRTUSTOCK COMMUNITY
            </span>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Learn. Connect. <span className="text-yellow-500">Grow.</span>
            </h2>

            <p className="mx-auto max-w-lg text-sm leading-6 text-gray-600 dark:text-gray-400 lg:mx-0">
              Have questions or want to stay updated? Connect with fellow
              investors, follow IPO updates, and learn about the stock market
              with VirtuStock.
            </p>
          </div>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full bg-yellow-400 px-5 py-3 font-semibold text-gray-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
          >
            Join Our Community
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-7-7 7 7-7 7"
              />
            </svg>
          </a>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${social.name}: ${social.description}`}
                className={`group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 ${social.border}`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${social.bg} ${social.color}`}
                >
                  {social.icon}
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {social.name}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {social.description}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;