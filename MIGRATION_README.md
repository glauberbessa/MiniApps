# 🚀 Migração Neon → Supabase

Bem-vindo ao guia de migração do banco de dados de **Neon** para **Supabase**.

Este diretório contém **planos detalhados**, **scripts prontos para usar** e **documentação operacional** para uma migração segura e controlada.

---

## 📂 Arquitetura de Documentação

```
MiniApps/
├── MIGRATION_SUMMARY.md          ⭐ Comece aqui (resumo executivo)
├── MIGRATION_PLAN.md              ⭐ Guia técnico completo (10 seções)
├── MIGRATION_README.md            ← Você está aqui
│
├── docs/
│   ├── MIGRATION_QUICK_START.md   📋 Passo-a-passo (15 passos numerados)
│   └── MIGRATION_DAY_CHECKLIST.md 🎯 Checklist operacional (dia da migração)
│
└── scripts/
    ├── backup-neon.sh            💾 Fazer backup completo
    ├── validate-migration.js      ✅ Validar dados (Neon vs Supabase)
    ├── execute-cutover.sh         🚀 Executar migração
    └── rollback-migration.sh      🔙 Voltar para Neon se erro
```

---

## 🎯 Aonde Começar?

### Para Gerentes/PMs
👉 **Leia**: `/MIGRATION_SUMMARY.md`
- Tempo total: 10 minutos
- Covers: Timeline, riscos, custo/benefício
- Inclui: Checklist de aprovação

### Para Desenvolvedores
👉 **Leia**: `/docs/MIGRATION_QUICK_START.md`
- Tempo total: 30 minutos
- Covers: 15 passos step-by-step com comandos prontos
- Inclui: Troubleshooting

### Para DevOps/Operações
👉 **Leia**: `/docs/MIGRATION_DAY_CHECKLIST.md`
- Tempo total: 2 horas (no dia da migração)
- Covers: Timeline T+0 a T+48h com go/no-go decisions
- Inclui: Emergency contacts

### Para Compreender Completamente
👉 **Leia**: `/MIGRATION_PLAN.md`
- Tempo total: 1 hora
- Covers: 10 seções técnicas detalhadas
- Inclui: Arquitetura, dados, desafios, estratégia completa

---

## ⚡ Quick Start (TL;DR)

Se você sabe o que está fazendo, aqui está a versão ultracurta:

```bash
# 1. Preparação
export DATABASE_URL_NEON="postgresql://..."
export DATABASE_URL_SUPABASE="postgresql://..."
DATABASE_URL="$DATABASE_URL_NEON" bash scripts/backup-neon.sh

# 2. Setup Supabase
# Ir a https://app.supabase.com e criar projeto (region: us-east-1)

# 3. Aplicar schema e restaurar dados
DATABASE_URL="$DATABASE_URL_SUPABASE" npx prisma db push --skip-generate
psql "$DATABASE_URL_SUPABASE" < neon-backup-*.sql

# 4. Validar
DATABASE_URL_NEON="$DATABASE_URL_NEON" \
DATABASE_URL_SUPABASE="$DATABASE_URL_SUPABASE" \
node scripts/validate-migration.js

# 5. Staging (deploy com Supabase URL)
vercel env add DATABASE_URL staging <<< "$DATABASE_URL_SUPABASE"
vercel deploy

# 6. Cutover (15 min)
SUPABASE_DATABASE_URL="$DATABASE_URL_SUPABASE" bash scripts/execute-cutover.sh

# 7. Monitor (24-48h)
vercel logs --follow
```

---

## 📚 Documentos Detalhados

### 1. MIGRATION_SUMMARY.md (Executivo)

**Para**: Stakeholders, aprovações
**Tempo**: 10 min
**Cobre**:
- Objetivo e motivação
- Timeline (2-3 dias)
- Riscos e mitigações
- Custo/benefício
- Checklist de Go/No-Go

**Exemplo de seção**:
```
🎯 Objetivo: Migrar PostgreSQL de Neon para Supabase
⏱️  Timeline: 2-3 dias (16h de trabalho)
🎲 Risco: BAIXO (backup + validação + rollback)
💰 Benefício: Funcionalidades futuras (realtime, RLS)
```

---

### 2. MIGRATION_PLAN.md (Técnico Completo)

**Para**: Arquitetos, tech leads
**Tempo**: 1 hora
**Cobre**: 10 seções
- Contexto e motivação
- Dados atuais (9 tabelas, schema)
- Desafios críticos e técnicos
- Estratégia de migração (5 fases)
- Arquivos a modificar
- Verificação e testes
- Cronograma estimado
- Referências

