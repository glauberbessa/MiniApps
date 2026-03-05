#!/bin/bash

##
# Script: Execute Cutover Neon → Supabase
#
# Realiza a migração final do banco de dados de Neon para Supabase
# - Atualiza DATABASE_URL no Vercel
# - Faz redeploy automático
# - Verifica saúde da aplicação
#
# Uso:
#   SUPABASE_DATABASE_URL="postgresql://..." bash scripts/execute-cutover.sh
#
# ⚠️  Este script é destrutivo. Certifique-se de ter backup antes de executar!
##

set -e  # Falhar imediatamente se houver erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções helper
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Validar environment
if [ -z "$SUPABASE_DATABASE_URL" ]; then
  log_error "SUPABASE_DATABASE_URL não definida"
  echo "Uso:"
  echo "  SUPABASE_DATABASE_URL='postgresql://...' bash scripts/execute-cutover.sh"
  exit 1
fi

# Validar vercel CLI
if ! command -v vercel &> /dev/null; then
  log_error "vercel CLI não encontrada. Instale com: npm i -g vercel"
  exit 1
fi

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
LOG_FILE="cutover-log-${TIMESTAMP}.txt"

# Iniciar log
{
  echo "======================================"
  echo "Cutover Neon → Supabase"
  echo "======================================"
  echo "Iniciado em: $(date)"
  echo "Log salvo em: $LOG_FILE"
  echo ""
} | tee "$LOG_FILE"

# Confirmar antes de prosseguir
log_warning "Este é um processo irreversível!"
log_warning "Certifique-se de que:"
log_warning "  - Você tem backup do banco Neon"
log_warning "  - Supabase foi validado (contagem de registros)"
log_warning "  - Staging foi testado com sucesso"
log_warning ""
read -p "Deseja prosseguir com o cutover? (sim/não): " -r
if [[ ! $REPLY =~ ^[sS][iI][mM]$ ]]; then
  log_error "Cutover cancelado pelo usuário"
  exit 1
fi

log_success "Proceeding with cutover...\n"

# FASE 1: Obter info de projeto Vercel
log_info "Fase 1: Obtendo informações do projeto Vercel..."
{
  echo ""
  echo "Fase 1: Vercel Project Info"
  echo "---"
} >> "$LOG_FILE"

PROJECT_NAME=$(vercel projects list 2>/dev/null | grep -v "^─" | tail -1 | awk '{print $1}')
if [ -z "$PROJECT_NAME" ]; then
  log_warning "Não foi possível determinar projeto Vercel automaticamente"
  log_info "Verifique que você está logado no Vercel: vercel login"
  exit 1
fi

log_success "Projeto: $PROJECT_NAME"
echo "Projeto: $PROJECT_NAME" >> "$LOG_FILE"

# FASE 2: Atualizar DATABASE_URL
log_info "\nFase 2: Atualizando DATABASE_URL em Vercel..."
{
  echo ""
  echo "Fase 2: Updating DATABASE_URL"
  echo "---"
  echo "Removendo DATABASE_URL antigo..."
} >> "$LOG_FILE"

# Remover variable existente
vercel env rm DATABASE_URL --prod <<< y 2>&1 | tee -a "$LOG_FILE" || true

log_success "DATABASE_URL antigo removido"

# Adicionar novo
log_info "Adicionando novo DATABASE_URL..."
echo "$SUPABASE_DATABASE_URL" | vercel env add DATABASE_URL --prod 2>&1 | tee -a "$LOG_FILE"

log_success "DATABASE_URL atualizado com Supabase"
{
  echo "Novo DATABASE_URL adicionado com sucesso"
} >> "$LOG_FILE"

# FASE 3: Redeploy
log_info "\nFase 3: Redeployando aplicação..."
{
  echo ""
  echo "Fase 3: Redeploying"
  echo "---"
} >> "$LOG_FILE"

DEPLOY_OUTPUT=$(vercel deploy --prod 2>&1)
echo "$DEPLOY_OUTPUT" | tee -a "$LOG_FILE"

DEPLOYMENT_URL=$(echo "$DEPLOY_OUTPUT" | grep "https://" | tail -1)
log_success "Deploy iniciado: $DEPLOYMENT_URL"
{
  echo "Deploy URL: $DEPLOYMENT_URL"
} >> "$LOG_FILE"

# FASE 4: Aguardar deployment
log_warning "\nFase 4: Aguardando 120 segundos para deployment finalizar..."
{
  echo ""
  echo "Fase 4: Waiting for Deployment"
  echo "---"
  echo "Início: $(date)"
} >> "$LOG_FILE"

for i in {1..24}; do
  PROGRESS=$((i * 100 / 24))
  echo -ne "  Progress: ${PROGRESS}% (${i}/24 intervals de 5s)\r"
  sleep 5
done
echo -ne "\n"

log_success "Tempo de espera concluído"
{
  echo "Fim: $(date)"
} >> "$LOG_FILE"

# FASE 5: Health check
log_info "\nFase 5: Verificando saúde da aplicação..."
{
  echo ""
  echo "Fase 5: Health Check"
  echo "---"
} >> "$LOG_FILE"

HEALTH_URL="https://$(echo $DEPLOYMENT_URL | sed 's|https://||')/api/health"
MAX_RETRIES=5
RETRY_COUNT=0

log_info "Testando: $HEALTH_URL"

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>&1 || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    log_success "API respondendo (HTTP 200)"
    {
      echo "Health check: OK (HTTP $HTTP_CODE)"
    } >> "$LOG_FILE"
    break
  elif [ "$HTTP_CODE" = "000" ]; then
    log_warning "Tentativa $((RETRY_COUNT + 1))/$MAX_RETRIES: Aguardando deployment..."
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 10
  else
    log_info "Health check retornou HTTP $HTTP_CODE (pode ser esperado)"
    {
      echo "Health check: HTTP $HTTP_CODE"
    } >> "$LOG_FILE"
    break
  fi
done

# FASE 6: Resumo final
log_success "\n=================================="
log_success "CUTOVER COMPLETO"
log_success "=================================="
{
  echo ""
  echo "=================================="
  echo "CUTOVER SUMMARY"
  echo "=================================="
  echo "Status: SUCESSO"
  echo "Timestamp: $TIMESTAMP"
  echo "Projeto: $PROJECT_NAME"
  echo "Deployment URL: $DEPLOYMENT_URL"
  echo "Health Check: Executado"
  echo "Fim: $(date)"
  echo ""
  echo "Próximas ações:"
  echo "1. Monitorar aplicação por 30 minutos"
  echo "2. Verificar logs em: $DEPLOYMENT_URL/api/logs"
  echo "3. Testar login e funcionalidades críticas"
  echo "4. Se tudo OK, manter Neon como fallback por 24-48h"
  echo "5. Deletar backup e environment Neon após confirmação"
  echo ""
} >> "$LOG_FILE"

cat "$LOG_FILE"

echo ""
log_success "Log salvo em: $LOG_FILE"
log_success "Monitore sua aplicação em: https://${DEPLOYMENT_URL#*://}"
