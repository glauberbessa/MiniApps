import { Button } from "@/components/ui/button";
import { Youtube, ListVideo, Radio, Gauge, Check, Shield, BarChart3, ArrowRight, Zap, AlertCircle } from "lucide-react";
import { UI_TEXT } from "@/lib/i18n";
import { signInWithGoogle } from "./actions";

const authErrorMessages: Record<string, string> = {
  AdapterError: "Erro de conexão com o banco de dados. Tente novamente em alguns instantes.",
  OAuthCallback: "Erro ao autenticar com o Google. Tente novamente.",
  OAuthSignin: "Erro ao iniciar autenticação com o Google.",
  OAuthAccountNotLinked: "Esta conta já está vinculada a outro método de login.",
  AccessDenied: "Acesso negado. Verifique as permissões da sua conta Google.",
  Default: "Ocorreu um erro na autenticação. Tente novamente.",
};

// Ícone do Google com cores oficiais
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorCode } = await searchParams;
  const errorMessage = errorCode
    ? authErrorMessages[errorCode] || authErrorMessages.Default
    : null;

  const features = [
    {
      icon: ListVideo,
      title: "Sincronização automática",
    },
    {
      icon: Radio,
      title: "Transfer entre playlists",
    },
    {
      icon: Gauge,
      title: "Monitoramento de quota",
    },
    {
      icon: Zap,
      title: "Interface profissional",
    },
  ];

  const highlights = [
    {
      icon: BarChart3,
      title: "Estatísticas",
      description: "Acompanhe o uso da API em tempo real",
    },
    {
      icon: Shield,
      title: "Privacidade",
      description: "Seus dados permanecem seguros",
    },
  ];

  return (
    <div className="w-full max-w-lg relative z-10 animate-in-up">
      {/* Card Principal */}
      <div className="ytpm-card-glass p-8 md:p-10 rounded-2xl border border-ytpm-border shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo com badge PRO */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-ytpm-accent to-red-700 shadow-lg shadow-ytpm-accent/30"
              aria-hidden="true"
            >
              <Youtube className="h-7 w-7 text-white" />
              {/* Glow interno */}
              <div className="absolute inset-0 rounded-xl bg-white/10" />
            </div>
            <div className="text-left">
              <h1 className="text-heading-lg text-ytpm-text tracking-tight">
                YTPM
              </h1>
              <span className="text-data-sm text-ytpm-accent tracking-widest">PRO</span>
            </div>
          </div>

          {/* Linha decorativa */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-ytpm-border to-transparent mb-6" aria-hidden="true" />

          {/* Título e subtítulo */}
          <h2 className="text-heading-md text-ytpm-text mb-2">
            Gerencie suas Playlists
          </h2>
          <p className="text-heading-xs text-ytpm-muted tracking-wide">
            COMO UM PRO
          </p>
        </div>

        {/* Linha separadora com estilo industrial */}
        <div className="relative mb-8">
          <div className="h-px bg-ytpm-border" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-ytpm-card px-3">
            <div className="w-2 h-2 rounded-full bg-ytpm-accent/50" />
          </div>
        </div>

        {/* Mensagem de erro */}
        {errorMessage && (
          <div
            className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botão de Login - Destaque principal */}
        <form action={signInWithGoogle} className="mb-8">
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold bg-white hover:bg-gray-100 text-gray-900 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 group"
            size="lg"
            aria-label="Fazer login com sua conta Google"
          >
            <GoogleIcon className="mr-3 h-5 w-5" />
            <span>{UI_TEXT.auth.loginWithGoogle}</span>
            <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </Button>
        </form>

        {/* Separador com texto */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-ytpm-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-ytpm-card px-4 text-ytpm-muted tracking-wider">
              Recursos
            </span>
          </div>
        </div>

        {/* Features Grid com checkmarks estilizados */}
        <ul className="grid grid-cols-2 gap-4 mb-8" aria-label="Recursos disponíveis">
          {features.map((feature, index) => (
            <li key={index}>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-ytpm-surface/50 border border-ytpm-border/50 hover:border-ytpm-accent/30 transition-colors duration-200">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ytpm-accent/10"
                  aria-hidden="true"
                >
                  <Check className="h-4 w-4 text-ytpm-accent" />
                </div>
                <span className="text-ui-sm text-ytpm-text leading-tight">{feature.title}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Cards de destaque lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex flex-col p-4 rounded-xl bg-ytpm-surface border border-ytpm-border hover:border-ytpm-accent/20 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <highlight.icon
                  className="h-4 w-4 text-ytpm-accent"
                  aria-hidden="true"
                />
                <span className="text-ui-sm font-medium text-ytpm-text">{highlight.title}</span>
              </div>
              <p className="text-ui-sm text-ytpm-muted leading-relaxed">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>

        {/* Aviso de privacidade */}
        <p className="text-center text-ui-sm text-ytpm-muted/70 mt-8">
          {UI_TEXT.auth.loginDescription}
        </p>
      </div>

      {/* Link para voltar ao launcher */}
      <div className="text-center mt-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-ui-sm text-ytpm-muted hover:text-ytpm-text transition-colors duration-200"
        >
          <span>←</span>
          <span>Voltar ao MiniApps</span>
        </a>
      </div>
    </div>
  );
}
