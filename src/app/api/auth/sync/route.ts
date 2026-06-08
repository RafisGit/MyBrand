import { synchronizeAuthSession } from "@/lib/auth/session-sync";

export async function POST(request: Request) {
  return synchronizeAuthSession(request);
}
