import { uploadAdminAsset } from "@/services/storage.service";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `admin-uploads:post:${getRequestIp(request)}`,
      limit: 30, // Relaxed slightly to allow uploading up to 10 images quickly
      windowMs: 60_000,
    });

    const formData = await request.formData();
    const bucket = formData.get("bucket");
    const folder = formData.get("folder");
    const file = formData.get("file");

    if (
      (bucket !== "products" && bucket !== "banners") ||
      typeof file !== "object" ||
      !(file instanceof File)
    ) {
      throw new Error("A valid bucket and file are required.");
    }

    // Verify MIME type signature (Magic numbers) to avoid fake extensions / malicious content
    const buffer = await file.slice(0, 4).arrayBuffer();
    const arr = new Uint8Array(buffer);
    let signature = "";
    for (let i = 0; i < arr.length; i++) {
      signature += arr[i].toString(16).padStart(2, "0");
    }

    // Check signatures for webp, png, jpeg
    const isPng = signature.startsWith("89504e47");
    const isJpeg = signature.startsWith("ffd8ff");
    const isWebp = signature.startsWith("52494646") || signature.includes("57454250"); // RIFF ... WEBP

    if (!isPng && !isJpeg && !isWebp) {
      throw new Error("Invalid image format. Allowed formats: PNG, JPG, WEBP.");
    }

    const upload = await uploadAdminAsset({
      bucket,
      file,
      folder: typeof folder === "string" ? folder : undefined,
    });

    return jsonSuccess({
      publicUrl: upload.publicUrl,
      path: upload.path,
    }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
