import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { UploadableImage } from "@/hooks/use-image-upload";
import { ImageUploadCard } from "./image-upload-card";

interface ImageUploadZoneProps {
  images: UploadableImage[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveImage: (id: string) => void;
  onReplaceImage: (id: string, file: File) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  onRetryUpload: (id: string) => void;
  onSetAltText: (id: string, altText: string) => void;
}

export function ImageUploadZone({
  images,
  onAddFiles,
  onRemoveImage,
  onReplaceImage,
  onReorderImages,
  onRetryUpload,
  onSetAltText,
}: ImageUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={images.length === 0 ? triggerFileInput : undefined}
        className={`relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-8 transition-all ${
          images.length === 0 ? "cursor-pointer min-h-[220px]" : "min-h-[120px] p-6"
        } ${
          isDragActive
            ? "border-[#d8c0a1] bg-[#d8c0a1]/5 shadow-[0_0_30px_rgba(216,192,161,0.15)]"
            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {images.length === 0 ? (
          <div className="text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/10">
              <Upload className="h-5 w-5 text-[#d8c0a1]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">
                Drag & drop product images, or{" "}
                <span className="text-[#d8c0a1] underline decoration-[#d8c0a1]/40 underline-offset-4 hover:text-[#e5d4be]">
                  browse files
                </span>
              </p>
              <p className="text-xs text-[#8d867a] uppercase tracking-wider">
                JPG, PNG, WebP up to 10MB (Will be compressed to WebP)
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-white">
              Drag images here or{" "}
              <button
                type="button"
                onClick={triggerFileInput}
                className="text-[#d8c0a1] underline decoration-[#d8c0a1]/40 underline-offset-4 hover:text-[#e5d4be]"
              >
                browse more files
              </button>
            </p>
            <p className="text-xs text-[#8e8678] uppercase tracking-[0.15em]">
              {images.length} / 10 images (minimum 3 required)
            </p>
          </div>
        )}
      </div>

      {/* Grid of uploaded images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <ImageUploadCard
              key={image.id}
              image={image}
              index={index}
              totalCount={images.length}
              onRemove={onRemoveImage}
              onReplace={onReplaceImage}
              onReorder={onReorderImages}
              onRetry={onRetryUpload}
              onSetAltText={onSetAltText}
            />
          ))}
        </div>
      )}
    </div>
  );
}
