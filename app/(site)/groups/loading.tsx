import { GroupsSkeleton } from "@/components/worldcup/WorldCupSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="h-10 w-64 bg-white/10 rounded-lg animate-pulse mb-8" />
      <GroupsSkeleton />
    </div>
  );
}
