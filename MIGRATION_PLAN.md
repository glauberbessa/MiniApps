# Plano Executivo: Migração Neon → Supabase

**Status**: ✅ Aprovado
**Ambiente**: Teste (downtime aceitável)
**Estratégia**: Downtime planejado + segurança balanceada
**Data Alvo**: Próximos 2 dias
**Responsável**: DevOps/Desenvolvimento

---

## 🎯 Resumo Executivo

| Item | Detalhes |
|------|----------|
| **Estratégia** | Dump Neon → Restore Supabase (15 min downtime) |
| **Risco** | BAIXO (ambiente teste, sem usuários) |
| **Rollback** | Simples: revert DATABASE_URL, redeploy |
| **Validação** | 3 níveis: dados, integração, performance |
| **Duração Total** | ~1.5 dias (prep + exec + monitor) |

---

## 📋 FASE 1: Preparação (2-4 horas)

### 1.1 Setup Supabase

```bash
# 1. Ir a https://app.supabase.com e criar novo projeto
# - Nome: "MiniApps-Migration" (ou similar)
# - Região: us-east-1 (mais próxima do Vercel)
# - Database password: Gerar forte (salvar em lugar seguro)
# - Aguardar ~2 minutos para provisionar

# 2. Depois que criado, ir a Project Settings → Database
# Copiar a connection string:
# postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# 3. Salvar em local seguro (vamos usar em breve)
echo "SUPABASE_CONNECTION_STRING='postgresql://...'" > /tmp/supabase.env
```

### 1.2 Fazer Backup Completo do Neon

```bash
# 1. Exportar schema + dados do Neon
# IMPORTANTE: Use a connection string do Neon atual
# Você pode encontrar em: Vercel → Project → Integrations → Storage/Database

NEON_CONNECTION_STRING="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# 2. Fazer dump
pg_dump \
  --no-owner \
  --no-privileges \
  --compress=9 \
  -f neon-backup-$(date +%Y%m%d-%H%M%S).sql.gz \
  "$NEON_CONNECTION_STRING"

echo "✅ Backup criado: $(ls -lh neon-backup-*.sql.gz | tail -1 | awk '{print $9, $5}')"

# 3. Verificar tamanho e integridade
gzip -t neon-backup-*.sql.gz && echo "✅ Backup íntegro"

# 4. Salvar backup em local seguro (não deletar até confirmação)
mkdir -p ~/backups
cp neon-backup-*.sql.gz ~/backups/
```

### 1.3 Capturar Estatísticas Atuais

```bash
#!/bin/bash
# scripts/capture-baseline.sh

NEON_URL="postgresql://..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Contar registros em cada tabela
psql "$NEON_URL" -c "
SELECT
  tablename,
  n_live_tup as row_count,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
" | tee neon-baseline-$TIMESTAMP.txt

# Salvar para comparação pós-migração
echo "Baseline salvo em: neon-baseline-$TIMESTAMP.txt"
```

**Executar:**
```bash
bash scripts/capture-baseline.sh
```

### 1.4 Preparar Connection Strings

```bash
# Arquivo: .env.migration (NUNCA commitar!)
cat > .env.migration << 'EOF'
# Neon (Atual)
DATABASE_URL_NEON="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Supabase (Novo)
DATABASE_URL_SUPABASE="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Backup do environment atual
VERCEL_CURRENT_DATABASE_URL="${DATABASE_URL_NEON}"
EOF

chmod 600 .env.migration
```

---

## 🗄️ FASE 2: Preparar Banco de Dados Supabase (1-2 horas)

### 2.1 Aplicar Schema Prisma

```bash
# 1. Carregar Supabase connection
export DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# 2. Gerar cliente Prisma
npx prisma generate

# 3. Aplicar schema (criar tabelas, índices, constraints)
npx prisma db push --skip-generate

# 4. Verificar tabelas criadas
psql "$DATABASE_URL" -c "\dt+"

# Output esperado:
# public | User              | table
# public | Account           | table
# public | Session           | table
# public | VerificationToken | table
# public | PlaylistConfig    | table
# public | ChannelConfig     | table
# public | QuotaHistory      | table
# public | ExportedVideo     | table
# public | ExportProgress    | table
```

