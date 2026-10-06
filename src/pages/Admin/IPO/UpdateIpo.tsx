import { queryClient } from "@/queryClient";
import NotFound from "../../OtherPage/NotFound";
import { useParams } from "react-router";
import { useEffect, useState } from "react";

import { IPOInterface } from "../../../Interface/IPO";
import Loading from "../../OtherPage/Loading";
import Button from "../../../components/ui/button/Button";
import GMPForm from "./Update IPO Form Elements/GMPForm";
import SubscriptionsForm from "./Update IPO Form Elements/SubscriptionsForm";
import IssueSizeForm from "./Update IPO Form Elements/IssueSizeForm";
import VerdictForm from "./Update IPO Form Elements/VerdictForm";
import apiClient from "../../../API/ApiClient";
import IPOHeader from "@/pages/IPO/IPOHeader";
import { UpdateIpoFormInput, updateIpoSchema } from "./UpdateIpoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AxiosError } from "axios";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Verdict } from "@/Enum/Verdict";
import { pickDirtyValues } from "./pickDirtyValues";

export default function UpdateIPO() {
  const { id } = useParams();
  const [ipo, setIpo] = useState<IPOInterface>();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, dirtyFields },
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
        subscriptions: ipo.subscriptions,
        issueSize: ipo.issueSize,
        verdict: ipo.verdict as Verdict,
        gmp: ipo.gmp,
        listedPrice: String(ipo.listedPrice),
      });
    }
  }, [ipo, reset]);

  const onSubmit = async (data: UpdateIpoFormInput) => {
    const changedData = pickDirtyValues(dirtyFields, data);
    if (Object.keys(changedData).length === 0) {
      toast.info("No changes to update");
      return;
    }
    try {
      const res = await apiClient.put(`/admin/ipo/${ipo?.id}`, changedData);
      toast.success(res.data.message);
      // Public pages cache IPO data; make sure they pick up the change.
      queryClient.invalidateQueries({ queryKey: ["ipo"] });
      queryClient.invalidateQueries({ queryKey: ["ipo-gmp"] });
      queryClient.invalidateQueries({ queryKey: ["ipos"] });
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else if (error instanceof Error) {
        toast.error(error?.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (ipo === undefined || ipo === null) {
    return <NotFound />;
  }

  return (
    <>
      <div className="space-y-6">
        <IPOHeader ipo={ipo} showActions={false} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <SubscriptionsForm
                register={register}
                setValue={setValue}
                errors={errors}
                watch={watch}
                getValues={getValues}
              />

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

            <div className="space-y-6">
              <GMPForm
                ipo={ipo}
                register={register}
                setValue={setValue}
                errors={errors}
                watch={watch}
                getValues={getValues}
              />

              <div className="space-y-6">
                <Label htmlFor="listedPrice">Listed Price</Label>
                <Input
                  id={id}
                  type="string"
                  {...register("listedPrice")}
                  onChange={(e) =>
                    setValue("listedPrice", e.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  error={!!errors?.listedPrice}
                  hint={errors?.listedPrice?.message}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <Button className="w-1/4" variant="outline" type="submit">
              Update IPO
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
