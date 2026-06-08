export default function Loading() {
  return (
    <div className="page-shell">
      <div className="animate-pulse space-y-8">
        <div className="h-[65svh] rounded-[2.5rem] bg-black/8" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="aspect-[4/5] rounded-[2rem] bg-black/8" />
              <div className="h-6 rounded-full bg-black/8" />
              <div className="h-4 w-2/3 rounded-full bg-black/8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
