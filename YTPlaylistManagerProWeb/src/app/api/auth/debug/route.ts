import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({
        status: "no_session",
        message: "Nenhuma sessão encontrada. Verifique se você está logado.",
        debug: {
          hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
          hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        },
      });
    }

    const email = (session.user?.email as string) || (session as any).email;
    let dbInfo = null;

    if (email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          include: { accounts: { where: { provider: "google" } } },
        });
        if (user) {
          dbInfo = {
            userUpdated: user.updatedAt,
            hasRefreshToken: !!user.accounts[0]?.refresh_token,
          };
        }
      } catch (err) {
        // DB error
      }
    }

    if (!session.user?.id) {
      return NextResponse.json({
        status: "no_user_id",
        message: "Sessão existe mas user.id está ausente.",
        debug: {
          hasSession: true,
          hasUser: !!session.user,
          userName: session.user?.name,
          userEmail: session.user?.email,
        },
      });
    }

    if (!session.accessToken) {
      return NextResponse.json({
        status: "no_access_token",
        message: "Sessão existe mas accessToken está ausente. Pode ser necessário fazer login novamente.",
        debug: {
          hasSession: true,
          hasUserId: true,
          userId: session.user.id,
          hasYoutubeChannelId: !!session.user.youtubeChannelId,
        },
      });
    }

    if (session.accessToken) {
      try {
        const tokenInfoResponse = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${session.accessToken}`
        );
        const tokenInfo = await tokenInfoResponse.json();

        return NextResponse.json({
          status: "ok",
          message: "Sessão válida.",
          debug: {
            hasSession: true,
            hasUserId: true,
            hasAccessToken: true,
            accessTokenLength: session.accessToken.length,
            tokenInfo: {
              scopes: tokenInfo.scope,
              email: tokenInfo.email,
              azp: tokenInfo.azp,
              sub: tokenInfo.sub,
              expires_in: tokenInfo.expires_in,
              error: tokenInfo.error,
              error_description: tokenInfo.error_description,
            },
            envClientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
            hasYoutubeScope: tokenInfo.scope?.includes("youtube") || false,
            hasYoutubeChannelId: !!session.user.youtubeChannelId,
            userId: session.user.id.substring(0, 8) + "...",
          },
        });
      } catch (err) {
        // Fallback if tokeninfo fails
      }
    }

    return NextResponse.json({
      status: "ok",
      message: "Sessão válida com access token.",
      debug: {
        hasSession: true,
        hasUserId: true,
        hasAccessToken: true,
        hasYoutubeChannelId: !!session.user.youtubeChannelId,
        userId: session.user.id.substring(0, 8) + "...",
        accessTokenLength: session.accessToken.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao verificar sessão",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
