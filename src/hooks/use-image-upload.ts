import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  validateImageFile,
  compressAndConvertToWebp,
  generateUniqueFilename,
} from "@/lib/utils/image-upload";

export type UploadStatus =
  | "idle"
  | "validating"
  | "compressing"
  | "uploading"
  | "complete"
  | "error";

export interface UploadableImage {
  id: string;
  file?: File;
  previewUrl: string;
  publicUrl?: string;
  storagePath?: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  altText: string;
}

export function useImageUpload(initialImages: Array<{ imageUrl: string; altText?: string; displayOrder?: number }> = []) {
  const [images, setImages] = useState<UploadableImage[]>(() =>
    initialImages.map((img, index) => ({
      id: `existing-${index}-${Date.now()}`,
      previewUrl: img.imageUrl,
      publicUrl: img.imageUrl,
      // Attempt to extract path from standard Supabase storage URL
      storagePath: img.imageUrl.includes("/storage/v1/object/public/products/")
        ? img.imageUrl.split("/storage/v1/object/public/products/")[1]?.split("?")[0]
        : undefined,
      status: "complete",
      progress: 100,
      altText: img.altText || "",
    }))
  );

  const abortControllers = useRef<Record<string, AbortController>>({});

  const uploadFile = useCallback(async (image: UploadableImage) => {
    if (!image.file) return;

    // 1. Validation
    setImages((prev) =>
      prev.map((img) =>
        img.id === image.id ? { ...img, status: "validating" } : img
      )
    );
    const validation = await validateImageFile(image.file);
    if (!validation.valid) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, status: "error", error: validation.error }
            : img
        )
      );
      toast.error(validation.error || "Validation failed");
      return;
    }

    // Update dimensions & file size
    setImages((prev) =>
      prev.map((img) =>
        img.id === image.id
          ? {
              ...img,
              width: validation.width,
              height: validation.height,
              fileSize: image.file?.size,
            }
          : img
      )
    );

    // 2. Compression & WebP conversion
    setImages((prev) =>
      prev.map((img) =>
        img.id === image.id ? { ...img, status: "compressing" } : img
      )
    );
    const compressedFile = await compressAndConvertToWebp(image.file);
    const uniqueName = generateUniqueFilename(compressedFile.name);

    // Update file ref and size after compression
    setImages((prev) =>
      prev.map((img) =>
        img.id === image.id
          ? { ...img, file: compressedFile, fileSize: compressedFile.size }
          : img
      )
    );

    // 3. Upload
    setImages((prev) =>
      prev.map((img) =>
        img.id === image.id ? { ...img, status: "uploading", progress: 0 } : img
      )
    );

    const controller = new AbortController();
    abortControllers.current[image.id] = controller;

    try {
      const formData = new FormData();
      formData.append("bucket", "products");
      formData.append("folder", "catalog");
      formData.append("file", compressedFile);
      formData.append("fileName", uniqueName);

      const xhr = new XMLHttpRequest() as XMLHttpRequest & { signal?: AbortSignal };
      xhr.open("POST", "/api/admin/uploads", true);
      xhr.signal = controller.signal;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, progress: percentComplete } : img
            )
          );
        }
      };

      const uploadPromise = new Promise<{ publicUrl: string; path: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.data?.publicUrl) {
                resolve({
                  publicUrl: res.data.publicUrl,
                  path: res.data.path || "",
                });
              } else {
                reject(new Error(res.error || "Invalid response format."));
              }
            } catch (err) {
              reject(new Error("Failed to parse server response."));
            }
          } else {
            try {
              const res = JSON.parse(xhr.responseText);
              reject(new Error(res.error || "Upload HTTP error."));
            } catch {
              reject(new Error(`Server returned status code ${xhr.status}.`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network connection error."));
        xhr.onabort = () => reject(new Error("Upload cancelled."));
      });

      xhr.send(formData);

      const result = await uploadPromise;

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                status: "complete",
                progress: 100,
                publicUrl: result.publicUrl,
                storagePath: result.path,
              }
            : img
        )
      );
      toast.success("Image uploaded successfully.");
    } catch (err: any) {
      if (err.message === "Upload cancelled.") {
        return; // Handled quietly
      }
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: "error", error: err.message } : img
        )
      );
      toast.error(err.message || "Failed to upload image.");
    } finally {
      delete abortControllers.current[image.id];
    }
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const remainingSlots = 10 - images.length;
      if (remainingSlots <= 0) {
        toast.error("Maximum limit of 10 images reached.");
        return;
      }

      const filesArray = Array.from(files).slice(0, remainingSlots);
      const newImages = filesArray.map((file) => {
        const id = `upload-${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);
        
        return {
          id,
          file,
          previewUrl,
          status: "idle" as const,
          progress: 0,
          altText: "",
        };
      });

      setImages((prev) => [...prev, ...newImages]);
      newImages.forEach((img) => void uploadFile(img));
    },
    [images, uploadFile]
  );

  const removeImage = useCallback((id: string) => {
    // Cancel active request
    if (abortControllers.current[id]) {
      abortControllers.current[id].abort();
      delete abortControllers.current[id];
    }

    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const replaceImage = useCallback(
    (id: string, file: File) => {
      if (abortControllers.current[id]) {
        abortControllers.current[id].abort();
        delete abortControllers.current[id];
      }

      const previewUrl = URL.createObjectURL(file);
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                file,
                previewUrl,
                status: "idle",
                progress: 0,
                publicUrl: undefined,
                storagePath: undefined,
                error: undefined,
              }
            : img
        )
      );

      const target = {
        id,
        file,
        previewUrl,
        status: "idle" as const,
        progress: 0,
        altText: "",
      };
      void uploadFile(target);
    },
    [uploadFile]
  );

  const retryUpload = useCallback(
    (id: string) => {
      const target = images.find((img) => img.id === id);
      if (target && target.file) {
        void uploadFile(target);
      }
    },
    [images, uploadFile]
  );

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const setAltText = useCallback((id: string, altText: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, altText } : img))
    );
  }, []);

  const isUploading = images.some((img) =>
    ["validating", "compressing", "uploading"].includes(img.status)
  );

  const hasErrors = images.some((img) => img.status === "error");

  return {
    images,
    addFiles,
    removeImage,
    replaceImage,
    reorderImages,
    retryUpload,
    setAltText,
    isUploading,
    hasErrors,
  };
}
