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
import { LogOut, Menu, User } from "lucide-react";
import { QuotaIndicator } from "./QuotaIndicator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { UI_TEXT } from "@/lib/i18n";

export function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-ytpm-border bg-ytpm-bg/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-40">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-ytpm-text hover:bg-ytpm-surface">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-ytpm-bg border-ytpm-border">
          <Sidebar showToggle={false} onNavigate={() => setIsMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Spacer for desktop */}
      <div className="hidden md:block" />

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
  );
}
