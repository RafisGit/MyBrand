import { uploadAdminAsset } from "@/services/storage.service";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `admin-uploads:post:${getRequestIp(request)}`,
      limit: 20,
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

    const upload = await uploadAdminAsset({
      bucket,
      file,
      folder: typeof folder === "string" ? folder : undefined,
    });

    return jsonSuccess(upload, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