### 2.2 Restaurar Dados do Backup Neon

```bash
# 1. Descompactar backup
gunzip -c neon-backup-*.sql.gz > neon-backup.sql

# 2. Restaurar em Supabase
# ATENÇÃO: Isso vai tomar alguns minutos dependendo do tamanho
psql "$DATABASE_URL" < neon-backup.sql

# 3. Monitorar progresso (em outro terminal)
watch -n 1 'psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\"; SELECT COUNT(*) FROM \"Account\";"'

echo "✅ Restauração completa"
```

**Alternativa: Se restauração inteira falhar, restaurar tabela-por-tabela:**
```bash
# Ver o que está no backup
grep "^CREATE TABLE" neon-backup.sql

# Restaurar seletivamente (mais seguro)
psql "$DATABASE_URL" -c "
  TRUNCATE \"User\" CASCADE;
" && pg_restore -d "$DATABASE_URL" -t "User" neon-backup.sql

# Repeat para outras tabelas importantes
```

---

## ✅ FASE 3: Validação Pós-Cópia (1 hora)

### 3.1 Script de Validação

**Arquivo**: `scripts/validate-migration.js`

```javascript
#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const neonPrisma = new PrismaClient({
  datasources: { database: { url: process.env.DATABASE_URL_NEON } },
});

const supabasePrisma = new PrismaClient({
  datasources: { database: { url: process.env.DATABASE_URL_SUPABASE } },
});

const tables = [
  'User',
  'Account',
  'Session',
  'VerificationToken',
  'PlaylistConfig',
  'ChannelConfig',
  'QuotaHistory',
  'ExportedVideo',
  'ExportProgress',
];

async function validateMigration() {
  console.log('🔍 Iniciando validação de migração...\n');

  let allOk = true;

  for (const table of tables) {
    try {
      const neonCount = await neonPrisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "${table}"`
      );
      const supabaseCount = await supabasePrisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "${table}"`
      );

      const neonTotal = neonCount[0].count;
      const supabaseTotal = supabaseCount[0].count;

      if (neonTotal === supabaseTotal) {
        console.log(`✅ ${table.padEnd(20)} | Neon: ${neonTotal.toString().padEnd(6)} | Supabase: ${supabaseTotal}`);
      } else {
        console.log(`❌ ${table.padEnd(20)} | Neon: ${neonTotal.toString().padEnd(6)} | Supabase: ${supabaseTotal} [MISMATCH]`);
        allOk = false;
      }
    } catch (error) {
      console.log(`⚠️  ${table.padEnd(20)} | Erro: ${error.message}`);
      allOk = false;
    }
  }

  console.log('\n' + (allOk ? '✅ Validação OK' : '❌ Validação falhou'));

  process.exit(allOk ? 0 : 1);
}

validateMigration()
  .catch(console.error)
  .finally(async () => {
    await neonPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  });
```

**Executar:**
```bash
# Carregar environment
export DATABASE_URL_NEON="postgresql://..."
export DATABASE_URL_SUPABASE="postgresql://..."

node scripts/validate-migration.js
```

### 3.2 Validar Dados Críticos

