import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-utils";
import { validateConfigs, ChannelConfigInputSchema } from "@/lib/supabase-validation";
import { withRetry } from "@/lib/supabase-retry";
import { logger } from "@/lib/logger";

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
    logger.error("API", "GET /api/config/channels - Failed", error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode: (error as { code?: string })?.code,
    });
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
        { error: "Formato inválido: esperado um array" },
        { status: 400 }
      );
    }

    try {
      validateConfigs(ChannelConfigInputSchema, body);
    } catch (validationError) {
      logger.warn("API", "PUT /api/config/channels - Validation failed", {
        userId: session.user.id,
        error: String(validationError),
        itemCount: body.length,
      });
      return NextResponse.json(
        { error: "Dados inválidos: " + String(validationError) },
        { status: 400 }
      );
    }

    logger.info("API", "PUT /api/config/channels - Saving configs", {
      userId: session.user.id,
      configCount: body.length,
    });

    // Upsert configurations
    const results = await withRetry(
      async () => {
        const { data, error } = await supabase
          .from("ChannelConfig")
          .upsert(
            body.map((config: { channelId: string; title: string; isEnabled: boolean }) => ({
              userId: session.user.id,
              channelId: config.channelId,
              title: config.title,
              isEnabled: config.isEnabled,
            })),
            {
              onConflict: "userId,channelId",
            }
          )
          .select();

        throwIfError(error);
        return data;
      },
      { maxRetries: 3 }
    );

    logger.info("API", "PUT /api/config/channels - Saved successfully", {
      userId: session.user.id,
      resultCount: results?.length ?? 0,
    });

    return NextResponse.json(results || []);
  } catch (error) {
    logger.error("API", "PUT /api/config/channels - Failed", error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode: (error as { code?: string })?.code,
      errorDetails: (error as { details?: string })?.details,
      errorHint: (error as { hint?: string })?.hint,
    });
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}
