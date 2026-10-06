import { useEffect, useState } from "react";

import { AppliedIPOInterface } from "../../../../Interface/IPO";
import apiClient from "../../../../API/ApiClient";
import { useParams } from "react-router";

import IPOHeader from "@/pages/IPO/IPOHeader";
import Loading from "@/pages/OtherPage/Loading";
import AppliedIPODetails from "./AppliedIPODetails";
import NotFound from "@/pages/OtherPage/NotFound";

const AppliedIPO = () => {
  const { id } = useParams();
  const [appliedIpo, setAppliedIpo] = useState<AppliedIPOInterface>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedIpo = async () => {
      try {
        const res = await apiClient.get(`/user/applied-ipo/${id}`);
        setAppliedIpo(res.data);
      } catch {
        // setAppliedIpo(undefined);
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedIpo();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!appliedIpo || appliedIpo === null) {
    return <NotFound />;
  }

  return (
    <>
      <div className="space-y-6">
        <IPOHeader ipo={appliedIpo.ipo} />
        <AppliedIPODetails
          appliedIpo={appliedIpo}
          setAppliedIpo={setAppliedIpo}
        />
      </div>
    </>
  );
};

export default AppliedIPO;
