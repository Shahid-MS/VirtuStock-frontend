import { useQueryClient } from "@tanstack/react-query";
import NotFound from "../../OtherPage/NotFound";
import { useParams } from "react-router";
import { useEffect } from "react";
import Loading from "../../OtherPage/Loading";
import Button from "../../../components/ui/button/Button";
import VerdictForm from "./Update IPO Form Elements/VerdictForm";
import IssueSizeForm from "./Update IPO Form Elements/IssueSizeForm";
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
    formState: { errors },
  } = useForm<UpdateIpoFormInput>({
    resolver: zodResolver(updateIpoSchema),
  });

  useEffect(() => {
    if (ipo) {
      reset({
        verdict: ipo.verdict as Verdict,
        issueSize: ipo.issueSize,
      });
    }
  }, [ipo, reset]);

  const onSubmit = async (data: UpdateIpoFormInput) => {
    const changedData = {
      verdict: data.verdict,
      issueSize: data.issueSize,
    };

    try {
      const res = await apiClient.put(`/admin/ipo/${ipo?.id}`, changedData);

      toast.success(res.data.message);

      // Only this IPO's caches and the lists need to refresh; the refetched
      // detail also repopulates this form.
      await invalidateIpo(queryClient, ipo?.id);
    } catch (error) {
      toastFallbackError(error, "Failed to update IPO");
    }
  };

  if (loading) return <Loading />;

  if (!ipo) return <NotFound />;

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

          <VerdictForm
            setValue={setValue}
            watch={watch}
            register={register}
          />
        </div>

        <div className="pt-4 flex justify-center">
          <Button
            className="w-1/4"
            variant="outline"
            type="submit"
          >
            Update IPO
          </Button>
        </div>
      </form>
    </div>
  );
}