**Exemplo de seção**:
```
## 3. DESAFIOS E RISCOS

### Riscos Críticos 🔴
1. Downtime vs Migração Zero-Downtime
   - Estratégia escolhida: Downtime planejado (15 min)

2. Perda de Tokens OAuth
   - Mitigation: Backup + validação de integridade
```

---

### 3. MIGRATION_QUICK_START.md (Passo-a-Passo)

**Para**: Desenvolvedores que vão executar
**Tempo**: 30 min
**Cobre**: 15 passos numerados com comandos prontos
- PRÉ-MIGRAÇÃO (3 passos)
- SETUP SUPABASE (3 passos)
- VALIDAÇÃO (2 passos)
- TESTE STAGING (2 passos)
- CUTOVER (2 passos)
- MONITORAMENTO (3 passos)

**Exemplo de passo**:
```bash
# Passo 4️⃣: Criar Projeto Supabase
1. Ir a https://app.supabase.com
2. Criar novo projeto
   - Nome: MiniApps-Prod
   - Região: us-east-1
   - Password: Gerar + salvar

# Passo 5️⃣: Aplicar Schema
npx prisma db push --skip-generate
```

---

### 4. MIGRATION_DAY_CHECKLIST.md (Operacional)

**Para**: DevOps/Operações (no dia da migração)
**Tempo**: 2 horas (no dia)
**Cobre**: Timeline T-5min até T+48h
- Checklist dia anterior
- Timeline executiva (Fase 0-2)
- Go/No-Go decision points
- Monitoramento contínuo
- Rollback procedures
- Sign-off

**Exemplo de timeline**:
```
| Hora | Ação | Responsável | ✓ |
|------|------|-------------|---|
| T+0:00 | Notificar equipe | Dev | [ ] |
| T+0:30 | Validação final | Dev | [ ] |
| T+1:00 | Executar cutover | DevOps | [ ] |
| T+2:00 | Health check | DevOps | [ ] |
| T+3:00 | Verificar logs | Dev | [ ] |
```

---

## 🔧 Scripts Prontos

Todos os scripts estão em `/scripts/` prontos para usar:

### 1. backup-neon.sh
```bash
# Fazer backup completo do Neon
DATABASE_URL="postgresql://..." bash scripts/backup-neon.sh

# Cria: neon-backup-YYYYMMDD-HHMMSS.sql.gz
```

**O que faz**:
- Conecta ao Neon
- Faz dump completo (com compressão)
- Valida integridade
- Conta tabelas e objetos

---

### 2. validate-migration.js
```bash
# Comparar Neon vs Supabase
DATABASE_URL_NEON="postgresql://..." \
DATABASE_URL_SUPABASE="postgresql://..." \
node scripts/validate-migration.js

# Cria: validação de contagem + integridade
```

**O que faz**:
- Conta registros em ambos bancos
- Compara contagem (deve ser igual)
- Valida dados críticos:
  - Senhas bcrypt (60 chars)
  - Tokens OAuth
  - Sessões ativas
  - Emails válidos

---

### 3. execute-cutover.sh
```bash
# Executar cutover automático
SUPABASE_DATABASE_URL="postgresql://..." bash scripts/execute-cutover.sh

# Faz: Atualiza DATABASE_URL, redeploy, health check
```

**O que faz**:
- Atualiza DATABASE_URL em Vercel
- Faz redeploy automático
- Aguarda 120 segundos
- Health check
- Gera log

**Tempo**: 5-10 minutos

---

### 4. rollback-migration.sh
```bash
# Voltar para Neon
NEON_DATABASE_URL="postgresql://..." bash scripts/rollback-migration.sh

# Faz: Revert DATABASE_URL, redeploy para Neon
```

**O que faz**:
- Remove DATABASE_URL atual
- Restaura Neon URL
- Redeploy para Neon
- Health check

**Tempo**: 5 minutos
**Use quando**: Algo deu errado após cutover

---

## 🎯 Quando Usar Cada Documento

```
Você está:                           Leia:
─────────────────────────────────────────────────────
Pedindo aprovação aos PMs            MIGRATION_SUMMARY.md
Planejando a estratégia              MIGRATION_PLAN.md
Na véspera da migração               MIGRATION_QUICK_START.md
No dia da migração                   MIGRATION_DAY_CHECKLIST.md
Debugando um erro                    docs/ + scripts/
Explicando para alguém novo          MIGRATION_README.md (este)
```

---

## ⚙️ Requisitos

### Ferramentas Necessárias

```bash
# Verificar se tem tudo:
command -v git          # Git
command -v psql         # PostgreSQL client
command -v pg_dump      # PostgreSQL dump
command -v vercel       # Vercel CLI
command -v npm          # Node.js
command -v node         # Node.js
```

