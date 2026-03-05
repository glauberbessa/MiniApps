# Quick Start: Migração Neon → Supabase

Guia rápido para executar a migração passo-a-passo.

## ⏱️ Tempo Total: ~2-3 horas

---

## 🔍 PRÉ-MIGRAÇÃO (30 min)

### 1️⃣ Coletar Connection Strings

```bash
# Neon (Atual)
# Encontrar em: Vercel Dashboard → Project Settings → Integrations → Postgres
export DATABASE_URL_NEON="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Supabase (Novo)
# Criar em: https://app.supabase.com
export DATABASE_URL_SUPABASE="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Guardar em arquivo seguro
cat > ~/.migration-urls.env << EOF
DATABASE_URL_NEON="$DATABASE_URL_NEON"
DATABASE_URL_SUPABASE="$DATABASE_URL_SUPABASE"
EOF
chmod 600 ~/.migration-urls.env
```

### 2️⃣ Fazer Backup Neon

```bash
# Exportar todos os dados do Neon
DATABASE_URL="$DATABASE_URL_NEON" bash scripts/backup-neon.sh

# Vai criar: neon-backup-YYYYMMDD-HHMMSS.sql.gz
# Guardar em local seguro!
cp neon-backup-*.sql.gz ~/backups/
```

### 3️⃣ Capturar Estatísticas Atuais

```bash
# Contar registros em cada tabela
psql "$DATABASE_URL_NEON" << 'SQL'
SELECT
  tablename,
  n_live_tup as row_count,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
SQL

# Salvar output para comparação pós-migração
# (você vai comparar com Supabase depois)
```

---

## 🗄️ SETUP SUPABASE (30 min)

### 4️⃣ Criar Projeto Supabase

1. Ir a https://app.supabase.com
2. Criar novo projeto
   - **Nome**: MiniApps-Prod (ou similar)
   - **Região**: us-east-1 (próxima ao Vercel)
   - **Database Password**: Gerar forte, salvar em lugar seguro
3. Aguardar ~2-3 min para provisionar
4. Ir a **Project Settings → Database**
5. Copiar connection string (pooler, port 6543)

### 5️⃣ Aplicar Schema em Supabase

```bash
# Usar a connection string de Supabase
export DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Aplicar schema Prisma
npx prisma generate
npx prisma db push --skip-generate

# Validar tabelas criadas
psql "$DATABASE_URL" -c "\dt+"
```

### 6️⃣ Restaurar Dados

```bash
# Descompactar backup
gunzip -c neon-backup-*.sql.gz > neon-backup.sql

# Restaurar em Supabase (leva ~1-2 min)
psql "$DATABASE_URL" < neon-backup.sql

# Monitorar (em outro terminal)
while true; do
  psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_users FROM \"User\""
  sleep 5
done
```

---

## ✅ VALIDAÇÃO (30 min)

### 7️⃣ Validar Dados Migrados

```bash
# Script compara Neon vs Supabase
DATABASE_URL_NEON="$DATABASE_URL_NEON" \
DATABASE_URL_SUPABASE="$DATABASE_URL_SUPABASE" \
node scripts/validate-migration.js

# Saída esperada:
# ✅ User: 50 registros (match)
# ✅ Account: 50 registros (match)
# ... (todas as tabelas devem ter match)
# ✅ VALIDAÇÃO COMPLETA E SUCESSO!
```

### 8️⃣ Se Validação Falhar

```bash
# Investigar qual tabela não combinou
# Opção A: Refazer dump + restore
gunzip -c neon-backup-*.sql.gz > neon-backup.sql
# Limpar Supabase (CUIDADO!)
psql "$DATABASE_URL_SUPABASE" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Restaurar schema + dados novamente
npx prisma db push --skip-generate
psql "$DATABASE_URL_SUPABASE" < neon-backup.sql

# Opção B: Restaurar seletivamente
psql "$DATABASE_URL_SUPABASE" << 'SQL'
TRUNCATE "User" CASCADE;
SQL
pg_restore -d "$DATABASE_URL_SUPABASE" -t "User" neon-backup.sql
```

---

## 🧪 TESTE EM STAGING (1 hora)

### 9️⃣ Configurar Staging em Vercel

```bash
# Adicionar DATABASE_URL em staging environment
vercel env add DATABASE_URL staging
# Paste: postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Deploy para staging
vercel deploy

# Testar
curl https://staging-seu-projeto.vercel.app/api/health
# Deve retornar 200
```

### 🔟 Testes Manuais em Staging

