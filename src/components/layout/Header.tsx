"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";
import { QuotaIndicator } from "./QuotaIndicator";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { UI_TEXT } from "@/lib/i18n";

interface HeaderProps {
  onMobileMenuOpen?: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
    onMobileMenuOpen?.();
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-ytpm-border bg-ytpm-bg/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-40">
        {/* Left side - Hamburger button (mobile only) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMobileMenuOpen}
          className="md:hidden text-ytpm-muted hover:text-ytpm-text"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>

        {/* Spacer for desktop */}
        <div className="hidden md:flex" />

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Quota Indicator */}
          <QuotaIndicator />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full border border-ytpm-border hover:border-ytpm-border-hover hover:bg-ytpm-surface transition-all duration-200"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Avatar"}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-ytpm-muted" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-ytpm-card border-ytpm-border">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-ytpm-text">{session?.user?.name}</p>
                  <p className="text-xs text-ytpm-muted">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-ytpm-border" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/ytpm/login" })}
                className="text-ytpm-error focus:text-ytpm-error focus:bg-ytpm-error/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {UI_TEXT.nav.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </>
  );
}
