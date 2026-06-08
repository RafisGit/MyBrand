import { requireAdminUser } from "@/lib/auth";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";
import { enforceRateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: Request) {
  try {
    enforceRateLimit({
      key: `admin-customers:get:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 60_000,
    });

    const { supabase } = await requireAdminUser();
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, role, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return jsonSuccess(data ?? []);
  } catch (error) {
    return jsonError(error);
  }
}
