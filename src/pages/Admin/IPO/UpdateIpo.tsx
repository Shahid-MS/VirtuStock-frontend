import { queryClient } from "@/queryClient";
import NotFound from "../../OtherPage/NotFound";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { IPOInterface } from "../../../Interface/IPO";
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
import { AxiosError } from "axios";
import { Verdict } from "@/Enum/Verdict";

export default function UpdateIPO() {
  const { id } = useParams();
  const [ipo, setIpo] = useState<IPOInterface>();
  const [loading, setLoading] = useState(true);

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
    const fetchIpo = async () => {
      try {
        const res = await apiClient.get(`/ipo/${id}`);
        setIpo(res.data);
      } catch {
        setIpo(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchIpo();
  }, [id]);

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
      const res = await apiClient.put(
        `/admin/ipo/${ipo?.id}`,
        changedData
      );

      toast.success(res.data.message);

      queryClient.invalidateQueries({ queryKey: ["ipo"] });
      queryClient.invalidateQueries({ queryKey: ["ipo-gmp"] });
      queryClient.invalidateQueries({ queryKey: ["ipos"] });

      setIpo((prev) =>
        prev
          ? {
              ...prev,
              verdict: data.verdict,
              issueSize: data.issueSize,
            }
          : prev
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Failed to update IPO"
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
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