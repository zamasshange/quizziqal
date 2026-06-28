import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata();

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <DashboardSidebar />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