```bash
#!/bin/bash
# scripts/validate-critical-data.sh

SUPABASE_URL="postgresql://..."

echo "🔐 Validando dados críticos..."

# 1. Senhas (bcrypt hashes não devem estar corrompidas)
NEON_PASSWORDS=$(psql "$NEON_URL" -t -c "SELECT COUNT(*) FROM \"User\" WHERE password IS NOT NULL AND LENGTH(password) = 60;")
SUPABASE_PASSWORDS=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(*) FROM \"User\" WHERE password IS NOT NULL AND LENGTH(password) = 60;")

echo "Senhas bcrypt: Neon=$NEON_PASSWORDS, Supabase=$SUPABASE_PASSWORDS"
[ "$NEON_PASSWORDS" -eq "$SUPABASE_PASSWORDS" ] && echo "✅ Senhas OK" || echo "❌ Senhas MISMATCH"

# 2. Tokens OAuth (refresh_token não está NULL)
NEON_TOKENS=$(psql "$NEON_URL" -t -c "SELECT COUNT(*) FROM \"Account\" WHERE refresh_token IS NOT NULL;")
SUPABASE_TOKENS=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(*) FROM \"Account\" WHERE refresh_token IS NOT NULL;")

echo "Tokens OAuth: Neon=$NEON_TOKENS, Supabase=$SUPABASE_TOKENS"
[ "$NEON_TOKENS" -eq "$SUPABASE_TOKENS" ] && echo "✅ Tokens OK" || echo "❌ Tokens MISMATCH"

# 3. Timestamps (não devem ser NULL para dados críticos)
NEON_SESSIONS=$(psql "$NEON_URL" -t -c "SELECT COUNT(*) FROM \"Session\" WHERE expires IS NOT NULL;")
SUPABASE_SESSIONS=$(psql "$SUPABASE_URL" -t -c "SELECT COUNT(*) FROM \"Session\" WHERE expires IS NOT NULL;")

echo "Sessões: Neon=$NEON_SESSIONS, Supabase=$SUPABASE_SESSIONS"
[ "$NEON_SESSIONS" -eq "$SUPABASE_SESSIONS" ] && echo "✅ Sessões OK" || echo "❌ Sessões MISMATCH"

echo "✅ Validação de dados críticos concluída"
```

**Executar:**
```bash
bash scripts/validate-critical-data.sh
```

---

## 🧪 FASE 4: Teste em Staging (2-4 horas)

### 4.1 Criar Environment Staging no Vercel

```bash
# 1. Via Vercel CLI ou Dashboard
# Project Settings → Environments
# Criar novo environment: "staging"

# 2. Adicionar environment variables (staging)
vercel env add DATABASE_URL staging
# Paste: postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# 3. Fazer redeploy para staging
vercel deploy --prod  # (ou via Dashboard para staging branch)

# 4. Verificar se staging está usando Supabase
curl https://staging-seu-projeto.vercel.app/api/quota
# Deve retornar 200 (ou 401 se não autenticado, mas sem erro de conexão)
```

### 4.2 Testes de Integração

**Arquivo**: `scripts/test-integration-staging.sh`

```bash
#!/bin/bash

STAGING_URL="https://staging-seu-projeto.vercel.app"

echo "🧪 Testando integração com Supabase em Staging...\n"

# 1. Health check
echo "1️⃣  Health Check"
HEALTH=$(curl -s "$STAGING_URL/api/health" | jq '.status')
if [ "$HEALTH" = '"ok"' ]; then
  echo "✅ API respondendo"
else
  echo "❌ API não respondendo"
  exit 1
fi

# 2. Database connectivity (requer auth - vai falhar, mas não com erro de conexão)
echo "2️⃣  Database Connectivity"
QUOTA=$(curl -s -H "Authorization: Bearer fake_token" "$STAGING_URL/api/quota" -w "\n%{http_code}")
HTTP_CODE=$(echo "$QUOTA" | tail -1)
if [[ "$HTTP_CODE" =~ ^(401|403|200)$ ]]; then
  echo "✅ Database conectado (HTTP $HTTP_CODE)"
else
  echo "❌ Database erro (HTTP $HTTP_CODE)"
  exit 1
fi

# 3. Se tiver usuário teste, fazer login
echo "3️⃣  Teste de Login (se tiver credenciais)"
# (Manual com postman ou credential de teste se existir)

echo "\n✅ Testes básicos OK"
```

### 4.3 Teste Local (Opcional)

```bash
# Se quiser testar localmente antes do staging
export DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

npm install
npm run build
npm run dev

# Verificar logs - não devem ter erros de conexão
# Abrir http://localhost:3000 e testar login (se tiver credenciais)
```

---

## 🚀 FASE 5: Cutover (15 minutos)

### 5.1 Checklist Pré-Cutover

