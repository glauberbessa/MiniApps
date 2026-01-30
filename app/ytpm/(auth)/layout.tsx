import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session) {
    redirect("/ytpm/playlists");
  }

  return (
    <div className="ytpm-bg-industrial flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 ytpm-grid-pattern opacity-[0.02]" aria-hidden="true" />

      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-ytpm-accent/5 blur-[120px] rounded-full" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-ytpm-accent/3 blur-[100px] rounded-full" aria-hidden="true" />

      {children}
    </div>
  );
}
