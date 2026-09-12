import NotFound from "../OtherPage/NotFound";
import { useParams } from "react-router";
import GMPHeader from "./GMPHeader";
import GMPTable from "./GMPTable";
import { useEffect, useState } from "react";

import { IPOInterface } from "../../Interface/IPO";
import Loading from "../OtherPage/Loading";
import apiClient from "../../API/ApiClient";

export default function GMPIPO() {
  const { id } = useParams();
  const [ipo, setIpo] = useState<IPOInterface>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIpo = async () => {
      const res = await apiClient.get(`/ipo/${id}/gmp`);
      setIpo(res.data);
      setTimeout(() => {
        setLoading(false);
      }, 250);
    };
    fetchIpo();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (ipo === undefined || ipo === null) {
    return <NotFound />;
  }

  return (
    <>
      <div className="space-y-6">
        <GMPHeader ipo={ipo} />
        <GMPTable ipo={ipo} />
      </div>
    </>
  );
}
