"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListVideo,
  Radio,
  Settings,
  MoreVertical,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UI_TEXT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MobileBottomNavProps {
  onMoreClick?: () => void;
}

const bottomNavItems = [
  {
    name: "Home",
    href: "/ytpm",
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
    name: UI_TEXT.nav.configPlaylists,
    href: "/ytpm/config/playlists",
    icon: Settings,
  },
];

export function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="fixed bottom-0 left-0 right-0 md:hidden h-16 border-t border-ytpm-border bg-ytpm-bg/95 backdrop-blur-sm z-30">
        <div className="flex h-full items-center justify-around">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center w-16 h-16 rounded-none transition-all duration-200",
                      isActive
                        ? "text-ytpm-accent"
                        : "text-ytpm-muted hover:text-ytpm-text"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-6 w-6" />
                    {isActive && (
                      <div className="absolute bottom-0 h-1 w-8 bg-ytpm-accent rounded-t-full" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-ytpm-card border-ytpm-border text-ytpm-text mb-2">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* More button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoreClick}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-none text-ytpm-muted hover:text-ytpm-text transition-colors"
              >
                <MoreVertical className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-ytpm-card border-ytpm-border text-ytpm-text mb-2">
              <p>Mais</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
}
