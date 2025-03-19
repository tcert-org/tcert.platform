import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <div className="flex flex-col">
        <div className="h-14 bg-gray-200 animate-pulse"></div>
        <div className="flex flex-1">
          <div className="w-64 bg-gray-200 animate-pulse"></div>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="h-8 bg-gray-200 animate-pulse"></div>
            <div className="flex-1 bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
