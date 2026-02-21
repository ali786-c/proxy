import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarNav />
        <SidebarInset>
          <Topbar />
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
