export default function Loading() {
  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-8 pt-2 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-4">
        <div className="h-28 rounded-[28px] bg-slate-200" />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="h-[540px] rounded-[28px] bg-slate-200" />
          <div className="h-[540px] rounded-[28px] bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
