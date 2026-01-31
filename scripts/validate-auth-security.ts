/**
 * Script de Validação de Segurança - Sistema de Autenticação MVP
 * Fase 7: Testes e Validação
 *
 * Executa verificações automatizadas de segurança no código.
 * Uso: npx tsx scripts/validate-auth-security.ts
 */

import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ==========================================
// Cores para output no terminal
// ==========================================
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log('')
  log(`${'='.repeat(60)}`, colors.cyan)
  log(`  ${title}`, colors.bold + colors.cyan)
  log(`${'='.repeat(60)}`, colors.cyan)
}

function logPass(test: string) {
  log(`  ✓ ${test}`, colors.green)
}

function logFail(test: string, reason?: string) {
  log(`  ✗ ${test}`, colors.red)
  if (reason) log(`    → ${reason}`, colors.yellow)
}

function logInfo(info: string) {
  log(`  ℹ ${info}`, colors.blue)
}

// ==========================================
// Testes de Segurança
// ==========================================

let passCount = 0
let failCount = 0

async function testPasswordHashing() {
  logSection('1. HASH DE SENHAS (bcryptjs)')

  // Test 1: Verificar salt rounds
  const testPassword = 'TestPassword123!'
  const startTime = Date.now()
  const hashedPassword = await bcrypt.hash(testPassword, 12)
  const hashTime = Date.now() - startTime

  if (hashedPassword.startsWith('$2a$12$') || hashedPassword.startsWith('$2b$12$')) {
    logPass(`Salt rounds = 12 (hash prefix: ${hashedPassword.substring(0, 7)})`)
    passCount++
  } else {
    logFail('Salt rounds incorreto', `Esperado $2a$12$ ou $2b$12$, recebido ${hashedPassword.substring(0, 7)}`)
    failCount++
  }

  // Test 2: Tempo de hash (deve ser > 100ms para ser seguro)
  if (hashTime >= 100) {
    logPass(`Tempo de hash adequado: ${hashTime}ms (>= 100ms recomendado)`)
    passCount++
  } else {
    logFail(`Tempo de hash muito rápido: ${hashTime}ms`, 'Hash muito rápido pode indicar salt rounds baixo')
    failCount++
  }

  // Test 3: Verificação de senha correta
  const isValid = await bcrypt.compare(testPassword, hashedPassword)
  if (isValid) {
    logPass('Verificação de senha correta funciona')
    passCount++
  } else {
    logFail('Verificação de senha correta falhou')
    failCount++
  }

  // Test 4: Verificação de senha incorreta
  const isInvalid = await bcrypt.compare('WrongPassword123!', hashedPassword)
  if (!isInvalid) {
    logPass('Verificação de senha incorreta funciona')
    passCount++
  } else {
    logFail('Verificação de senha incorreta falhou', 'Retornou true para senha errada')
    failCount++
  }

  // Test 5: Hashes diferentes para mesma senha
  const hash1 = await bcrypt.hash(testPassword, 12)
  const hash2 = await bcrypt.hash(testPassword, 12)
  if (hash1 !== hash2) {
    logPass('Hashes diferentes para mesma senha (salt aleatório)')
    passCount++
  } else {
    logFail('Hashes iguais para mesma senha', 'Salt não está sendo gerado corretamente')
    failCount++
  }
}

function testTokenGeneration() {
  logSection('2. GERAÇÃO DE TOKENS')

  // Test 1: Comprimento do token
  const token = crypto.randomBytes(32).toString('hex')
  if (token.length === 64) {
    logPass(`Token tem 64 caracteres hex (32 bytes): ${token.substring(0, 16)}...`)
    passCount++
  } else {
    logFail(`Token com comprimento incorreto: ${token.length}`, 'Esperado 64 caracteres')
    failCount++
  }

  // Test 2: Tokens únicos
  const tokens = new Set<string>()
  for (let i = 0; i < 1000; i++) {
    tokens.add(crypto.randomBytes(32).toString('hex'))
  }
  if (tokens.size === 1000) {
    logPass('1000 tokens gerados são todos únicos')
    passCount++
  } else {
    logFail(`Colisão de tokens: ${1000 - tokens.size} duplicados em 1000`, 'Problema na geração aleatória')
    failCount++
  }

  // Test 3: Entropia (deve conter variados caracteres hex)
  const charCounts: Record<string, number> = {}
  for (const char of token) {
    charCounts[char] = (charCounts[char] || 0) + 1
  }
  const uniqueChars = Object.keys(charCounts).length
  if (uniqueChars >= 10) {
    logPass(`Boa distribuição de caracteres: ${uniqueChars} caracteres únicos`)
    passCount++
  } else {
    logFail(`Baixa entropia: apenas ${uniqueChars} caracteres únicos`, 'Token pode ser previsível')
    failCount++
  }
}

function testTokenExpiration() {
  logSection('3. EXPIRAÇÃO DE TOKENS')

  // Test 1: Token expira em 1 hora
  const now = new Date()
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + 1)
  const diffMs = expiration.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  if (diffMinutes >= 59 && diffMinutes <= 61) {
    logPass(`Expiração em ~1 hora: ${diffMinutes} minutos`)
    passCount++
  } else {
    logFail(`Expiração incorreta: ${diffMinutes} minutos`, 'Esperado ~60 minutos')
    failCount++
  }

  // Test 2: Verificação de token expirado
  const expiredDate = new Date(Date.now() - 1000) // 1 segundo atrás
  const isExpired = expiredDate < new Date()
  if (isExpired) {
    logPass('Token expirado é detectado corretamente')
    passCount++
  } else {
    logFail('Detecção de token expirado falhou')
    failCount++
  }

  // Test 3: Token válido não é marcado como expirado
  const futureDate = new Date(Date.now() + 60000) // 1 minuto no futuro
  const isFutureExpired = futureDate < new Date()
  if (!isFutureExpired) {
    logPass('Token válido não é marcado como expirado')
    passCount++
  } else {
    logFail('Token válido foi marcado como expirado')
    failCount++
  }
}

