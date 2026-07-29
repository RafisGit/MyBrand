import React, { useRef, useState } from "react";
import { Trash2, RotateCw, GripVertical, ShieldAlert, Info } from "lucide-react";
import { UploadableImage } from "@/hooks/use-image-upload";
import { formatFileSize } from "@/lib/utils/image-upload";
import { cn } from "@/lib/utils";

interface ImageUploadCardProps {
  image: UploadableImage;
  index: number;
  totalCount?: number;
  onRemove: (id: string) => void;
  onReplace: (id: string, file: File) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRetry: (id: string) => void;
  onSetAltText: (id: string, altText: string) => void;
}

export function ImageUploadCard({
  image,
  index,
  onRemove,
  onReplace,
  onReorder,
  onRetry,
  onSetAltText,
}: ImageUploadCardProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [showAltInput, setShowAltInput] = useState(false);
  const [altTextLocal, setAltTextLocal] = useState(image.altText);

  // Drag and Drop reordering state
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(fromIndex) && fromIndex !== index) {
      onReorder(fromIndex, index);
    }
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onReplace(image.id, e.target.files[0]);
    }
  };

  const saveAltText = () => {
    onSetAltText(image.id, altTextLocal);
    setShowAltInput(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "group relative flex flex-col rounded-[1.8rem] border bg-white/[0.02] p-4 transition-all duration-300",
        index === 0
          ? "border-[#d8c0a1]/30 shadow-[0_12px_40px_-20px_rgba(216,192,161,0.15)]"
          : "border-white/8 hover:border-white/15"
      )}
    >
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleReplaceChange}
      />

      {/* Image Preview Window */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.3rem] bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.previewUrl}
          alt={image.altText || "Product preview"}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            ["validating", "compressing", "uploading"].includes(image.status) && "opacity-40 blur-sm"
          )}
          loading="lazy"
        />

        {/* Hero badge for primary (display order 0) */}
        {index === 0 && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-[#d8c0a1] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg">
            Hero Image
          </div>
        )}

        {/* Position counter badge */}
        <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white backdrop-blur">
          {index + 1}
        </div>

        {/* Drag handle overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-grab active:cursor-grabbing">
          <div className="flex flex-col items-center gap-2 text-white">
            <GripVertical className="h-6 w-6 text-[#d8c0a1]" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Drag to Reorder</span>
          </div>
        </div>

        {/* Upload state/progress overlays */}
        {["validating", "compressing", "uploading"].includes(image.status) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <RotateCw className="h-8 w-8 animate-spin text-[#d8c0a1]" />
            <span className="mt-3 text-xs font-medium uppercase tracking-wider text-white">
              {image.status === "validating" && "Validating..."}
              {image.status === "compressing" && "Compressing..."}
              {image.status === "uploading" && `Uploading ${image.progress}%`}
            </span>
            {image.status === "uploading" && (
              <div className="mt-3 h-1 w-24 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#d8c0a1] transition-all duration-300"
                  style={{ width: `${image.progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error overlay */}
        {image.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/70 p-4 text-center backdrop-blur-sm">
            <ShieldAlert className="h-8 w-8 text-red-400" />
            <span className="mt-2 text-xs font-bold uppercase tracking-wider text-red-200">Upload Failed</span>
            <p className="mt-1 max-w-[90%] text-[10px] text-red-300 line-clamp-2">{image.error}</p>
            <button
              type="button"
              onClick={() => onRetry(image.id)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black hover:bg-zinc-200"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Info & Metadata */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#8d867a]">
          <span className="truncate max-w-[120px] font-mono">
            {image.file?.name || "image.webp"}
          </span>
          <span>
            {image.width && image.height ? `${image.width}×${image.height} · ` : ""}
            {image.fileSize ? formatFileSize(image.fileSize) : ""}
          </span>
        </div>

        {/* Alt text management */}
        <div className="space-y-1">
          {showAltInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={altTextLocal}
                onChange={(e) => setAltTextLocal(e.target.value)}
                placeholder="Image alt text (SEO)"
                className="h-8 flex-1 rounded-lg border border-white/10 bg-black/40 px-2 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={saveAltText}
                className="h-8 rounded-lg bg-white px-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-zinc-200"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAltInput(true)}
              className="flex items-center gap-1 text-[11px] text-[#d8c0a1] hover:text-[#e5d4be] hover:underline"
            >
              <Info className="h-3 w-3" />
              {image.altText ? `Alt: "${image.altText}"` : "Add alt text (SEO)"}
            </button>
          )}
        </div>

        {/* Card actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => replaceInputRef.current?.click()}
            disabled={["validating", "compressing", "uploading"].includes(image.status)}
            className="flex-1 rounded-full bg-white/[0.04] py-2 text-[11px] font-bold uppercase tracking-widest text-[#f5efe7] ring-1 ring-white/8 transition hover:bg-white hover:text-black disabled:opacity-50"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onRemove(image.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-950/20 text-red-400 ring-1 ring-red-500/10 transition hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
