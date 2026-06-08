import { publicEnv } from "@/lib/env";

export function getCurrencyLabel() {
  return publicEnv.currency;
}
