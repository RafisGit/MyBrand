import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="rounded-[2.5rem] border border-black/10 bg-white px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          404
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-black">
          The page moved out of frame.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-600">
          Try returning to the collection or home page to continue browsing the luxury storefront.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">Back Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">View Collection</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
