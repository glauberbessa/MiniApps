import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YouTubeService } from "@/lib/youtube";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.accessToken) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const youtubeService = new YouTubeService(
      session.accessToken,
      session.user.id
    );

    const channels = await youtubeService.getSubscribedChannels();

    // Buscar configurações dos canais
    const { data: configs, error: configError } = await supabase
      .from("ChannelConfig")
      .select("*")
      .eq("userId", session.user.id);

    if (configError) throw configError;

    // Mesclar canais com configurações
    const channelsWithConfig = channels.map((channel) => {
      const config = (configs || []).find((c) => c.channelId === channel.id);
      return {
        ...channel,
        config: config
          ? {
              id: config.id,
              channelId: config.channelId,
              title: config.title,
              isEnabled: config.isEnabled,
              subscriptionDate: config.subscriptionDate ? new Date(config.subscriptionDate).toISOString() : undefined,
              totalDurationSeconds: config.totalDurationSeconds,
            }
          : undefined,
      };
    });

    return NextResponse.json(channelsWithConfig);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar canais", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
