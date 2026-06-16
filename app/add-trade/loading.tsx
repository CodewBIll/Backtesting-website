import { Skeleton } from "@/components/ui/Skeleton";

export default function AddTradeLoading() {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-64 rounded-[2rem]" />
        <Skeleton className="h-64 rounded-[2rem]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-80 rounded-[2rem]" />
          <Skeleton className="h-80 rounded-[2rem]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-[2rem]" />
          <Skeleton className="h-96 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
