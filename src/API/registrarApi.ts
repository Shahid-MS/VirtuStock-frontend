import apiClient from "./ApiClient";

/**
 * Replaces a registrar's logo: PATCH /admin/registrar?id=<registrar id>
 * with a multipart body whose `file` part is the image (the same shape as the
 * profile photo upload). Only the image is sent, so nothing else changes.
 */
export const updateRegistrarLogo = async (
  id: number | string,
  file: File
): Promise<{ message?: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.patch("/admin/registrar", formData, {
    params: { id },
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0,
  });

  return res.data;
};
