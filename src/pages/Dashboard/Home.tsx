import { useMemo } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/Store";
import {
  useAllotmentIpos,
  useOpenIpos,
  useRecentlyListed,
  useUpcomingIpos,
} from "@/queries/ipoQueries";
import { useAppliedCount } from "@/queries/userQueries";
import { newestUpdate } from "@/Helper/ipoHelper";
import {
  averageListingGain,
  dedupeById,
  topByGmp,
  topRated,
  weekCalendar,
} from "@/Helper/ipoGroups";
import IPOCard from "@/components/ipo/IPOCard";
import FreshnessLabel from "@/components/ipo/FreshnessLabel";
import { IPOCardSkeleton } from "@/components/ipo/Skeleton";
import SectionHeader, { SEE_ALL_LINK } from "@/components/home/SectionHeader";
import HomeStats from "@/components/home/HomeStats";
import TopLists from "@/components/home/TopLists";
import QuickActions from "@/components/home/QuickActions";
import WeekCalendar from "@/components/home/WeekCalendar";
import RecentlyListedList from "@/components/home/RecentlyListedList";
import AllotmentDue from "@/components/home/AllotmentDue";
import YourIpos from "@/components/home/YourIpos";
import HowItWorks from "@/components/home/HowItWorks";
import IpoBasics from "@/components/home/IpoBasics";

const MAX_OPEN_ON_HOME = 6;
const MAX_ALLOTMENT_ON_HOME = 6;
const MAX_LISTED_ON_HOME = 3;