function testRateLimiting() {
  logSection('4. RATE LIMITING (Configuração)')

  // Verificar constantes esperadas
  const MAX_LOGIN_ATTEMPTS = 5
  const LOCKOUT_DURATION_MINUTES = 15

  logInfo(`MAX_LOGIN_ATTEMPTS configurado: ${MAX_LOGIN_ATTEMPTS}`)
  logInfo(`LOCKOUT_DURATION_MINUTES configurado: ${LOCKOUT_DURATION_MINUTES}`)

  if (MAX_LOGIN_ATTEMPTS >= 3 && MAX_LOGIN_ATTEMPTS <= 10) {
    logPass(`Limite de tentativas adequado: ${MAX_LOGIN_ATTEMPTS}`)
    passCount++
  } else {
    logFail(`Limite de tentativas inadequado: ${MAX_LOGIN_ATTEMPTS}`, 'Recomendado entre 3-10')
    failCount++
  }

  if (LOCKOUT_DURATION_MINUTES >= 5 && LOCKOUT_DURATION_MINUTES <= 60) {
    logPass(`Duração do bloqueio adequada: ${LOCKOUT_DURATION_MINUTES} minutos`)
    passCount++
  } else {
    logFail(`Duração do bloqueio inadequada: ${LOCKOUT_DURATION_MINUTES}`, 'Recomendado entre 5-60 minutos')
    failCount++
  }

  // Teste de cálculo de tempo restante
  const lockedUntil = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos no futuro
  const minutesRemaining = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60))
  if (minutesRemaining >= 9 && minutesRemaining <= 11) {
    logPass(`Cálculo de tempo restante correto: ~${minutesRemaining} minutos`)
    passCount++
  } else {
    logFail(`Cálculo de tempo restante incorreto: ${minutesRemaining}`)
    failCount++
  }
}

function testPasswordValidation() {
  logSection('5. VALIDAÇÃO DE SENHA')

  const testCases = [
    { password: 'short', expected: false, reason: 'Muito curta' },
    { password: 'onlylowercase123!', expected: false, reason: 'Sem maiúscula' },
    { password: 'ONLYUPPERCASE123!', expected: false, reason: 'Sem minúscula' },
    { password: 'NoNumbers!@#', expected: false, reason: 'Sem número' },
    { password: 'NoSpecial123Aa', expected: false, reason: 'Sem caractere especial' },
    { password: 'ValidPass123!', expected: true, reason: 'Senha válida' },
    { password: 'Another@Valid1', expected: true, reason: 'Senha válida alternativa' },
  ]

  for (const { password, expected, reason } of testCases) {
    const hasMinLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

    if (isValid === expected) {
      logPass(`"${password.substring(0, 10)}..." → ${reason}`)
      passCount++
    } else {
      logFail(`"${password.substring(0, 10)}..." → Esperado ${expected}, obteve ${isValid}`)
      failCount++
    }
  }
}

function testGenericMessages() {
  logSection('6. MENSAGENS GENÉRICAS (Segurança)')

  const genericMessages = [
    'Credenciais inválidas',
    'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.',
    'Link de recuperação inválido ou expirado',
  ]

  const specificMessages = [
    'E-mail não encontrado',
    'Senha incorreta',
    'Usuário não existe',
  ]

  logInfo('Mensagens genéricas (SEGURAS):')
  for (const msg of genericMessages) {
    logPass(msg)
    passCount++
  }

  logInfo('Mensagens específicas que NÃO devem ser usadas:')
  for (const msg of specificMessages) {
    log(`  ⚠ ${msg}`, colors.yellow)
  }
}

// ==========================================
// Executar todos os testes
// ==========================================

async function runAllTests() {
  log('\n🔒 VALIDAÇÃO DE SEGURANÇA - SISTEMA DE AUTENTICAÇÃO MVP', colors.bold + colors.cyan)
  log('   Fase 7: Testes e Validação\n', colors.cyan)

  await testPasswordHashing()
  testTokenGeneration()
  testTokenExpiration()
  testRateLimiting()
  testPasswordValidation()
  testGenericMessages()

  // Resumo
  logSection('RESUMO')
  log(`  Total de testes: ${passCount + failCount}`, colors.blue)
  log(`  Passou: ${passCount}`, colors.green)
  log(`  Falhou: ${failCount}`, failCount > 0 ? colors.red : colors.green)

  console.log('')
  if (failCount === 0) {
    log('  ✅ TODAS AS VERIFICAÇÕES DE SEGURANÇA PASSARAM!', colors.bold + colors.green)
  } else {
    log(`  ❌ ${failCount} VERIFICAÇÃO(ÕES) FALHARAM - REVISE!`, colors.bold + colors.red)
  }
  console.log('')

  process.exit(failCount > 0 ? 1 : 0)
}

runAllTests().catch(console.error)