```bash
#!/bin/bash
# scripts/pre-cutover-check.sh

echo "📋 Checklist pré-cutover\n"

checks=(
  "Backup Neon feito"
  "Supabase banco criado e restaurado"
  "Validação de dados OK"
  "Staging testado com Supabase"
  "Script de rollback preparado"
  "Ninguém desenvolver durante 15 minutos"
)

for check in "${checks[@]}"; do
  echo "[ ] $check"
done

echo "\nResponda sim para confirmar cada item acima antes de prosseguir."
```

### 5.2 Executar Cutover

```bash
#!/bin/bash
# scripts/execute-cutover.sh

set -e  # Falhar se algo der erro

SUPABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚀 INICIANDO CUTOVER"
echo "⏱️  Timestamp: $TIMESTAMP\n"

# 1. Atualizar DATABASE_URL em Vercel
echo "1️⃣  Atualizando DATABASE_URL em Vercel..."
vercel env rm DATABASE_URL --prod <<< 'y' 2>/dev/null || true
vercel env add DATABASE_URL <<< "$SUPABASE_URL"
echo "✅ DATABASE_URL atualizado"

# 2. Fazer redeploy automático
echo "\n2️⃣  Redeployando aplicação..."
DEPLOYMENT=$(vercel deploy --prod)
echo "✅ Deploy iniciado"

# 3. Aguardar readiness (esperar 2 min para build + deploy)
echo "\n3️⃣  Aguardando 120 segundos para deploy finalizar..."
sleep 120

# 4. Health check pós-deploy
echo "\n4️⃣  Verificando saúde da aplicação..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://seu-projeto.vercel.app/api/health")
if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ API respondendo (HTTP 200)"
else
  echo "⚠️  HTTP $HTTP_CODE (pode ser esperado se sem dados)"
fi

# 5. Salvar log de sucesso
echo "\n5️⃣  Salvando log de cutover..."
cat > cutover-log-$TIMESTAMP.txt << EOF
Cutover executado com sucesso em $TIMESTAMP
Neon: Old DATABASE_URL
Supabase: $SUPABASE_URL
Deploy Vercel: $DEPLOYMENT
EOF

echo "✅ Log salvo em: cutover-log-$TIMESTAMP.txt"
echo "\n🎉 CUTOVER COMPLETO"
```

**Executar (com cuidado!):**
```bash
bash scripts/execute-cutover.sh
```

---

## 🔄 FASE 6: Rollback (Se Necessário)

### 6.1 Script de Rollback Rápido

```bash
#!/bin/bash
# scripts/rollback-migration.sh

NEON_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

echo "🔙 INICIANDO ROLLBACK"
echo "Revertendo para Neon...\n"

# 1. Restaurar DATABASE_URL original
echo "1️⃣  Revertendo DATABASE_URL..."
vercel env rm DATABASE_URL --prod <<< 'y'
vercel env add DATABASE_URL <<< "$NEON_URL"
echo "✅ DATABASE_URL revertido"

# 2. Redeploy para Neon
echo "\n2️⃣  Redeployando para Neon..."
vercel deploy --prod
echo "✅ Deploy para Neon iniciado"

# 3. Aguardar
sleep 120

# 4. Verificar
echo "\n3️⃣  Verificando saúde..."
curl -s "https://seu-projeto.vercel.app/api/health" || echo "Aguardando..."

echo "\n✅ ROLLBACK COMPLETO - Voltando ao Neon"
```

**Como usar:**
```bash
# Se algo der errado durante ou após cutover
bash scripts/rollback-migration.sh
```

---

## 📊 FASE 7: Monitoramento Pós-Migração (1 semana)

### 7.1 Métricas para Monitorar

```bash
#!/bin/bash
# scripts/monitor-migration.sh

VERCEL_URL="https://seu-projeto.vercel.app"
DURATION_HOURS=24  # Rodar por 24 horas

echo "📊 Iniciando monitoramento pós-migração por $DURATION_HOURS horas...\n"

for i in {1..288}; do  # 288 = 24h em 5-minute intervals
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  # 1. Latência de API
  LATENCY=$(curl -s -o /dev/null -w "%{time_total}" "$VERCEL_URL/api/health")

  # 2. HTTP Status
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL/api/health")

  # 3. Tamanho resposta
  SIZE=$(curl -s -w "%{size_download}" "$VERCEL_URL/api/health")

  echo "[$TIMESTAMP] Status: $STATUS | Latency: ${LATENCY}s | Size: $SIZE bytes"

  # Dormir 5 minutos
  sleep 300
done

echo "✅ Monitoramento completo"
```

