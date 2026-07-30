"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Folder,
  Search,
  Trash2,
  Copy,
  UploadCloud,
  Check,
  HardDrive,
  FileImage,
} from "lucide-react";
import type { MediaAsset } from "@/types/cms";
import { deleteMediaAssetAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MediaLibraryManager({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const folders = ["all", "products", "banners", "hero", "branding", "catalog"];

  const filteredAssets = assets.filter((asset) => {
    const matchesFolder = activeFolder === "all" || asset.folder === activeFolder || asset.bucket === activeFolder;
    const matchesSearch = !search || asset.filename.toLowerCase().includes(search.toLowerCase()) || asset.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Asset URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (asset: MediaAsset) => {
    if (!confirm(`Are you sure you want to delete ${asset.filename}?`)) return;

    startTransition(async () => {
      try {
        await deleteMediaAssetAction(asset.id, asset.path, asset.bucket);
        setAssets((prev) => prev.filter((a) => a.id !== asset.id));
        if (selectedAsset?.id === asset.id) setSelectedAsset(null);
        toast.success("Media asset deleted.");
      } catch {
        toast.error("Failed to delete media asset.");
      }
    });
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-[#111111] p-6 text-[#f5efe7]">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-amber-400" />
            Enterprise Media Library
          </h2>
          <p className="text-xs text-[#a79f92] mt-1">
            Shopify-style asset manager. Upload, tag, inspect, copy URLs, and manage storage assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-amber-500 text-black hover:bg-amber-400 font-semibold">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload New Media
          </Button>
        </div>
      </div>

      {/* Folders & Search bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                activeFolder === folder
                  ? "bg-amber-500 text-black font-semibold"
                  : "bg-white/[0.05] text-[#a79f92] hover:bg-white/10 hover:text-white"
              }`}
            >
              <Folder className="h-3.5 w-3.5" />
              {folder.charAt(0).toUpperCase() + folder.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#a79f92]" />
          <Input
            placeholder="Search media by filename or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-white/10 bg-white/[0.04] text-xs text-white"
          />
        </div>
      </div>

      {/* Grid and Inspector */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Media Grid */}
        <div className="min-h-[400px] rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-[#a79f92]">
              <FileImage className="h-12 w-12 stroke-[1.2] text-white/20 mb-3" />
              <p className="text-sm font-medium text-white">No media assets found</p>
              <p className="text-xs mt-1">Upload images to your Supabase Storage buckets to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition ${
                    selectedAsset?.id === asset.id
                      ? "border-amber-400 ring-2 ring-amber-400/20"
                      : "border-white/10 bg-black/40 hover:border-white/30"
                  }`}
                >
                  <Image
                    src={asset.publicUrl}
                    alt={asset.filename}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
                    <p className="text-[10px] font-semibold text-white truncate">{asset.filename}</p>
                    <p className="text-[9px] text-[#a79f92]">{asset.folder}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Asset Detail Inspector */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Asset Inspector
          </h3>

          {selectedAsset ? (
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image
                  src={selectedAsset.publicUrl}
                  alt={selectedAsset.filename}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#a79f92]">Filename:</span>
                  <p className="font-semibold text-white break-all">{selectedAsset.filename}</p>
                </div>
                <div>
                  <span className="text-[#a79f92]">Folder / Bucket:</span>
                  <p className="text-white">{selectedAsset.folder} / {selectedAsset.bucket}</p>
                </div>
                {selectedAsset.fileSize && (
                  <div>
                    <span className="text-[#a79f92]">File Size:</span>
                    <p className="text-white">{(selectedAsset.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUrl(selectedAsset.publicUrl, selectedAsset.id)}
                  className="w-full border-white/10 text-white hover:bg-white/10 text-xs"
                >
                  {copiedId === selectedAsset.id ? (
                    <>
                      <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Copy Image URL
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(selectedAsset)}
                  disabled={isPending}
                  className="w-full text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Asset
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#a79f92]">
              Select an image from the grid to inspect details and copy URL.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
