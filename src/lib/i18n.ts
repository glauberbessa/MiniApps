export const UI_TEXT = {
  // Navegação
  nav: {
    playlists: "Playlists",
    channels: "Canais",
    configPlaylists: "Configurar Playlists",
    configChannels: "Configurar Canais",
    quota: "Quota",
    logout: "Sair",
    autoCloseMenu: "Fechar menu automaticamente",
    exportEnglish: "Exportação em massa",
  },

  // Playlists
  playlists: {
    title: "Gerenciar Playlists",
    sourcePlaylist: "Playlist de Origem",
    destinationPlaylist: "Playlist de Destino",
    selectPlaylist: "Selecione uma playlist",
    loadVideos: "Carregar Vídeos",
    transferVideos: "Transferir Vídeos",
    removeFromSource: "Excluir da origem",
    noVideos: "Nenhum vídeo encontrado",
    loadingVideos: "Carregando vídeos...",
    loadingPlaylists: "Carregando playlists...",
  },

  // Canais
  channels: {
    title: "Gerenciar Canais",
    selectChannel: "Selecione um canal",
    destinationPlaylist: "Playlist de Destino",
    assignToPlaylist: "Atribuir à Playlist",
    noVideos: "Nenhum vídeo encontrado",
    loadingVideos: "Carregando vídeos...",
    loadingChannels: "Carregando canais...",
  },

  // Filtros
  filters: {
    title: "Filtros",
    search: "Buscar...",
    searchInTitle: "Título",
    searchInDescription: "Descrição",
    searchInChannel: "Canal",
    language: "Idioma",
    allLanguages: "Todos os idiomas",
    duration: "Duração",
    durationMin: "Mínima (segundos)",
    durationMax: "Máxima (segundos)",
    views: "Visualizações",
    viewsMin: "Mínimas",
    viewsMax: "Máximas",
    reset: "Resetar Filtros",
    selectAll: "Selecionar Todos",
    deselectAll: "Desmarcar Todos",
  },

  // Presets
  presets: {
    duration: {
      all: "Todos",
      shorts: "Shorts",
      short: "Curtos",
      medium: "Médios",
      long: "Longos",
    },
    views: {
      all: "Todas",
      low: "Baixas",
      medium: "Médias",
      high: "Altas",
      viral: "Virais",
    },
  },

  // Estatísticas
  stats: {
    total: "Total",
    filtered: "Filtrados",
    selected: "Selecionados",
    duration: "Duração",
    selectedDuration: "Duração selecionada",
  },

  // Visualização
  viewMode: {
    grid: "Grade",
    list: "Lista",
    table: "Tabela",
  },

  // Colunas da tabela
  columns: {
    select: "Selecionar",
    thumbnail: "Miniatura",
    title: "Título",
    channel: "Canal",
    duration: "Duração",
    views: "Visualizações",
    published: "Publicado",
    added: "Adicionado",
    language: "Idioma",
  },

  // Quota
  quota: {
    title: "Status de Quota",
    subtitle: "Gerenciamento de quota da API do YouTube",
    used: "Utilizada",
    remaining: "Restante",
    limit: "Limite diário",
    history: "Histórico",
    historySubtitle: "Consumo dos últimos 7 dias",
    costs: "Custos por Operação",
    costsSubtitle: "Quanto custa cada operação",
    warning: "Atenção: Quota em {percent}%",
    exceeded: "Limite diário de quota atingido. Tente novamente amanhã.",
    units: "unidades",
  },

  // Configurações
  config: {
    playlistsTitle: "Configuração de Playlists",
    playlistsSubtitle: "Ative ou desative playlists para exibição",
    channelsTitle: "Configuração de Canais",
    channelsSubtitle: "Ative ou desative canais para exibição",
    enableAll: "Ativar Todos",
    disableAll: "Desativar Todos",
    videos: "vídeos",
    enabled: "Ativada",
    disabled: "Desativada",
    showOnlyActive: "Apenas Ativas",
    saving: "Salvando...",
    saved: "Salvo!",
  },

  // Mensagens
  messages: {
    transferSuccess: "Transferidos {count} vídeos com sucesso!",
    transferPartial: "Transferidos {success} vídeos. {errors} erros.",
    transferError: "Erro ao transferir vídeos.",
    assignSuccess: "Atribuídos {count} vídeos com sucesso!",
    assignPartial: "Atribuídos {success} vídeos. {errors} erros.",
    assignError: "Erro ao atribuir vídeos.",
    loadError: "Erro ao carregar dados.",
    quotaExceeded: "Quota diária excedida.",
    quotaWarning: "Quota está em {percent}%. Use com moderação.",
    noSelection: "Selecione pelo menos um vídeo.",
    noDestination: "Selecione uma playlist de destino.",
    samePlaylist: "A playlist de origem e destino são iguais.",
  },

  // Autenticação
  auth: {
    login: "Entrar",
    loginWithGoogle: "Entrar com Google",
    logout: "Sair",
    welcome: "Bem-vindo(a)!",
    loginTitle: "YT Playlist Manager Pro",
    loginSubtitle: "Gerencie suas playlists do YouTube de forma profissional",
    loginDescription:
      "Organize seus vídeos, transfira entre playlists e monitore seu uso da API do YouTube.",
  },

  // Formulários de Autenticação (e-mail/senha)
  authForms: {
    // Labels de formulário
    labels: {
      email: "E-mail",
      password: "Senha",
      currentPassword: "Senha Atual",
      newPassword: "Nova Senha",
      confirmPassword: "Confirmar Senha",
      confirmNewPassword: "Confirmar Nova Senha",
      name: "Nome",
    },

    // Placeholders
    placeholders: {
      email: "seu@email.com",
      password: "Digite sua senha",
      currentPassword: "Digite sua senha atual",
      newPassword: "Digite sua nova senha",
      confirmPassword: "Confirme sua senha",
      confirmNewPassword: "Confirme sua nova senha",
      name: "Seu nome",
    },

    // Botões
    buttons: {
      login: "Entrar",
      loggingIn: "Entrando...",
      register: "Criar Conta",
      registering: "Criando conta...",
      forgotPassword: "Enviar Instruções",
      sendingInstructions: "Enviando...",
      resetPassword: "Redefinir Senha",
      resettingPassword: "Redefinindo...",
      changePassword: "Alterar Senha",
      changingPassword: "Alterando...",
      loginWithGoogle: "Continuar com Google",
      backToLogin: "Voltar para o login",
      requestNewLink: "Solicitar Novo Link",
      setPassword: "Definir Senha",
    },

    // Títulos de páginas
    titles: {
      login: "Entrar",
      register: "Criar Conta",
      forgotPassword: "Esqueceu sua senha?",
      resetPassword: "Redefinir Senha",
      changePassword: "Alterar Senha",
      invalidLink: "Link Inválido",
    },

    // Descrições de páginas
    descriptions: {
      login: "Entre com seu e-mail e senha ou use sua conta Google",
      register: "Preencha os dados abaixo para criar sua conta",
      forgotPassword: "Digite seu e-mail e enviaremos instruções para redefinir sua senha",
      resetPassword: "Digite sua nova senha abaixo",
      changePassword: "Digite sua senha atual e escolha uma nova senha",
      changePasswordOAuth: "Defina uma senha para sua conta",
    },

    // Mensagens de erro
    errors: {
      invalidCredentials: "Credenciais inválidas. Verifique seu e-mail e senha.",
      loginFailed: "Ocorreu um erro ao fazer login. Tente novamente.",
      registerFailed: "Erro ao criar conta. Tente novamente.",
      registerError: "Ocorreu um erro ao criar a conta. Tente novamente.",
      forgotPasswordFailed: "Erro ao processar solicitação. Tente novamente.",
      forgotPasswordError: "Ocorreu um erro. Tente novamente.",
      resetPasswordFailed: "Erro ao redefinir senha. Tente novamente.",
      resetPasswordError: "Ocorreu um erro. Tente novamente.",
      changePasswordFailed: "Erro ao alterar senha. Tente novamente.",
      changePasswordError: "Ocorreu um erro. Tente novamente.",
      invalidToken: "Este link de recuperação de senha expirou ou é inválido.",
      tokenExpiredInfo: "Os links de recuperação são válidos por 1 hora. Se seu link expirou, solicite um novo.",
    },

    // Mensagens de sucesso
    success: {
      registered: "Conta criada com sucesso! Redirecionando para o login...",
      registeredBanner: "Conta criada com sucesso! Faça login para continuar.",
      passwordReset: "Sua senha foi alterada com sucesso. Redirecionando para o login...",
      passwordResetBanner: "Senha redefinida com sucesso! Faça login com sua nova senha.",
      passwordChanged: "Senha alterada com sucesso!",
      emailSent: "Se o e-mail informado estiver cadastrado, você receberá instruções para redefinir sua senha.",
    },

    // Links e navegação
    links: {
      forgotPassword: "Esqueceu sua senha?",
      noAccount: "Não tem uma conta?",
      hasAccount: "Já tem uma conta?",
      register: "Cadastre-se",
      login: "Entrar",
    },

    // Divisores
    dividers: {
      orContinueWith: "Ou continue com",
    },

    // Estados de verificação
    verification: {
      checkEmail: "Verifique seu e-mail",
      passwordRedefined: "Senha redefinida",
    },

    // Informações adicionais
    info: {
      oauthNoPassword: 'Sua conta foi criada usando Google. Para definir uma senha, use a opção "Esqueci minha senha" no login.',
      oauthNoPasswordTitle: "Conta sem senha",
    },
  },

  // Toasts de autenticação
  authToasts: {
    loginSuccess: {
      title: "Bem-vindo!",
      description: "Login realizado com sucesso.",
    },
    loginError: {
      title: "Erro no login",
      description: "Não foi possível fazer login. Tente novamente.",
    },
    registerSuccess: {
      title: "Conta criada!",
      description: "Sua conta foi criada com sucesso. Faça login para continuar.",
    },
    registerError: {
      title: "Erro no cadastro",
      description: "Não foi possível criar sua conta. Tente novamente.",
    },
    passwordResetEmailSent: {
      title: "E-mail enviado!",
      description: "Verifique sua caixa de entrada.",
    },
    passwordResetSuccess: {
      title: "Senha redefinida!",
      description: "Sua senha foi alterada. Faça login com a nova senha.",
    },
    passwordChangeSuccess: {
      title: "Senha alterada!",
      description: "Sua senha foi alterada com sucesso.",
    },
    passwordChangeError: {
      title: "Erro ao alterar senha",
      description: "Não foi possível alterar sua senha. Tente novamente.",
    },
    logoutSuccess: {
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    },
  },

  // Geral
  general: {
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Salvar",
    close: "Fechar",
    back: "Voltar",
    next: "Próximo",
    refresh: "Atualizar",
    exportLinks: "Exportar Links",
  },

  // Transferência
  transfer: {
    title: "Transferir Vídeos",
    description: "Você está prestes a transferir {count} vídeo(s).",
    quotaCost: "Custo em quota: {cost} unidades",
    quotaRemaining: "Quota restante: {remaining} unidades",
    quotaInsufficient: "Quota insuficiente para esta operação.",
    confirm: "Confirmar Transferência",
    inProgress: "Transferindo...",
    success: "Transferência concluída!",
    error: "Erro na transferência",
  },

  // Atribuição
  assign: {
    title: "Atribuir à Playlist",
    description: "Você está prestes a adicionar {count} vídeo(s) à playlist.",
    quotaCost: "Custo em quota: {cost} unidades",
    quotaRemaining: "Quota restante: {remaining} unidades",
    quotaInsufficient: "Quota insuficiente para esta operação.",
    confirm: "Confirmar Atribuição",
    inProgress: "Atribuindo...",
    success: "Atribuição concluída!",
    error: "Erro na atribuição",
  },

  // Exportação em Massa
  exportEnglish: {
    title: "Exportação em Massa",
    description: "Importa todos os vídeos das suas playlists e canais inscritos para o banco de dados. Ao longo de vários dias, constrói uma biblioteca completa, permitindo filtrar por idioma.",
    startExport: "Iniciar Exportação",
    continueExport: "Continuar Exportação",
    exporting: "Exportando...",
    initializing: "Inicializando...",
    progress: "Processando fonte {current} de {total}",
    currentSource: "Fonte atual:",
    results: "Resultados",
    totalVideos: "Total de vídeos importados",
    englishVideos: "Vídeos em inglês",
    sourcesCompleted: "Fontes concluídas",
    sourcesRemaining: "Fontes restantes",
    downloadFile: "Baixar Links em Inglês",
    noEnglishVideos: "Nenhum vídeo em inglês encontrado.",
    exportComplete: "Exportação concluída! Todos os vídeos foram importados.",
    exportPaused: "Exportação pausada — limite de 80% da quota diária atingido. Continue amanhã para importar mais vídeos.",
    scanComplete: "Exportação concluída!",
    scanError: "Erro durante a exportação.",
    lastImport: "Última importação:",
    neverImported: "Nenhuma importação realizada ainda. Clique em Iniciar Exportação.",
    quotaInfo: "Quota utilizada: {used} de {ceiling} unidades ({percent}%)",
  },

  // Home (Launcher)
  home: {
    title: "MINIAPPS",
    subtitle: "Sua central de aplicativos",
    badgeVersion: "v2.0 disponível",
    welcomeBack: "Bem-vindo de volta, {name}",
    chooseApp: "Escolha um aplicativo para começar",
    access: "ACESSO",
    enterAccount: "Entre na sua conta",
    userOnline: "Online",
    changePassword: "Alterar senha",
    apps: {
      ytpm: {
        title: "Playlist Manager",
        subtitle: "YouTube",
        description: "Gerencie suas playlists do YouTube como um profissional. Sincronização automática, transferência de vídeos e monitoramento de quota em tempo real.",
        features: [
          "Sincronização automática",
          "Transfer entre playlists",
          "Monitoramento de quota",
        ],
      },
      scanner: {
        title: "QR Code & Barras",
        subtitle: "Scanner",
        description: "Escaneie códigos QR e de barras instantaneamente. Interface minimalista focada na velocidade e precisão.",
        features: [
          "QR Code e códigos de barras",
          "OCR para texto",
          "Zoom progressivo",
        ],
      },
    },
    footer: {
      hub: "Hub de Aplicativos",
      about: "Sobre",
      privacy: "Privacidade",
    },
  },
};

// Função helper para substituir placeholders
export function t(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;

  let result = text;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return result;
}
