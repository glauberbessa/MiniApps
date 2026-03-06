"use client";

import { ReactNode, useState } from "react";
import { SidebarProvider } from "./SidebarContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMoreClick = () => {
    setMobileMenuOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen ytpm-bg-gradient ytpm-grain ytpm-selection">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 ytpm-scrollbar-refined">
            <div className="ytpm-stagger-children">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onMoreClick={handleMoreClick} />
      </div>
    </SidebarProvider>
  );
}
