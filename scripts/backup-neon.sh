#!/bin/bash

##
# Script: Fazer Backup Completo do Neon
#
# Exporta todos os dados do Neon em um arquivo SQL comprimido
# Use este como primeira ação antes de qualquer migração
#
# Uso:
#   DATABASE_URL="postgresql://..." bash scripts/backup-neon.sh
#
##

set -e

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

# Validar
if [ -z "$DATABASE_URL" ]; then
  log_error "DATABASE_URL não definida"
  echo "Uso: DATABASE_URL='postgresql://...' bash scripts/backup-neon.sh"
  exit 1
fi

# Validar pgdump está disponível
if ! command -v pg_dump &> /dev/null; then
  log_error "pg_dump não encontrado. Instale PostgreSQL client tools"
  exit 1
fi

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
BACKUP_FILE="neon-backup-${TIMESTAMP}.sql.gz"
LOG_FILE="backup-log-${TIMESTAMP}.txt"

{
  echo "======================================"
  echo "Backup Neon Database"
  echo "======================================"
  echo "Iniciado em: $(date)"
  echo "Arquivo: $BACKUP_FILE"
  echo ""
} | tee "$LOG_FILE"

log_info "Conectando a Neon e iniciando dump..."
{
  echo "Conectando a banco..."
} >> "$LOG_FILE"

# Fazer dump com compression
# --no-owner: não incluir owner (pode variar entre ambientes)
# --no-privileges: não incluir grants
# --compress=9: máxima compressão
pg_dump \
  --no-owner \
  --no-privileges \
  --compress=9 \
  --progress \
  "$DATABASE_URL" \
  -f "$BACKUP_FILE" 2>&1 | tee -a "$LOG_FILE"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
  log_success "Dump concluído"
else
  log_error "Dump falhou"
  exit 1
fi

# Verificar integridade
log_info "Verificando integridade do backup..."
if gzip -t "$BACKUP_FILE" 2>&1 | tee -a "$LOG_FILE"; then
  log_success "Backup íntegro"
else
  log_error "Backup corrompido!"
  exit 1
fi

# Estatísticas
BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
UNCOMPRESSED_SIZE=$(gzip -l "$BACKUP_FILE" | tail -1 | awk '{print $2}')
UNCOMPRESSED_MB=$(echo "scale=2; $UNCOMPRESSED_SIZE / 1024 / 1024" | bc)

log_success "Backup completo"
log_info "Tamanho comprimido: $BACKUP_SIZE"
log_info "Tamanho descomprimido: ${UNCOMPRESSED_MB}MB"

# Contar objetos
log_info "Contando objetos do backup..."
{
  echo ""
  echo "Estatísticas do Backup:"
  echo "---"
} >> "$LOG_FILE"

# Tentar contar (pode falhar se backup está corrompido)
TABLES=$(zcat "$BACKUP_FILE" | grep -c "^CREATE TABLE" || echo "?")
SEQUENCES=$(zcat "$BACKUP_FILE" | grep -c "^CREATE SEQUENCE" || echo "?")

log_info "Tabelas: $TABLES"
log_info "Sequências: $SEQUENCES"

{
  echo "Timestamp: $TIMESTAMP"
  echo "Arquivo: $BACKUP_FILE"
  echo "Tamanho: $BACKUP_SIZE (comprimido), ${UNCOMPRESSED_MB}MB (descomprimido)"
  echo "Tabelas: $TABLES"
  echo "Sequências: $SEQUENCES"
  echo "Status: ✅ OK"
} >> "$LOG_FILE"

# Recomendações
cat >> "$LOG_FILE" << 'EOF'

Próximas ações:
1. Salvar este backup em local seguro
2. Testar restauração em banco teste
3. Só depois prosseguir com migração
4. Manter backup por 7-14 dias após migração

Restaurar este backup em novo banco:
  createdb test_neon
  gunzip -c neon-backup-XXXXX.sql.gz | psql test_neon

Verificar backup sem restaurar:
  zcat neon-backup-XXXXX.sql.gz | head -100
  zcat neon-backup-XXXXX.sql.gz | grep "^CREATE TABLE"
EOF

echo ""
log_success "=================================="
log_success "Backup concluído com sucesso"
log_success "=================================="
echo ""
cat "$LOG_FILE"

echo ""
log_success "Arquivos criados:"
log_success "  - Backup: $BACKUP_FILE"
log_success "  - Log: $LOG_FILE"
log_warning "Guarde estes arquivos em local seguro até confirmar sucesso da migração!"
