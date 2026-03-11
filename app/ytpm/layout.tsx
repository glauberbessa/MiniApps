import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "YT Playlist Manager Pro",
  description: "Gerenciador profissional de playlists do YouTube",
};

export default function YtpmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>{children}</Providers>
  );
}
