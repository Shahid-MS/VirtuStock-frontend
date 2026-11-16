import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import { RegistrarLogo } from "@/pages/IPO/RegistrarSection";
import { Registrar } from "@/Interface/IPO";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_MB = 10;

interface EditRegistrarLogoModalProps {
  /** The registrar being edited; the dialog is closed when null. */
  registrar: Registrar | null;
  onClose: () => void;
  /** Uploads the chosen image. Reject to keep the dialog open. */
  onSubmit: (registrar: Registrar, file: File) => Promise<void>;
}

/** Dialog to replace one registrar's logo image. Nothing else is editable. */
export default function EditRegistrarLogoModal({
  registrar,
  onClose,
  onSubmit,
}: EditRegistrarLogoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  // Start clean whenever a different registrar is opened.
  useEffect(() => {
    setFile(null);
    setSaving(false);
    setInputKey((key) => key + 1);
  }, [registrar?.id]);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearFile = () => {
    setFile(null);
    setInputKey((key) => key + 1); // remounts the input to clear it
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0];
    if (!chosen) return;

    if (!ALLOWED_TYPES.includes(chosen.type)) {
      toast.error("Only PNG, JPG, and JPEG files are allowed");
      event.target.value = "";
      return;
    }

    if (chosen.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File size must be under ${MAX_FILE_MB}MB`);
      event.target.value = "";
      return;
    }

    setFile(chosen);
  };

  const handleClose = () => {
    if (!saving) onClose();
  };

  const handleSave = async () => {
    if (!registrar || !file) return;

    setSaving(true);
    try {
      await onSubmit(registrar, file);
    } catch {
      // The shared API client already showed the error toast; keep the dialog
      // open so the image can be changed and retried.
    } finally {
      setSaving(false);
    }
  };

  const name = registrar?.name ?? "Registrar";

  return (
    <Modal
      isOpen={registrar !== null}
      onClose={handleClose}
      className="m-4 max-w-[460px]"
    >
      <div className="relative w-full rounded-3xl bg-white p-5 dark:bg-gray-900 sm:p-7">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Update logo
        </h5>
        <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
          {name}
        </p>

        <div className="mt-5 flex items-start gap-5">
          <div className="text-center">
            <RegistrarLogo
              name={name}
              logo={registrar?.logo}
              className="h-[72px] w-[72px] rounded-xl text-lg"
            />
            <p className="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
              Current
            </p>
          </div>

          <div className="text-center">
            <div
              className={`flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl border bg-gray-50 text-theme-xs text-gray-400 dark:bg-white/[0.04] ${
                previewUrl
                  ? "border-brand-400"
                  : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="New logo preview"
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                "New"
              )}
            </div>
            <p className="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
              Preview
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Label>Logo image</Label>
          <FileInput
            key={inputKey}
            onChange={handleFileChange}
            className="custom-class"
          />
          {file ? (
            <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-gray-500 dark:text-gray-400">
                {file.name}
              </span>
              <button
                type="button"
                onClick={clearFile}
                disabled={saving}
                className="shrink-0 font-medium text-error-600 hover:underline dark:text-error-400"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              PNG or JPG, up to {MAX_FILE_MB}MB. Only the logo is updated.
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!file || saving}>
            {saving ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                Saving...
              </>
            ) : (
              "Save logo"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
