# Migration Day Checklist: Neon → Supabase

Checklist detalhado para o dia da migração. Imprima ou mantenha aberto em segundo monitor.

---

## 📅 Data da Migração: _______________

**Responsável**: ________________________

**Hora de Início**: _______________

**Hora de Término Esperada**: _______________

---

## 🔴 FASE 0: Dia Anterior (Preparação Final)

Execute no dia anterior para estar 100% pronto.

### Checklist Dia Anterior

- [ ] **Backup**: Fazer último backup do Neon
  ```bash
  DATABASE_URL="$NEON_URL" bash scripts/backup-neon.sh
  ```
  - [ ] Arquivo criado: `neon-backup-YYYYMMDD.sql.gz`
  - [ ] Tamanho > 0 bytes
  - [ ] Integridade verificada (`gzip -t`)
  - [ ] Cópia em local seguro criada

- [ ] **Supabase**: Projeto criado e pronto
  - [ ] Projeto criado em https://app.supabase.com
  - [ ] Region: us-east-1
  - [ ] Connection string copiada
  - [ ] Password anotada em lugar seguro

- [ ] **Schema**: Aplicado com sucesso
  ```bash
  DATABASE_URL="$SUPABASE_URL" npx prisma db push --skip-generate
  ```
  - [ ] Todas as 9 tabelas criadas
  - [ ] Índices criados
  - [ ] Foreign keys criadas

- [ ] **Scripts**: Todos prontos
  - [ ] `/scripts/backup-neon.sh` - 100% OK
  - [ ] `/scripts/validate-migration.js` - 100% OK
  - [ ] `/scripts/execute-cutover.sh` - Revisado
  - [ ] `/scripts/rollback-migration.sh` - Revisado e testado
  - [ ] Environment vars preparadas em `.env.migration`

- [ ] **Staging**: Validado com Supabase
  - [ ] Deploy em staging com DATABASE_URL=Supabase ✅
  - [ ] Saúde da aplicação: OK (HTTP 200)
  - [ ] Logs sem errors críticos

- [ ] **Comunicação**: Avisos enviados
  - [ ] Equipe de dev notificada
  - [ ] PMs avisados sobre janela de migração
  - [ ] Usuários informados (se aplicável)

- [ ] **Rollback**: Plano testado
  - [ ] Script rollback executado (em staging)
  - [ ] Revert DATABASE_URL funciona
  - [ ] Redeploy para Neon funciona

---

## 🟡 FASE 1: Hora H (Cutover Execution)

**Tempo: 15 minutos**

### Timeline

| Hora | Ação | Responsável | ✓ |
|------|------|-------------|---|
| T+0:00 | Notificar equipe - Iniciando migração | Dev | [ ] |
| T+0:30 | Validação final (scripts) | Dev | [ ] |
| T+1:00 | Executar cutover | DevOps | [ ] |
| T+2:00 | Health check | DevOps | [ ] |
| T+3:00 | Verificar logs | Dev | [ ] |
| T+5:00 | Comunicado de status | Dev | [ ] |
| T+15:00 | Monitoramento ativo | Dev | [ ] |

### Checklist Execução

#### T-5min (Validação Final)

- [ ] Ninguém está desenvolvendo
- [ ] Última validação de dados:
  ```bash
  DATABASE_URL_NEON="$NEON_URL" \
  DATABASE_URL_SUPABASE="$SUPABASE_URL" \
  node scripts/validate-migration.js
  ```
  - [ ] Todos os registros combinam ✅
  - [ ] Integridade OK ✅
  - [ ] Sem aviso de mismatches ✅

- [ ] Vercel logado e funcionando
  ```bash
  vercel --version
  vercel whoami
  ```

- [ ] Backup seguro em 2 locais
  - [ ] Local 1: `~/backups/neon-backup-*.sql.gz`
  - [ ] Local 2: Google Drive / Dropbox / AWS S3

#### T+0:00 (GO/NO-GO)

- [ ] **GO Decision**: Proceder?
  - [ ] Sim, todos os checks passaram
  - [ ] NÃO, investigar e agendar nova data

**Se NÃO-GO**:
```
1. Manter Neon como está
2. Investigar o que falhou
3. Agendar nova data
4. Descartar Supabase (ou manter para re-tentar)
```

**Se GO**: Prosseguir ↓

#### T+0:30 (Executar Cutover)

```bash
# Terminal 1: Executar cutover
SUPABASE_DATABASE_URL="$DATABASE_URL_SUPABASE" \
bash scripts/execute-cutover.sh

# Este script vai:
# 1. Pedir confirmação (READ INPUT)
# 2. Remover DATABASE_URL old
# 3. Adicionar DATABASE_URL Supabase
# 4. Fazer vercel deploy --prod
# 5. Aguardar 120 segundos
# 6. Health check
# 7. Gerar log
```

**Durante o script:**
- [ ] Ler mensagens com atenção
- [ ] Confirmar quando solicitado
- [ ] Não interromper mesmo se parecer lento
- [ ] Monitorar outro terminal para logs

#### T+2:00 (Health Check)

```bash
# Terminal 2: Monitorar logs realtime
vercel logs --follow

# Procurar por:
✅ Sem "connection refused"
✅ Sem "ECONNREFUSED"
✅ Sem "password authentication failed"
✅ Sem "[ERROR] in /api/*"
```

- [ ] Logs verificados
- [ ] Nenhum erro crítico

#### T+3:00 (Verificação de Aplicação)

```bash
# Terminal 3: Testar aplicação
curl https://seu-projeto.vercel.app/api/health -v

# Esperado:
# < HTTP/2 200
# Ou 401 (se endpoint protegido), mas não erro de DB
```

