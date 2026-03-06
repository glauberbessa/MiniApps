"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import {
  ListVideo,
  Radio,
  Settings,
  Settings2,
  Gauge,
  Youtube,
  Home,
  Database,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UI_TEXT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  {
    name: "Menu Principal",
    href: "/",
    icon: Home,
  },
  {
    name: UI_TEXT.nav.playlists,
    href: "/ytpm/playlists",
    icon: ListVideo,
  },
  {
    name: UI_TEXT.nav.channels,
    href: "/ytpm/channels",
    icon: Radio,
  },
  {
    name: UI_TEXT.nav.quota,
    href: "/ytpm/quota",
    icon: Gauge,
  },
];

const configSection = [
  {
    name: UI_TEXT.nav.configPlaylists,
    href: "/ytpm/config/playlists",
    icon: Settings,
  },
  {
    name: UI_TEXT.nav.configChannels,
    href: "/ytpm/config/channels",
    icon: Settings2,
  },
  {
    name: UI_TEXT.nav.exportEnglish,
    href: "/ytpm/export-english",
    icon: Database,
  },
];

export function MobileMenuDrawer({ open, onOpenChange }: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleNavigate = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="bg-ytpm-bg border-ytpm-border w-full sm:w-80 p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="border-b border-ytpm-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ytpm-accent to-red-700 shadow-md shadow-ytpm-accent/20 shrink-0">
              <Youtube className="h-5 w-5 text-white" />
            </div>
            <SheetTitle className="text-heading-sm text-ytpm-text">
              YTPM PRO
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* User Info */}
        {session?.user && (
          <div className="border-b border-ytpm-border px-4 py-3">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ytpm-surface">
                  <User className="h-5 w-5 text-ytpm-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ytpm-text truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-ytpm-muted truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-ytpm-accent text-white shadow-md shadow-ytpm-accent/20"
                    : "text-ytpm-muted hover:bg-ytpm-surface hover:text-ytpm-text"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Config Section */}
          <div className="pt-2">
            <Collapsible defaultOpen={configSection.some(
              (item) => pathname === item.href
            )}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-4 py-3 text-sm font-medium text-ytpm-muted hover:text-ytpm-text hover:bg-ytpm-surface"
                >
                  <span>Configurações</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 py-1">
                {configSection.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-6 py-2.5 text-sm transition-all duration-200 ml-2",
                        isActive
                          ? "bg-ytpm-accent text-white shadow-md shadow-ytpm-accent/20"
                          : "text-ytpm-muted hover:bg-ytpm-surface hover:text-ytpm-text"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </nav>

        {/* Footer - Logout */}
        <div className="border-t border-ytpm-border px-2 py-3">
          <Button
            onClick={() => signOut({ callbackUrl: "/ytpm/login" })}
            variant="ghost"
            className="w-full justify-start px-4 py-3 text-sm font-medium text-ytpm-error hover:text-ytpm-error hover:bg-ytpm-error/10"
          >
            <LogOut className="mr-3 h-5 w-5" />
            {UI_TEXT.nav.logout}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
