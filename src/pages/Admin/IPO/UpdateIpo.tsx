import { useQueryClient } from "@tanstack/react-query";
import NotFound from "../../OtherPage/NotFound";
import { useParams } from "react-router";
import { useCallback, useEffect } from "react";
import Loading from "../../OtherPage/Loading";
import Button from "../../../components/ui/button/Button";
import VerdictForm from "./Update IPO Form Elements/VerdictForm";
import IssueSizeForm from "./Update IPO Form Elements/IssueSizeForm";
import RatingForm from "./Update IPO Form Elements/RatingForm";
import apiClient from "../../../API/ApiClient";
import IPOHeader from "@/pages/IPO/IPOHeader";
import { UpdateIpoFormInput, updateIpoSchema } from "./UpdateIpoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { toastFallbackError } from "@/API/errors";
import { Verdict } from "@/Enum/Verdict";
import { useIpoDetail } from "@/queries/ipoQueries";
import { invalidateIpo } from "@/queries/invalidate";

const FIELD_LABELS: Record<string, string> = {
  issueSize: "Issue size",
  verdict: "Verdict",
  rating: "Rating",
};

export default function UpdateIPO() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Always start the form from the server's current values.
  const { data: ipo, isLoading: loading } = useIpoDetail(id, { fresh: true });

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    register,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
  } = useForm<UpdateIpoFormInput>({
    resolver: zodResolver(updateIpoSchema),
  });

  const savedValues = useCallback(
    (): UpdateIpoFormInput | null =>
      ipo
        ? {
            verdict: ipo.verdict as Verdict,
            issueSize: ipo.issueSize,
            // BigDecimal may arrive as a number or a numeric string.
            rating: ipo.rating != null ? Number(ipo.rating) : undefined,
          }
        : null,
    [ipo]
  );

  useEffect(() => {
    const values = savedValues();
    if (values) reset(values);
  }, [savedValues, reset]);

  const onSubmit = useCallback(
    async (data: UpdateIpoFormInput) => {
      const changedData = {
        verdict: data.verdict,
        issueSize: data.issueSize,
        // Only sent once a rating exists, so unrated IPOs save as before.
        ...(data.rating ? { rating: data.rating } : {}),
      };

      try {
        const res = await apiClient.put(`/admin/ipo/${ipo?.id}`, changedData);

        toast.success(res.data.message);

        // The form is clean again; the refetch below re-syncs it with the server.
        reset(data);

        // Only this IPO's caches and the lists need to refresh.
        await invalidateIpo(queryClient, ipo?.id);
      } catch (error) {
        toastFallbackError(error, "Failed to update IPO");
      }
    },
    [ipo?.id, queryClient, reset]
  );

  // Ctrl/Cmd + S saves instead of opening the browser's "Save page" dialog.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (isDirty && !isSubmitting) void handleSubmit(onSubmit)();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDirty, isSubmitting, handleSubmit, onSubmit]);

  // Warn before closing or reloading the tab with unsaved edits.
  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  if (loading) return <Loading />;

  if (!ipo) return <NotFound />;

  const changedFields = Object.keys(dirtyFields)
    .map((key) => FIELD_LABELS[key])
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <IPOHeader ipo={ipo} showActions={false} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <IssueSizeForm
            register={register}
            setValue={setValue}
            errors={errors}
          />

          <div className="space-y-6">
            <RatingForm
              setValue={setValue}
              watch={watch}
              savedValue={ipo.rating != null ? Number(ipo.rating) : null}
            />

            <VerdictForm
              setValue={setValue}
              watch={watch}
              savedValue={ipo.verdict}
            />
          </div>
        </div>

        <div
          className={`mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 transition-colors dark:bg-gray-900 ${
            isDirty
              ? "border-brand-300 dark:border-brand-500/40"
              : "border-gray-200 dark:border-gray-800"
          }`}
        >
          <p
            aria-live="polite"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {isDirty
              ? `Unsaved changes: ${changedFields.join(", ") || "edited"}`
              : "No changes yet"}
          </p>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!isDirty || isSubmitting}
              onClick={() => {
                const values = savedValues();
                if (values) reset(values);
              }}
            >
              Discard
            </Button>

            <Button
              size="sm"
              type="submit"
              disabled={!isDirty || isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Update IPO"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
