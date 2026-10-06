import { useEffect, useState } from "react";
import UserInfoCard from "./UserInfoCard";
import UserMetaCard from "./UserMetaCard";
import { UserInterface } from "@/Interface/IPO";
import apiClient from "@/API/ApiClient";
import Loading from "@/pages/OtherPage/Loading";
import InternalServerError from "@/pages/OtherPage/InternalServerError";

export default function UserProfile() {
  const [user, setUser] = useState<UserInterface>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await apiClient.get(`/user`);
        setUser(res.data);
      } catch {
        setUser(undefined);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (user === undefined || user === null) {
    return <InternalServerError />;
  }
  return (
    <>
      <div className="space-y-6">
        <UserMetaCard user={user} />
        <UserInfoCard user={user} setUser={setUser} />
      </div>
    </>
  );
}
