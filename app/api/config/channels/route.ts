import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { throwIfError, PGSQL_ERROR_CODES } from "@/lib/supabase-utils";
import { validateConfigs, ChannelConfigInputSchema } from "@/lib/supabase-validation";
import { withRetry } from "@/lib/supabase-retry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: configs, error } = await supabase
      .from("ChannelConfig")
      .select("*")
      .eq("userId", session.user.id)
      .order("title", { ascending: true });

    throwIfError(error);

    return NextResponse.json(configs || []);
  } catch (error) {
    console.error("Erro ao buscar configurações de canais:", error);
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

    // Validate input
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Formato inválido" },
        { status: 400 }
      );
    }

    try {
      validateConfigs(ChannelConfigInputSchema, body);
    } catch (validationError) {
      return NextResponse.json(
        { error: "Dados inválidos: " + String(validationError) },
        { status: 400 }
      );
    }

    // Upsert configurations (no N+1 queries!)
    // Use upsert to eliminate select → insert/update pattern
    const results = await withRetry(
      async () => {
        const { data, error } = await supabase
          .from("ChannelConfig")
          .upsert(
            body.map(config => ({
              userId: session.user.id,
              channelId: config.channelId,
              title: config.title,
              isEnabled: config.isEnabled,
            })),
            {
              onConflict: "userId,channelId", // Composite unique constraint
            }
          )
          .select();

        throwIfError(error);
        return data;
      },
      { maxRetries: 3 }
    );

    return NextResponse.json(results || []);
  } catch (error) {
    console.error("Erro ao salvar configurações de canais:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}
