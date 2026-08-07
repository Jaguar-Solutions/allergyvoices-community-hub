/**
 * Loading placeholders shaped like the cards that replace them.
 *
 * A centred spinner tells you nothing except "wait". Skeletons in the real
 * layout mean the page doesn't jump when data lands, and someone on a slow
 * connection can already see how many results are coming and where to look.
 */
export function DirectorySkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul
      className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <div className="h-full rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              <div className="flex gap-1.5">
                <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-12 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/70 pt-4">
              {Array.from({ length: 4 }, (_, cell) => (
                <div key={cell} className="space-y-1.5">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
