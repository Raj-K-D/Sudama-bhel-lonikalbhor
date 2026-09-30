export default function AnalyticsLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-5 animate-pulse">
      {/* Range skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-14 rounded-xl bg-white/10" />
        <div className="h-7 w-16 rounded-xl bg-white/10" />
        <div className="h-7 w-16 rounded-xl bg-white/10" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-white/10 bg-white/5 p-4" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-64 rounded-2xl border border-white/10 bg-white/5 p-4" />

      {/* Grid skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-56 rounded-2xl border border-white/10 bg-white/5 p-4" />
        <div className="h-56 rounded-2xl border border-white/10 bg-white/5 p-4" />
      </div>
    </div>
  );
}
