# Checklist de Testes Manuais - Sistema de Autenticação MVP

**Fase 7: Testes e Validação**
**Última atualização:** 2026-01-31

---

## Pré-requisitos

Antes de iniciar os testes, certifique-se de:

1. [ ] Servidor de desenvolvimento rodando (`npm run dev`)
2. [ ] Banco de dados conectado e migrado (`npm run db:push`)
3. [ ] Variáveis de ambiente configuradas (`.env`)
4. [ ] Console do navegador aberto (F12) para ver logs

---

## 1. Testes de Cadastro

### 1.1 Cadastro com Dados Válidos
- [ ] **Ação:** Acessar `/cadastro`, preencher nome, email e senha válida
- [ ] **Esperado:** Conta criada, redirecionado para login, toast de sucesso
- [ ] **Verificar no banco:** Usuário criado com `password` hash (não texto plano)

### 1.2 Cadastro com E-mail Duplicado
- [ ] **Ação:** Tentar cadastrar com email já existente
- [ ] **Esperado:** Erro "Este e-mail já está cadastrado"
- [ ] **Verificar:** Não cria usuário duplicado

### 1.3 Cadastro com Senha Fraca
Testar cada caso:
- [ ] **Senha curta (< 8 caracteres):** Deve mostrar erro de validação
- [ ] **Sem maiúscula:** Deve mostrar erro "Deve conter letra maiúscula"
- [ ] **Sem minúscula:** Deve mostrar erro "Deve conter letra minúscula"
- [ ] **Sem número:** Deve mostrar erro "Deve conter número"
- [ ] **Sem especial:** Deve mostrar erro "Deve conter caractere especial"

### 1.4 Indicador de Força da Senha
- [ ] **Ação:** Digitar senha progressivamente no campo de cadastro
- [ ] **Verificar:** Barra de força atualiza em tempo real
- [ ] **Verificar:** Labels corretos (Muito fraca → Fraca → Regular → Boa → Forte)

---

## 2. Testes de Login

### 2.1 Login com Credenciais Válidas
- [ ] **Ação:** Login com email e senha corretos
- [ ] **Esperado:** Redirecionado para dashboard/home, sessão criada
- [ ] **Verificar:** Nome do usuário visível no header/perfil

### 2.2 Login com Credenciais Inválidas
- [ ] **E-mail inexistente:** Erro "Credenciais inválidas" (genérico)
- [ ] **Senha incorreta:** Erro "Credenciais inválidas" (genérico)
- [ ] **Verificar:** Mensagem NÃO revela se email existe ou não

### 2.3 Login após Múltiplas Tentativas Falhas
- [ ] **Ação:** Errar senha 5 vezes seguidas
- [ ] **Esperado:** Conta bloqueada, mensagem com tempo restante
- [ ] **Verificar no banco:** `lockedUntil` preenchido, `loginAttempts = 5`
- [ ] **Após 15 minutos:** Conta desbloqueia automaticamente

### 2.4 Login com Usuário Inativo
- [ ] **Pré-requisito:** Setar `isActive = false` no banco para um usuário
- [ ] **Ação:** Tentar login com esse usuário
- [ ] **Esperado:** Erro genérico, login negado

### 2.5 Login OAuth (Google)
- [ ] **Ação:** Clicar em "Entrar com Google"
- [ ] **Esperado:** Redirecionado para Google, após autenticação volta logado
- [ ] **Verificar:** Não conflita com usuários credentials

---

## 3. Testes de Recuperação de Senha

### 3.1 Esqueci Senha - E-mail Existente
- [ ] **Ação:** Acessar `/esqueci-senha`, digitar email cadastrado
- [ ] **Esperado:** Mensagem genérica "Se o e-mail existir..."
- [ ] **Verificar no banco:** `passwordResetToken` e `passwordResetExpires` preenchidos
- [ ] **Verificar no console/email:** Token enviado (ou logado em dev)

### 3.2 Esqueci Senha - E-mail Inexistente
- [ ] **Ação:** Digitar email não cadastrado
- [ ] **Esperado:** MESMA mensagem genérica (não revela se existe)
- [ ] **Verificar:** Nenhum token gerado no banco

### 3.3 Esqueci Senha - Usuário OAuth-only
- [ ] **Ação:** Digitar email de usuário que só tem conta Google
- [ ] **Esperado:** Mensagem genérica (não revela que é OAuth)

---

## 4. Testes de Redefinição de Senha

### 4.1 Redefinir com Token Válido
- [ ] **Pré-requisito:** Ter um token válido (via esqueci-senha ou banco)
- [ ] **Ação:** Acessar `/redefinir-senha/[token]`, digitar nova senha
- [ ] **Esperado:** Senha alterada, redirecionado para login
- [ ] **Verificar no banco:** Nova senha hash, token limpo

