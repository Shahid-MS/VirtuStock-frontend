import { useEffect, useState } from "react";
import UserInfoCard from "./UserInfoCard";
import UserMetaCard, { type EditRequest, type EditableField } from "./UserMetaCard";
import { UserInterface } from "@/Interface/IPO";
import apiClient from "@/API/ApiClient";
import { Skeleton } from "@/components/ipo/Skeleton";

function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      <Skeleton className="h-72 w-full rounded-3xl sm:h-64 xl:h-48" />

      <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
        <Skeleton className="mb-6 h-5 w-48" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[74px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const [user, setUser] = useState<UserInterface>();
  const [loading, setLoading] = useState(true);
  const [editRequest, setEditRequest] = useState<EditRequest | null>(null);

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

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const retry = () => {
    setLoading(true);
    fetchUserDetails();
  };

  // The hero's "+ Phone" style chips ask the editor below to open on that field.
  const requestEdit = (field?: EditableField) =>
    setEditRequest((prev) => ({ field, nonce: (prev?.nonce ?? 0) + 1 }));

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (user === undefined || user === null) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          We couldn't load your profile.
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserMetaCard user={user} onEdit={requestEdit} />
      <UserInfoCard user={user} setUser={setUser} editRequest={editRequest} />
    </div>
  );
}