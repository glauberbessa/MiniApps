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
    <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 md:px-6">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-neutral-900 rounded-none">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-neutral-950 border-r border-neutral-800">
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
              className="relative h-10 w-10 rounded-none hover:bg-neutral-900"
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  fill
                  className="rounded-none object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-neutral-950 border border-neutral-800 text-white rounded-none">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-neutral-400">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-500 focus:text-red-400 focus:bg-neutral-900 rounded-none cursor-pointer"
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