- [ ] API respondendo
- [ ] Status HTTP 200 ou 401 (não 500)

#### T+5:00 (Teste Manual)

Se aplicação tem UI e usuários teste:

- [ ] Acessar https://seu-projeto.vercel.app
- [ ] Página carrega sem erro
- [ ] Tentar login com credenciais teste
- [ ] Se logou, funcionalidades principais carregam

#### T+15:00 (Comunicado)

```markdown
✅ Migração Neon → Supabase Completa

- Database: Migrado com sucesso
- Dados: 100% intacto
- Aplicação: Online e respondendo
- Tempo total: 15 minutos
- Downtime: 0 minutos (redeploy)

Monitorando continuamente pelos próximos 48h.
```

- [ ] Comunicado enviado ao time

---

## 🟢 FASE 2: Pós-Cutover (Primeiras 30 minutos)

### Monitoramento Intensivo

- [ ] **Logs** (a cada 5 min)
  ```bash
  vercel logs --limit=50
  ```
  - [ ] Taxa de erro < 0.1%
  - [ ] Sem "database" errors

- [ ] **Health endpoints** (a cada 5 min)
  ```bash
  for i in {1..6}; do
    curl -s https://seu-projeto.vercel.app/api/health
    sleep 30
  done
  ```

- [ ] **Vercel Metrics** (no dashboard)
  - [ ] Function Duration: < 3s
  - [ ] Status 2xx: > 95%
  - [ ] Status 5xx: < 0.1%

### Se Tudo OK ✅

- [ ] Continuar monitoramento por próximas 24h
- [ ] Manter Neon como backup por 48h
- [ ] Ir para FASE 3

### Se Houver Erro ❌

**Passo 1: Diagnosticar**
```bash
# Ver logs detalhados
vercel logs --limit=200

# Procurar por: "database", "connection", "authentication"
```

**Passo 2: Opções**

a) **Se erro parece transitório** (timeout, connection spike):
```bash
# Aguardar 2 minutos e testar novamente
sleep 120
curl https://seu-projeto.vercel.app/api/health
```

b) **Se erro persiste** (connection refused, auth failed):
```bash
# Executar rollback
NEON_DATABASE_URL="$DATABASE_URL_NEON" \
bash scripts/rollback-migration.sh

# Vai pedir confirmação dupla
# Depois revert para Neon
```

c) **Se rollback também falha** (EMERGÊNCIA):
```bash
# Contato imediato com suporte Vercel
# URL: https://vercel.com/support

# Mencionar:
# - "Database migration failed"
# - "Neon → Supabase"
# - Incluir logs detalhados
```

---

## 🔵 FASE 3: Próximas 24-48 Horas

### Monitoramento Contínuo

- [ ] **A cada 6 horas**: Verificar logs
  ```bash
  vercel logs --since=6h
  ```

- [ ] **A cada 12 horas**: Testar funcionalidades críticas
  - [ ] Login
  - [ ] Fetch de dados
  - [ ] Atualizar dados
  - [ ] Logout

- [ ] **Analisar performance**
  - [ ] P95 latência < 500ms?
  - [ ] Error rate < 0.5%?

### Após 48h (Se Tudo OK)

- [ ] Documentar sucesso
  ```bash
  echo "✅ Migração Neon→Supabase: Sucesso em $(date)" >> MIGRATION_HISTORY.md
  ```

- [ ] Limpeza
  - [ ] Deletar ou arquivar backup local
  - [ ] Manter cópia em Google Drive por 7 dias
  - [ ] Opcionalmente: desativar integração Neon em Vercel

- [ ] Documentação
  - [ ] Atualizar `CLAUDE.md` (database section)
  - [ ] Atualizar `docs/DATABASE_MIGRATION.md`
  - [ ] Commit mudanças:
    ```bash
    git add CLAUDE.md docs/
    git commit -m "docs: update database documentation post-migration"
    git push origin claude/neon-to-supabase-migration-W2shH
    ```

---

## 🚨 Emergency Contacts

Se algo der muito errado:

| Serviço | Contato | Prioridade |
|---------|---------|-----------|
| **Vercel** | https://vercel.com/support | P1 |
| **Supabase** | https://supabase.com/support | P2 |
| **GitHub** | Issues (internal) | P3 |

**E-mail de escalation** (se tiver):
- Suporte Vercel: support@vercel.com
- Suporte Supabase: support@supabase.com

---

## 📝 Notas e Observações

**Espaço para anotações durante a migração:**

```
T+00:00 - Ação: ___________________
Obs: ___________________________

T+00:30 - Ação: ___________________
Obs: ___________________________

T+01:00 - Ação: ___________________
Obs: ___________________________

T+02:00 - Ação: ___________________
Obs: ___________________________

T+03:00 - Ação: ___________________
Obs: ___________________________

T+05:00 - Ação: ___________________
Obs: ___________________________
```

---

## ✅ Sign-off Final

**Migração concluída com sucesso?**

- [ ] **SIM** - Assinar abaixo
- [ ] **NÃO** - Executar rollback e agendar nova data

**Responsável**: ________________________
**Data/Hora**: ________________________
**Assinatura**: ________________________

**Próximo passo**: Monitoramento por 48h

---

## 📚 Referências Rápidas

- Plano detalhado: `/MIGRATION_PLAN.md`
- Quick start: `/docs/MIGRATION_QUICK_START.md`
- Scripts:
  - Backup: `/scripts/backup-neon.sh`
  - Validar: `/scripts/validate-migration.js`
  - Cutover: `/scripts/execute-cutover.sh`
  - Rollback: `/scripts/rollback-migration.sh`

---

**Boa sorte! 🚀**