export const Home = () => {
  const open = useOpenIpos();
  const upcoming = useUpcomingIpos();
  const allotment = useAllotmentIpos();
  const listed = useRecentlyListed();

  const { isAuthenticated, roles } = useSelector(
    (state: RootState) => state.auth
  );
  const canTrack = isAuthenticated && roles.includes("ROLE_USER");
  const applied = useAppliedCount(canTrack);

  const openList = open.data ?? [];
  const upcomingList = upcoming.data ?? [];
  const allotmentList = allotment.data ?? [];
  const listedList = listed.data ?? [];

  // Admins also have ROLE_USER, and "my dashboard" means their own IPOs, so the
  // user dashboard wins; the admin dashboard is reached from the sidebar.
  const dashboardPath =
    roles.includes("ROLE_ADMIN") && !roles.includes("ROLE_USER")
      ? "/admin"
      : "/user";
  const updatedAt = newestUpdate(openList);

  const { gmpTop, ratedTop, week } = useMemo(() => {
    // IPOs people can still act on: ranked by GMP and rating.
    const live = dedupeById([...openList, ...upcomingList, ...allotmentList]);

    return {
      gmpTop: topByGmp(live, 3),
      ratedTop: topRated(live, 3),
      week: weekCalendar([...live, ...listedList], new Date()),
    };
  }, [openList, upcomingList, allotmentList, listedList]);

  const weekHasEvents = week.some((day) => day.events.length > 0);

  return (
    <div className="w-full min-w-0 max-w-full space-y-10">
      {/* Hero */}
      <section className="relative w-full min-w-0 overflow-hidden rounded-2xl bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-4 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        <div className="relative min-w-0 max-w-2xl">
          <p className="text-theme-xs font-semibold uppercase tracking-widest text-brand-100">
            VirtuStock • IPO simulator for India
          </p>

          <h1 className="mt-2 break-words text-title-sm font-semibold sm:text-title-md">
            Pehle Samjho, Phir Invest Karo
          </h1>

          <p className="mt-3 text-sm text-brand-100 sm:text-base">
            Track GMP, subscription and verdicts for every IPO, and keep a
            record of the ones you apply to.
          </p>

          <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2.5">
            <Link
              to="/ipo/open"
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-theme-xs transition hover:bg-brand-25"
            >
              Browse open IPOs
            </Link>

            <Link
              to="/ipo/allotment"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition hover:bg-white/10"
            >
              Check allotment
            </Link>

            <Link
              to={isAuthenticated ? dashboardPath : "/signin"}
              className="px-2 py-2.5 text-sm font-medium text-brand-100 underline-offset-4 hover:text-white hover:underline"
            >
              {isAuthenticated ? "My dashboard →" : "Sign in →"}
            </Link>
          </div>
        </div>
      </section>

      <HomeStats
        open={open.data ? openList.length : undefined}
        upcoming={upcoming.data ? upcomingList.length : undefined}
        awaiting={allotment.data ? allotmentList.length : undefined}
        averageGain={averageListingGain(listedList)}
      />

      <TopLists gmp={gmpTop} rated={ratedTop} />

      <QuickActions />

      {weekHasEvents && (
        <section className="min-w-0">
          <SectionHeader title="This week" />
          <WeekCalendar days={week} />
        </section>
      )}

      {/* Open IPOs */}
      <section className="min-w-0">
        <SectionHeader
          title="Open now"
          badge={open.data ? String(openList.length) : undefined}
          right={
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
              <FreshnessLabel date={updatedAt} prefix="Data updated" />

              {openList.length > MAX_OPEN_ON_HOME && (
                <Link
                  to="/ipo/open"
                  className="text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
                >
                  View all {openList.length} →
                </Link>
              )}
            </div>
          }
        />

        {open.isLoading ? (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <IPOCardSkeleton />
            <IPOCardSkeleton />
            <IPOCardSkeleton />
          </div>
        ) : open.isError ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center sm:p-8 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We couldn't load open IPOs right now.
            </p>

            <button
              type="button"
              onClick={() => open.refetch()}
              className="mt-3 text-theme-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
            >
              Try again
            </button>
          </div>
        ) : openList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center sm:p-8 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No IPOs are open for bidding right now.
            </p>

            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              Check upcoming and recent IPOs below.
            </p>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {openList.slice(0, MAX_OPEN_ON_HOME).map((ipo) => (
              <div key={ipo.id} className="min-w-0">
                <IPOCard ipo={ipo} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming IPOs */}
      {upcomingList.length > 0 && (
        <section className="min-w-0">
          <SectionHeader
            title="Upcoming"
            badge={String(upcomingList.length)}
          />

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcomingList.slice(0, 3).map((ipo) => (
              <div key={ipo.id} className="min-w-0">
                <IPOCard ipo={ipo} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently listed */}
      {listedList.length > 0 && (
        <section className="min-w-0">
          <SectionHeader
            title="Recently listed"
            right={
              <Link to="/ipo/all" className={SEE_ALL_LINK}>
                See all →
              </Link>
            }
          />
          <RecentlyListedList ipos={listedList.slice(0, MAX_LISTED_ON_HOME)} />
        </section>
      )}

      {/* Allotment due */}
      {allotmentList.length > 0 && (
        <section className="min-w-0">
          <SectionHeader
            title="Allotment due"
            badge={String(allotmentList.length)}
            right={
              <Link to="/ipo/allotment" className={SEE_ALL_LINK}>
                See all →
              </Link>
            }
          />
          <AllotmentDue ipos={allotmentList.slice(0, MAX_ALLOTMENT_ON_HOME)} />
        </section>
      )}

      {/* Your IPOs */}
      {canTrack && applied.data !== undefined && (
        <section className="min-w-0">
          <SectionHeader title="Your IPOs" />
          <YourIpos count={applied.data} dashboardPath={dashboardPath} />
        </section>
      )}

      {/* How it works */}
      <section className="min-w-0">
        <SectionHeader title="How VirtuStock works" />
        <HowItWorks signedIn={isAuthenticated} />
      </section>

      {/* IPO basics */}
      <section className="min-w-0">
        <SectionHeader title="IPO basics" />
        <IpoBasics />
      </section>
    </div>
  );
};