### 4.2 Redefinir com Token Expirado
- [ ] **Pré-requisito:** Setar `passwordResetExpires` para data passada
- [ ] **Ação:** Tentar usar o token
- [ ] **Esperado:** Erro "Link de recuperação expirado"

### 4.3 Redefinir com Token Inválido
- [ ] **Ação:** Acessar `/redefinir-senha/token-falso-123`
- [ ] **Esperado:** Erro "Link de recuperação inválido ou expirado"

### 4.4 Reutilizar Token
- [ ] **Ação:** Usar mesmo token duas vezes
- [ ] **Esperado:** Segunda tentativa falha (token já foi limpo)

---

## 5. Testes de Alteração de Senha

### 5.1 Alterar com Senha Atual Correta
- [ ] **Pré-requisito:** Estar logado com conta de credenciais
- [ ] **Ação:** Acessar `/perfil/alterar-senha`, digitar senha atual e nova
- [ ] **Esperado:** Senha alterada, toast de sucesso

### 5.2 Alterar com Senha Atual Incorreta
- [ ] **Ação:** Digitar senha atual errada
- [ ] **Esperado:** Erro "Senha atual incorreta"

### 5.3 Nova Senha Igual à Atual
- [ ] **Ação:** Digitar mesma senha nos campos atual e nova
- [ ] **Esperado:** Erro "A nova senha deve ser diferente da atual"

### 5.4 Usuário OAuth-only Tentando Alterar
- [ ] **Pré-requisito:** Logar com conta Google (sem senha)
- [ ] **Ação:** Tentar acessar alteração de senha
- [ ] **Esperado:** Mensagem informando que conta é social

---

## 6. Testes de Proteção de Rotas

### 6.1 Acesso a /perfil/* Sem Login
- [ ] **Ação:** Sem estar logado, acessar `/perfil/alterar-senha`
- [ ] **Esperado:** Redirecionado para `/login?callbackUrl=...`

### 6.2 Retorno após Login (callbackUrl)
- [ ] **Ação:** Tentar acessar rota protegida, fazer login
- [ ] **Esperado:** Após login, retorna para a rota original

---

## 7. Verificações de Segurança

### 7.1 Hash de Senhas no Banco
```sql
SELECT id, email, password FROM "User" WHERE password IS NOT NULL LIMIT 5;
```
- [ ] **Verificar:** Senha inicia com `$2a$12$` ou `$2b$12$`
- [ ] **Verificar:** Nenhuma senha em texto plano

### 7.2 Tokens de Recuperação
```sql
SELECT email, "passwordResetToken", "passwordResetExpires"
FROM "User" WHERE "passwordResetToken" IS NOT NULL;
```
- [ ] **Verificar:** Token tem 64 caracteres hex
- [ ] **Verificar:** Expiração é ~1 hora após criação

### 7.3 Bloqueio por Tentativas
```sql
SELECT email, "loginAttempts", "lockedUntil"
FROM "User" WHERE "loginAttempts" > 0;
```
- [ ] **Verificar:** Contador incrementa corretamente
- [ ] **Verificar:** `lockedUntil` setado após 5 tentativas

### 7.4 Mensagens Genéricas nos Logs
- [ ] **Verificar:** Logs não expõem se email existe
- [ ] **Verificar:** Logs não mostram senhas (nem em erro)

---

## 8. Testes de UX/Feedback

### 8.1 Loading States
- [ ] **Verificar:** Botões mostram "Entrando..." durante login
- [ ] **Verificar:** Botões desabilitados durante submit
- [ ] **Verificar:** Cursor de loading aparece

### 8.2 Toast Notifications
- [ ] **Sucesso:** Toast verde com mensagem de sucesso
- [ ] **Erro:** Toast vermelho/destrutivo com mensagem de erro
- [ ] **Posição:** Toasts aparecem no canto correto

### 8.3 Validação em Tempo Real
- [ ] **Verificar:** Erros aparecem ao sair do campo (onBlur)
- [ ] **Verificar:** Indicador de força atualiza ao digitar

---

## Resumo dos Resultados

| Categoria | Passou | Falhou | Pendente |
|-----------|--------|--------|----------|
| Cadastro | | | |
| Login | | | |
| Recuperação | | | |
| Redefinição | | | |
| Alteração | | | |
| Proteção de Rotas | | | |
| Segurança | | | |
| UX/Feedback | | | |

**Total:** ___/___

**Testador:** _______________
**Data:** _______________

---

## Notas e Observações

_Registre aqui qualquer bug encontrado ou comportamento inesperado:_

1.
2.
3.
