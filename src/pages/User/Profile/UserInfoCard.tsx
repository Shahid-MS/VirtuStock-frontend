/* eslint-disable @typescript-eslint/no-explicit-any */
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { UserInterface } from "@/Interface/IPO";
import { userSchema, userSchemaType } from "./UserSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import apiClient from "@/API/ApiClient";
import { AxiosError } from "axios";
import { toast } from "sonner";
import FileInput from "@/components/form/input/FileInput";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Store";
import { login } from "@/Store/authSlice";
import type { EditableField, EditRequest } from "./UserMetaCard";

interface UserMetaCardProps {
  user: UserInterface;
  setUser: Dispatch<SetStateAction<UserInterface | undefined>>;
  /** Set by the profile hero ("+ Phone") to open the editor on a field. */
  editRequest?: EditRequest | null;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_MB = 10;
const FALLBACK_AVATAR = "/images/user/user.png";

/* ---------- small pieces ---------- */

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy. Please copy it manually.");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={`flex h-7 items-center gap-1 rounded-md px-1.5 text-xs transition focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand-500 ${
        copied
          ? "text-success-600 opacity-100 dark:text-success-400"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.06] dark:hover:text-gray-200 lg:opacity-0 lg:group-hover/field:opacity-100"
      }`}
    >
      {copied ? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 12 5 5 9-10" />
          </svg>
          Copied
        </>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
      )}
    </button>
  );
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
  </svg>
);
const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...iconProps}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

const IconTile = ({ children }: { children: React.ReactNode }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
    {children}
  </span>
);

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  /** Form field to jump to when the value is empty (omit for read-only fields) */
  field?: EditableField;
  copyable?: boolean;
  onAdd: (field: EditableField) => void;
}

function InfoField({ icon, label, value, field, copyable, onAdd }: InfoFieldProps) {
  const base =
    "group/field relative flex items-center gap-3 rounded-2xl border p-3.5 transition duration-200 motion-reduce:transition-none";

  // Empty + editable: the whole tile is a shortcut to add it.
  if (!value && field) {
    return (
      <button
        type="button"
        onClick={() => onAdd(field)}
        className={`${base} border-dashed border-gray-300 text-left hover:border-brand-400 hover:bg-brand-25 focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-gray-700 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/5`}
      >
        <IconTile>{icon}</IconTile>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {label}
          </span>
          <span className="block text-sm font-medium text-brand-500 dark:text-brand-400">
            + Add {label.toLowerCase()}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div
      className={`${base} border-gray-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-theme-sm motion-reduce:hover:translate-y-0 dark:border-gray-800 dark:hover:border-brand-500/40`}
    >
      <IconTile>{icon}</IconTile>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="break-words text-sm font-medium text-gray-800 dark:text-white/90">
          {value || "—"}
        </p>
      </div>
      {copyable && value && <CopyButton value={value} label={label.toLowerCase()} />}
    </div>
  );
}

/* ---------- main card ---------- */

export default function UserInfoCard({ user, setUser, editRequest }: UserMetaCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const initialValuesRef = useRef<{
    firstName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    instagramUrl: string | undefined;
    linkedinUrl: string | undefined;
  } | null>(null);
  const [loader, setLoader] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [focusField, setFocusField] = useState<EditableField | null>(null);
  const hasInitialized = useRef(false);
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    watch,
    formState: { errors, isDirty },
  } = useForm<userSchemaType>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user && !hasInitialized.current) {
      const initial = {
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        email: user.email || undefined,
        phone: user.phone || undefined,
        instagramUrl: user.instagramUrl || undefined,
        linkedinUrl: user.linkedinUrl || undefined,
      };
      initialValuesRef.current = initial;
      reset(initial);
      hasInitialized.current = true;
    }
  }, [user, reset]);

  // "+ Add phone" etc. opens the editor with that field focused.
  useEffect(() => {
    if (!isOpen || !focusField) return;
    const timer = setTimeout(() => {
      setFocus(focusField);
      setFocusField(null);
    }, 80);
    return () => clearTimeout(timer);
  }, [isOpen, focusField, setFocus]);

  // The profile hero's "+ Phone" / "+ Photo" chips ask for the editor to open.
  useEffect(() => {
    if (!editRequest) return;
    setFocusField(editRequest.field ?? null);
    openModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRequest]);

  // Live preview of the photo the user just picked.
  const previewUrl = useMemo(
    () => (profilePic ? URL.createObjectURL(profilePic) : null),
    [profilePic]
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const phoneValue = watch("phone") ?? "";
  const canSave = isDirty || profilePic !== null;

  const openEdit = (field?: EditableField) => {
    setFocusField(field ?? null);
    openModal();
  };

  const clearPhoto = () => {
    setProfilePic(null);
    setFileInputKey((key) => key + 1); // remounts the file input to clear it
  };

  // Closing throws away unsaved edits, so the editor always reopens clean.
  const handleClose = () => {
    if (initialValuesRef.current) reset(initialValuesRef.current);
    clearPhoto();
    setServerError(null);
    closeModal();
  };

  const handleSave = async (values: userSchemaType) => {
    setLoader(true);
    const initial = initialValuesRef.current!;
    const changed: Partial<userSchemaType> = {};

    for (const key in values) {
      const typedKey = key as keyof userSchemaType;

      if (values[typedKey] !== initial[typedKey]) {
        changed[typedKey] = values[typedKey];
      }
    }

    try {
      setServerError(null);
      const formData = new FormData();
      formData.append(
        "updates",
        JSON.stringify(Object.keys(changed).length ? changed : {})
      );

      if (profilePic) {
        formData.append("file", profilePic);
      }
      const res = await apiClient.patch("/user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 0,
      });

      const refreshRes = await apiClient.post("/user/refresh-token");
      dispatch(login({ token: refreshRes.data["virtustock-token"] }));
      setUser((prev) => ({ ...prev, ...res.data.user }));

      // The saved values become the new baseline for the next edit.
      const nextInitial = { ...initial, ...changed };
      initialValuesRef.current = nextInitial;
      reset(nextInitial);
      clearPhoto();

      toast.success(res.data.message);
      closeModal();
    } catch (err) {
      const error = err as AxiosError<any>;
      if (error?.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Something went wrong");
      }
    } finally {
      setLoader(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, and JPEG files are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File size must be under ${MAX_FILE_MB}MB`);
      e.target.value = "";
      return;
    }
    setProfilePic(file);
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
        <div className="min-w-0">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Account details
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your personal information on VirtuStock
          </p>
        </div>

        <button
          type="button"
          onClick={() => openEdit()}
          className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.97] motion-reduce:transition-none"
        >
          <svg
            className="fill-current"
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          <span className="max-sm:hidden">Edit profile</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoField icon={<UserIcon />} label="First name" value={user.firstName} field="firstName" onAdd={openEdit} />
        <InfoField icon={<UserIcon />} label="Last name" value={user.lastName} field="lastName" onAdd={openEdit} />
        <InfoField icon={<MailIcon />} label="Email" value={user.email} copyable onAdd={openEdit} />
        <InfoField icon={<PhoneIcon />} label="Phone" value={user.phone} field="phone" copyable onAdd={openEdit} />
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <form onSubmit={handleSubmit(handleSave)} className="flex flex-col">
            <div className="custom-scrollbar max-h-[65vh] overflow-y-auto px-2 pb-3 lg:h-[450px] lg:max-h-none">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  {/* Photo with live preview */}
                  <div className="col-span-2">
                    <Label>Profile Pic</Label>
                    <div className="flex items-center gap-4">
                      <img
                        src={previewUrl ?? user.profilePicUrl ?? FALLBACK_AVATAR}
                        alt="Profile preview"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_AVATAR;
                        }}
                        className={`h-16 w-16 shrink-0 rounded-full border-2 object-cover transition ${
                          previewUrl
                            ? "border-brand-400"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <FileInput
                          key={fileInputKey}
                          onChange={handleFileChange}
                          className="custom-class"
                        />
                        {profilePic ? (
                          <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
                            <span className="truncate text-gray-500 dark:text-gray-400">
                              {profilePic.name}
                            </span>
                            <button
                              type="button"
                              onClick={clearPhoto}
                              className="shrink-0 font-medium text-error-600 hover:underline dark:text-error-400"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                            PNG or JPG, up to {MAX_FILE_MB}MB
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input
                      {...register("firstName")}
                      error={!!errors.firstName}
                      hint={errors.firstName?.message}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input
                      {...register("lastName")}
                      error={!!errors.lastName}
                      hint={errors.lastName?.message}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <Label>Phone</Label>
                      <span className="mb-1.5 text-xs text-gray-400 dark:text-gray-500">
                        {phoneValue.length}/10
                      </span>
                    </div>
                    <Input
                      maxLength={10}
                      {...register("phone", {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        },
                      })}
                      error={!!errors.phone}
                      hint={errors.phone?.message}
                    />
                  </div>
                </div>

                <div>
                  <h5 className="mt-6 mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Social Links
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Linkedin</Label>
                      <Input
                        type="text"
                        {...register("linkedinUrl")}
                        error={!!errors.linkedinUrl}
                        hint={errors.linkedinUrl?.message}
                      />
                    </div>

                    <div>
                      <Label>Instagram</Label>
                      <Input
                        type="text"
                        {...register("instagramUrl")}
                        error={!!errors.instagramUrl}
                        hint={errors.instagramUrl?.message}
                      />
                    </div>
                  </div>
                </div>

                {serverError && (
                  <p
                    role="alert"
                    className="text-error-500 text-sm mb-3 mt-3"
                  >
                    {serverError}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleClose}
                disabled={loader}
              >
                {canSave ? "Discard" : "Close"}
              </Button>
              <Button size="sm" type="submit" disabled={!canSave || loader}>
                {loader ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}