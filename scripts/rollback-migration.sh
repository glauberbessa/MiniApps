#!/bin/bash

##
# Script: Rollback Migração Neon → Supabase
#
# Reverte a migração revertendo DATABASE_URL para Neon e redeployando
# Use este script se algo der errado durante ou após o cutover
#
# Uso:
#   NEON_DATABASE_URL="postgresql://..." bash scripts/rollback-migration.sh
#
##

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
if [ -z "$NEON_DATABASE_URL" ]; then
  log_error "NEON_DATABASE_URL não definida"
  echo "Uso:"
  echo "  NEON_DATABASE_URL='postgresql://...' bash scripts/rollback-migration.sh"
  echo ""
  echo "Dica: Você pode encontrar a URL original em:"
  echo "  - Arquivo .env.local (se tiver salvo)"
  echo "  - Git history: git log --all --source -S 'neon.tech' -- '.env*'"
  echo "  - Seu gerenciador de senhas"
  exit 1
fi

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
LOG_FILE="rollback-log-${TIMESTAMP}.txt"

# Iniciar log
{
  echo "======================================"
  echo "ROLLBACK: Supabase → Neon"
  echo "======================================"
  echo "Iniciado em: $(date)"
  echo ""
} | tee "$LOG_FILE"

# Confirmação dupla (pois é ação destrutiva)
log_warning "⚠️  AVISO: Você está revertendo para Neon"
log_warning "Isto significa que as últimas mudanças em Supabase serão perdidas"
log_warning ""
read -p "Tem certeza? Digite 'sim, reversão completa' para confirmar: " -r
if [ "$REPLY" != "sim, reversão completa" ]; then
  log_error "Rollback cancelado"
  exit 1
fi

log_success "Proceeding with rollback...\n"

# FASE 1: Remover DATABASE_URL
log_info "Fase 1: Removendo DATABASE_URL atual..."
vercel env rm DATABASE_URL --prod <<< y 2>&1 | tee -a "$LOG_FILE" || log_warning "DATABASE_URL pode já ter sido removido"

log_success "DATABASE_URL removido"
{
  echo "DATABASE_URL removido"
} >> "$LOG_FILE"

# FASE 2: Restaurar Neon
log_info "Fase 2: Restaurando DATABASE_URL para Neon..."
echo "$NEON_DATABASE_URL" | vercel env add DATABASE_URL --prod 2>&1 | tee -a "$LOG_FILE"

log_success "DATABASE_URL restaurado para Neon"
{
  echo "DATABASE_URL restaurado com URL de Neon"
} >> "$LOG_FILE"

# FASE 3: Redeploy
log_info "Fase 3: Redeployando para Neon..."
DEPLOY_OUTPUT=$(vercel deploy --prod 2>&1)
echo "$DEPLOY_OUTPUT" | tee -a "$LOG_FILE"

log_success "Deploy iniciado"

# FASE 4: Aguardar
log_warning "Fase 4: Aguardando 120 segundos para deployment..."
for i in {1..24}; do
  PROGRESS=$((i * 100 / 24))
  echo -ne "  Progress: ${PROGRESS}%\r"
  sleep 5
done
echo -ne "\n"

# FASE 5: Health check
log_info "Fase 5: Verificando conexão com Neon..."

HEALTH_URL="https://$(vercel projects list 2>/dev/null | grep -v "^─" | tail -1 | awk '{print $3}' || echo 'seu-projeto.vercel.app')/api/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>&1 || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
  log_success "Aplicação respondendo (HTTP $HTTP_CODE)"
else
  log_warning "Health check retornou HTTP $HTTP_CODE"
fi

{
  echo "Health check: HTTP $HTTP_CODE"
} >> "$LOG_FILE"

# Resumo
log_success "\n=================================="
log_success "ROLLBACK COMPLETO"
log_success "=================================="
{
  echo ""
  echo "=================================="
  echo "ROLLBACK SUMMARY"
  echo "=================================="
  echo "Status: COMPLETO"
  echo "Timestamp: $TIMESTAMP"
  echo "Alvo: Neon (revertido)"
  echo "Fim: $(date)"
  echo ""
  echo "Próximas ações:"
  echo "1. Monitorar logs por erros"
  echo "2. Verificar que dados estão acessíveis"
  echo "3. Investigar o que causou a necessidade de rollback"
  echo "4. Após análise, pode tentar novamente com ajustes"
  echo ""
} >> "$LOG_FILE"

cat "$LOG_FILE"

echo ""
log_success "Log salvo em: $LOG_FILE"
log_info "Você está de volta ao Neon. Verifique sua aplicação!"
