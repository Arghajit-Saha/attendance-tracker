import { Card, CardBody } from "@heroui/react";
import {cn} from "@/lib/utils.ts";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export default function ProgressSkeleton() {
  return (
    <Card className="w-full sm:w-[400px] rounded-2xl border-none bg-gray-200 p-2">
      <CardBody className="flex flex-row items-center justify-center gap-2">
        {/* Circular Skeleton */}
        <div className="relative">
          <Skeleton className="rounded-full w-[60px] h-[60px] sm:w-[100px] sm:h-[100px]" />
        </div>

        {/* Text placeholders */}
        <div className="flex flex-col justify-center">
          <Skeleton className="h-6 w-[80px] sm:w-[120px] rounded-md mb-1" />
          <Skeleton className="h-4 w-[250px] rounded-md" />
        </div>
      </CardBody>
    </Card>
  );
}