**Instalar o que faltar:**
```bash
# macOS
brew install postgresql vercel

# Ubuntu/Debian
sudo apt-get install postgresql-client vercel

# Node.js (de https://nodejs.org)
```

### Acesso Necessário

- ✅ Acesso ao Neon (connection string)
- ✅ Acesso ao Supabase (criar projeto)
- ✅ Acesso ao Vercel (atualizar env vars)
- ✅ Acesso ao GitHub (push para branch)
- ✅ Acesso a backup local (~/backups/)

---

## 🚨 Avisos Importantes

### 🔴 NÃO Faça Isso

```bash
# ❌ NÃO deletar banco Neon antes de validar
# ❌ NÃO fazer cutover em horário de pico
# ❌ NÃO pular validação
# ❌ NÃO testar scripts em produção primeiro
# ❌ NÃO perder backup antes de 48h de sucesso
```

### 🟢 SEMPRE Faça Isso

```bash
# ✅ SEMPRE fazer backup antes de qualquer ação
# ✅ SEMPRE validar dados pós-cópia
# ✅ SEMPRE testar em staging primeiro
# ✅ SEMPRE ter rollback testado
# ✅ SEMPRE manter backup por 7+ dias
```

---

## 📊 Timeline Geral

```
Dia 1: Preparação (2-4 horas)
  ├─ Criar Supabase
  ├─ Fazer backup Neon
  ├─ Aplicar schema Supabase
  ├─ Restaurar dados
  └─ Validar integridade ✅

Dia 2: Testes (2-4 horas)
  ├─ Deploy em staging
  ├─ Testes manuais
  ├─ Testes de rollback
  └─ Go/No-Go decision ✅

Dia 3: Cutover (15 minutos)
  ├─ Executar migração
  ├─ Health checks
  └─ Monitoramento ✅

Dias 4-10: Monitoramento (48h-1 week)
  ├─ Logs contínuos
  ├─ Performance checks
  └─ Limpeza final ✅

Total: 2-3 dias
```

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**Q: Erro "connection refused" em Supabase**
```bash
→ Verificar connection string
→ Verificar password
→ Testar: psql "$DATABASE_URL" -c "SELECT 1"
```

**Q: Dados não combinam na validação**
```bash
→ Refazer dump + restore
→ Comparar manualmente com SQL queries
→ Investigar logs de restauração
```

**Q: Cutover não funciona**
```bash
→ Executar rollback para Neon
→ Investigar logs de erro
→ Corrigir problema e tentar novamente
```

**Q: Não tenho connection string do Neon**
```bash
→ Vercel → Project Settings → Integrations → PostgreSQL
→ Ou: git log -S 'neon.tech' -- '.env*'
→ Ou: Seu gerenciador de senhas
```

### Contatos

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## 📋 Próximas Ações

```
Agora:
[ ] Ler MIGRATION_SUMMARY.md
[ ] Responder perguntas
[ ] Aprovar plano

Semana que vem:
[ ] Agendar data de migração
[ ] Notificar team
[ ] Preparar backups

Dia da migração:
[ ] Ter MIGRATION_DAY_CHECKLIST.md aberto
[ ] Executar scripts
[ ] Monitorar logs

Pós-migração:
[ ] Verificar por 48h
[ ] Documentar aprendizados
[ ] Limpar backups
```

---

## 📝 Versão e Status

```
Versão: 1.0
Data: 2026-03-05
Status: ✅ PRONTO PARA EXECUÇÃO
Aprovado por: _________________
```

---

## 🎓 Aprendizados Posteriores

Depois que a migração for concluída, documente:

- [ ] O que funcionou bem
- [ ] O que foi mais desafiador
- [ ] Tempo real vs estimado
- [ ] Melhorias para próximas vezes

Crie um arquivo `/docs/MIGRATION_POSTMORTEM.md` com as aprendizagens.

---

**Última atualização**: 2026-03-05
**Mantido por**: [Seu nome/equipe]

---

## Índice Rápido

- 📋 [Resumo Executivo](MIGRATION_SUMMARY.md) - 10 min
- 📚 [Plano Detalhado](MIGRATION_PLAN.md) - 1 hora
- ⚡ [Quick Start](docs/MIGRATION_QUICK_START.md) - 30 min
- 🎯 [Day Checklist](docs/MIGRATION_DAY_CHECKLIST.md) - 2 horas
- 💾 [Backup Script](scripts/backup-neon.sh)
- ✅ [Validate Script](scripts/validate-migration.js)
- 🚀 [Cutover Script](scripts/execute-cutover.sh)
- 🔙 [Rollback Script](scripts/rollback-migration.sh)

---

**Pronto para começar? Leia [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) primeiro!** 🚀
