/* eslint-disable @typescript-eslint/no-explicit-any */

import apiClient from "@/API/ApiClient";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/Store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { Rating } from "primereact/rating";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface RatingInterface {
  averageRating: number;
  totalUsers: number;
  distribution: Record<string, number>;
}

const RatingPage = () => {
  const [myRating, setMyRating] = useState(0);
  const [newRating, setNewRating] = useState(0);

  const { token } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  let roles: string[] = [];

  if (token) {
    try {
      roles = jwtDecode<{ roles?: string[] }>(token).roles ?? [];
    } catch {
      roles = [];
    }
  }

  const isUser = roles.includes("ROLE_USER");

  const fetchRating = async (): Promise<RatingInterface> => {
    const res = await apiClient.get("/feedback/rating");
    return res.data;
  };

  const fetchMyRating = async () => {
    const res = await apiClient.get("/user/rating");
    return res.data;
  };

  const submitRating = async (rating: number) => {
    const res = await apiClient.post("/user/rating", { rating });
    return res.data;
  };

  const {
    data: rating,
    isLoading,
    isError,
    refetch,
  } = useQuery<RatingInterface>({
    queryKey: ["rating"],
    queryFn: fetchRating,
    retry: 1,
  });

  const { data: myRate } = useQuery({
    queryKey: ["my-rating"],
    queryFn: fetchMyRating,
    retry: false,
    enabled: isUser,
  });

  useEffect(() => {
    const currentRating = Number(myRate?.rating ?? 0);
    setMyRating(currentRating);
    setNewRating(currentRating);
  }, [myRate]);

  const { mutate: rate, isPending } = useMutation({
    mutationFn: submitRating,
    onSuccess: async (data) => {
      toast.success(data.message || "Thank you for your feedback!");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-rating"] }),
        queryClient.invalidateQueries({ queryKey: ["rating"] }),
      ]);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to submit your rating"
      );
    },
  });

  const distribution = rating?.distribution ?? {};
  const totalRatings = Object.values(distribution).reduce(
    (sum, count) => sum + Number(count),
    0
  );

  return (
    <ComponentCard title="Community Rating">
      <div className="space-y-6">
        {/* Average rating */}
        <div className="rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-5 dark:border-yellow-900/50 dark:from-yellow-950/30 dark:to-gray-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overall experience
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {isLoading
                    ? "..."
                    : (rating?.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  / 5
                </span>
              </div>

              <div className="mt-2">
                <Rating
                  value={rating?.averageRating ?? 0}
                  readOnly
                  cancel={false}
                />
              </div>
            </div>

            <div className="rounded-lg bg-white/80 px-4 py-3 text-center shadow-sm dark:bg-gray-900/70">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rating?.totalUsers ?? 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total ratings
              </p>
            </div>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Rating breakdown
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalRatings} responses
            </span>
          </div>

          {isError ? (
            <div className="rounded-lg border border-red-200 p-4 text-sm text-red-600 dark:border-red-900">
              Unable to load ratings.
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="h-5 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            Object.entries(distribution)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([star, count]) => {
                const percentage =
                  totalRatings > 0
                    ? (Number(count) / totalRatings) * 100
                    : 0;

                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex w-12 shrink-0 items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <span>{star}</span>
                      <span className="text-yellow-500">★</span>
                    </div>

                    <div
                      className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                      role="progressbar"
                      aria-label={`${star} star ratings`}
                      aria-valuenow={Math.round(percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="w-8 text-right text-sm tabular-nums text-gray-500 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                );
              })
          )}
        </div>

        {/* Submit or update rating */}
        {isUser && (
          <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {myRating > 0 ? "Update your rating" : "Rate your experience"}
              </Label>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your feedback helps us improve VirtuStock.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Rating
                  value={newRating}
                  onChange={(e) => setNewRating(e.value ?? 0)}
                  cancel={false}
                />

                <p
                  className="text-sm font-medium text-yellow-600 dark:text-yellow-400"
                  aria-live="polite"
                >
                  {newRating === 0
                    ? "Select your rating"
                    : [
                        "",
                        "Poor",
                        "Fair",
                        "Good",
                        "Very good",
                        "Excellent",
                      ][newRating]}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  if (newRating < 1 || newRating > 5) {
                    toast.error("Please select a rating from 1 to 5");
                    return;
                  }

                  rate(newRating);
                }}
                disabled={isPending || newRating === myRating || newRating === 0}
              >
                {isPending
                  ? "Submitting..."
                  : myRating > 0
                    ? "Update Rating"
                    : "Submit Rating"}
              </Button>
            </div>

            {myRating > 0 && newRating !== myRating && newRating > 0 && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Your rating will change from {myRating} to {newRating} stars.
              </p>
            )}
          </div>
        )}

        {!isUser && (
          <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enjoying VirtuStock? Sign in with your user account to share your
              rating.
            </p>
          </div>
        )}
      </div>
    </ComponentCard>
  );
};

export default RatingPage;