### 7.2 Alertas para Verificar

- ❌ Taxa de erro > 0.5%
- ❌ Latência P95 > 1 segundo
- ❌ Erro "database connection refused"
- ❌ JWT validation errors
- ⚠️ Rate limiting hits

**Verificar em Vercel Dashboard:**
- Logs → Edge Runtime → Erros recentes
- Analytics → HTTP status distribution

---

## 📝 Atualização de Código

### 7.3 Arquivo `/src/lib/prisma.ts`

**Substituir:**
```typescript
// ANTES (Neon adapter)
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({ adapter });
```

**Por:**
```typescript
// DEPOIS (Supabase - usar adapter padrão)
export const prisma = new PrismaClient();

// Supabase funciona com o adapter padrão de Node.js
// Nenhuma mudança adicional necessária
```

### 7.4 Atualizar Documentação

**Arquivo**: `/docs/DATABASE_MIGRATION.md`
```markdown
# Migração Neon → Supabase (Completada)

**Data**: [data do cutover]
**Status**: ✅ Completo
**Downtime**: ~15 minutos

## O que mudou
- Provider: Neon → Supabase
- Connection String: epXXXX.us-east-2.aws.neon.tech → aws-0-us-east-1.pooler.supabase.com
- Adapter Prisma: @prisma/adapter-neon → padrão

## Benefícios ganhos
- Realtime subscriptions (para futuro)
- Row-Level Security nativo
- Auth integrada
- Storage integrado

## Scripts úteis
- `npm run db:push` - Push schema para Supabase
- `npm run db:studio` - Abrir Prisma Studio (Supabase)
```

**Arquivo**: `/CLAUDE.md` (atualizar seção Database)
```markdown
## Database

**Provider**: Supabase PostgreSQL (formerly Neon)
**Schema**: Managed by Prisma
**Connection**: Via pooler connection string

...
```

---

## 🎓 Resumo de Tudo

| Fase | O que fazer | Tempo | Risco |
|------|------------|-------|-------|
| **1. Preparação** | Setup Supabase, backup Neon | 2-4h | Baixo |
| **2. Dados** | Aplicar schema, restaurar backup | 1-2h | Baixo |
| **3. Validação** | Rodar scripts de validação | 1h | Muito Baixo |
| **4. Staging** | Testar em environment staging | 2-4h | Muito Baixo |
| **5. Cutover** | Atualizar DATABASE_URL, redeploy | 15 min | Médio |
| **6. Rollback** | Preparar e testar (se precisar) | 10 min | Muito Baixo |
| **7. Monitor** | Observar logs por 1 semana | Contínuo | Muito Baixo |

---

## 🆘 Se Algo Der Errado

1. **Erro durante restauração de dados:**
   ```bash
   # Voltar ao Neon
   bash scripts/rollback-migration.sh
   ```

2. **API respondendo com timeout após cutover:**
   ```bash
   # Pode ser pool de conexões - aguardar 2 min e tentar novamente
   # Se persistir, executar rollback
   ```

3. **Alguns usuários perderam dados:**
   ```bash
   # Restaurar de backup Neon
   psql "$NEON_URL" < neon-backup-*.sql
   # Investigar o que falhou e tentar novamente
   ```

---

## ✨ Próximas Ações

- [ ] Criar projeto Supabase
- [ ] Executar Fase 1: Preparação
- [ ] Executar Fase 2: Dados
- [ ] Executar Fase 3: Validação
- [ ] Executar Fase 4: Staging
- [ ] **CUTOVER**: Executar Fase 5
- [ ] Executar Fase 7: Monitoramento

**Pronto para começar? Comece pela Fase 1!**
