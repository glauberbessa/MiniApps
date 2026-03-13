import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: configs, error } = await supabase
      .from("PlaylistConfig")
      .select("*")
      .eq("userId", session.user.id)
      .order("title", { ascending: true });

    if (error) throw error;

    return NextResponse.json(configs || []);
  } catch (error) {
    console.error("Erro ao buscar configurações de playlists:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Formato inválido" },
        { status: 400 }
      );
    }

    // Atualizar ou criar configurações
    const results = await Promise.all(
      body.map(async (config: { playlistId: string; title: string; isEnabled: boolean }) => {
        // Primeiro, tenta buscar o registro existente
        const { data: existing, error: findError } = await supabase
          .from("PlaylistConfig")
          .select("id")
          .eq("userId", session.user.id)
          .eq("playlistId", config.playlistId)
          .single();

        if (findError && findError.code !== "PGRST116") throw findError;

        if (existing) {
          // Atualizar
          const { data, error } = await supabase
            .from("PlaylistConfig")
            .update({
              title: config.title,
              isEnabled: config.isEnabled,
            })
            .eq("id", existing.id)
            .select()
            .single();

          if (error) throw error;
          return data;
        } else {
          // Criar novo
          const { data, error } = await supabase
            .from("PlaylistConfig")
            .insert({
              userId: session.user.id,
              playlistId: config.playlistId,
              title: config.title,
              isEnabled: config.isEnabled,
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro ao salvar configurações de playlists:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}