- [ ] Abrir https://staging-seu-projeto.vercel.app
- [ ] Tentar login (se tiver credenciais de teste)
- [ ] Tentar usar funcionalidades principais (playlists, etc)
- [ ] Verificar logs por erros de database

---

## 🚀 CUTOVER (15 min)

### 1️⃣1️⃣ Executar Cutover

```bash
# Fazer última validação
DATABASE_URL_NEON="$DATABASE_URL_NEON" \
DATABASE_URL_SUPABASE="$DATABASE_URL_SUPABASE" \
node scripts/validate-migration.js

# ✅ Se tudo OK, executar cutover
SUPABASE_DATABASE_URL="$DATABASE_URL_SUPABASE" \
bash scripts/execute-cutover.sh

# Script vai:
# 1. Pedir confirmação (read)
# 2. Remover DATABASE_URL old do Vercel
# 3. Adicionar novo DATABASE_URL (Supabase)
# 4. Fazer redeploy automático
# 5. Aguardar 2 min
# 6. Health check
```

### 1️⃣2️⃣ Se Algo der Errado - ROLLBACK

```bash
# Revert para Neon imediatamente
NEON_DATABASE_URL="$DATABASE_URL_NEON" \
bash scripts/rollback-migration.sh

# Script vai pedir confirmação dupla (segurança)
# Depois revert DATABASE_URL e redeploy
```

---

## 📊 MONITORAMENTO (1 semana)

### 1️⃣3️⃣ Verificar Logs

```bash
# Vercel Logs (realtime)
vercel logs

# Deve mostrar:
# ✅ Sem "connection refused" errors
# ✅ Sem "ECONNREFUSED" errors
# ✅ Latência < 500ms
```

### 1️⃣4️⃣ Verificar Métricas

```bash
# Acessar Vercel Analytics
# - HTTP Status: 99%+ 2xx/3xx
# - Serverless Function Duration: < 3s
# - Error Rate: < 0.1%
```

### 1️⃣5️⃣ Limpeza (Após 48h)

```bash
# Se tudo está OK depois de 48h:

# 1. Deletar backup
rm -f neon-backup-*.sql.gz
# (ou manter em ~/backups por mais tempo)

# 2. Opcionalmente: manter Neon como fallback ou deletar
# Ir a: Vercel → Project Settings → Integrations
# Remover integração Neon

# 3. Documentar conclusão
echo "✅ Migração concluída em $(date)" >> MIGRATION.log
```

---

## 🆘 Troubleshooting

### Erro: "connection refused"
```bash
# Verificar DATABASE_URL está correto
echo $DATABASE_URL_SUPABASE

# Testar conexão manualmente
psql "$DATABASE_URL_SUPABASE" -c "SELECT 1"

# Se falhar, verificar:
# - Firewall permite acesso
# - Password está correto
# - Banco existe
```

### Erro: "password authentication failed"
```bash
# Supabase password diferente de expected
# Ir a: Project Settings → Database → Password
# Copiar password correto
# Atualizar DATABASE_URL
```

### Erro: "relation already exists"
```bash
# Schema já foi criado, tentar restore vai dar erro
# Solução: deletar schema
psql "$DATABASE_URL_SUPABASE" << 'SQL'
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
SQL

# Depois aplicar schema + restaurar:
npx prisma db push --skip-generate
psql "$DATABASE_URL_SUPABASE" < neon-backup.sql
```

### Dados não combinam na validação
```bash
# Possível: restauração parcial
# Verificar log:
gunzip -c neon-backup-*.sql.gz | tail -100

# Se teve erro no final, tentar restaurar novamente
# (pg_dump pode ter sido interrompido)

# Backup pode estar corrompido?
gzip -t neon-backup-*.sql.gz
# Se falhar, refazer backup
```

---

## 📋 Checklist Final

Marque conforme avança:

- [ ] Backup Neon feito
- [ ] Supabase criado
- [ ] Schema aplicado em Supabase
- [ ] Dados restaurados
- [ ] Validação OK (contagem combina)
- [ ] Staging testado
- [ ] Tests manuais passaram
- [ ] Cutover executado
- [ ] Logs OK (sem erros)
- [ ] Aplicação funcionando
- [ ] Neon backup guardado (48h extra)
- [ ] Documentação atualizada

---

## 📞 Referências

- Arquivo detalhado: `/MIGRATION_PLAN.md`
- Schema: `/prisma/schema.prisma`
- Prisma setup: `/src/lib/prisma.ts`
- Scripts: `/scripts/backup-neon.sh`, `/scripts/validate-migration.js`, `/scripts/execute-cutover.sh`

---

**Pronto? Comece pelo Passo 1!** 🚀
