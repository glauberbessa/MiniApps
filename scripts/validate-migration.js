#!/usr/bin/env node

/**
 * Script: Validar Migração Neon → Supabase
 *
 * Compara contagem de registros em ambos bancos e valida dados críticos
 *
 * Uso:
 * DATABASE_URL_NEON="postgresql://..." \
 * DATABASE_URL_SUPABASE="postgresql://..." \
 * node scripts/validate-migration.js
 */

const { PrismaClient } = require('@prisma/client');
const colors = require('colors/safe');

// Validar environment
if (!process.env.DATABASE_URL_NEON || !process.env.DATABASE_URL_SUPABASE) {
  console.error(colors.red('❌ Erro: DATABASE_URL_NEON e DATABASE_URL_SUPABASE são necessários'));
  console.error('Uso:');
  console.error('  DATABASE_URL_NEON="postgresql://..." \\');
  console.error('  DATABASE_URL_SUPABASE="postgresql://..." \\');
  console.error('  node scripts/validate-migration.js');
  process.exit(1);
}

// Criar clientes Prisma para ambos bancos
const neon = new PrismaClient({
  datasources: {
    database: {
      url: process.env.DATABASE_URL_NEON,
    },
  },
});

const supabase = new PrismaClient({
  datasources: {
    database: {
      url: process.env.DATABASE_URL_SUPABASE,
    },
  },
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

async function countTable(prisma, table) {
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM "${table}"`
    );
    return result[0].count;
  } catch (error) {
    console.error(colors.red(`  Erro ao contar ${table}: ${error.message}`));
    return null;
  }
}

async function validateDataIntegrity(prisma, dbName) {
  console.log(`\n🔐 Validando integridade de dados em ${dbName}...\n`);

  // 1. Senhas (bcrypt hashes, 60 caracteres)
  const passwordCount = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM "User" WHERE password IS NOT NULL AND LENGTH(password) = 60`
  );
  console.log(`  Senhas bcrypt válidas: ${passwordCount[0].count}`);

  // 2. Tokens OAuth
  const tokenCount = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM "Account" WHERE refresh_token IS NOT NULL`
  );
  console.log(`  Tokens OAuth (refresh_token): ${tokenCount[0].count}`);

  // 3. Sessões válidas
  const sessionCount = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM "Session" WHERE expires > NOW()`
  );
  console.log(`  Sessões ativas: ${sessionCount[0].count}`);

  // 4. Emails válidos
  const emailCount = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM "User" WHERE email IS NOT NULL AND email ~ '^[^@]+@[^@]+\\.[^@]+$'`
  );
  console.log(`  Emails válidos: ${emailCount[0].count}`);

  return {
    passwords: passwordCount[0].count,
    tokens: tokenCount[0].count,
    sessions: sessionCount[0].count,
    emails: emailCount[0].count,
  };
}

async function main() {
  console.log(colors.cyan('\n🔍 Iniciando validação de migração Neon → Supabase\n'));
  console.log(colors.cyan('='.repeat(70)));

  const startTime = Date.now();
  const results = { neon: {}, supabase: {} };
  let allMatch = true;

  // Contar tabelas em Neon
  console.log(colors.yellow('\n📊 Neon (Origem):\n'));
  for (const table of tables) {
    const count = await countTable(neon, table);
    results.neon[table] = count;
    const status = count !== null ? '✅' : '❌';
    console.log(`  ${status} ${table.padEnd(20)} ${count?.toString().padStart(6) || 'ERRO'}`);
  }

  // Contar tabelas em Supabase
  console.log(colors.yellow('\n📊 Supabase (Destino):\n'));
  for (const table of tables) {
    const count = await countTable(supabase, table);
    results.supabase[table] = count;
    const status = count !== null ? '✅' : '❌';
    console.log(`  ${status} ${table.padEnd(20)} ${count?.toString().padStart(6) || 'ERRO'}`);
  }

  // Comparar
  console.log(colors.yellow('\n📋 Comparação:\n'));
  for (const table of tables) {
    const neonCount = results.neon[table];
    const supabaseCount = results.supabase[table];

    if (neonCount === null || supabaseCount === null) {
      console.log(`  ⚠️  ${table.padEnd(20)} Erro ao comparar`);
      allMatch = false;
      continue;
    }

    if (neonCount === supabaseCount) {
      console.log(colors.green(`  ✅ ${table.padEnd(20)} Neon: ${neonCount.toString().padEnd(6)} = Supabase: ${supabaseCount}`));
    } else {
      console.log(colors.red(`  ❌ ${table.padEnd(20)} Neon: ${neonCount.toString().padEnd(6)} ≠ Supabase: ${supabaseCount} [MISMATCH]`));
      allMatch = false;
    }
  }

  // Validar integridade
  const neonIntegrity = await validateDataIntegrity(neon, 'Neon');
  const supabaseIntegrity = await validateDataIntegrity(supabase, 'Supabase');

  // Comparar integridade
  console.log(colors.yellow('\n🔐 Comparação de Integridade:\n'));
  const integrityKeys = Object.keys(neonIntegrity);
  for (const key of integrityKeys) {
    const neonVal = neonIntegrity[key];
    const supabaseVal = supabaseIntegrity[key];
    if (neonVal === supabaseVal) {
      console.log(colors.green(`  ✅ ${key.padEnd(20)} ${neonVal}`));
    } else {
      console.log(colors.red(`  ❌ ${key.padEnd(20)} Neon: ${neonVal} ≠ Supabase: ${supabaseVal}`));
      allMatch = false;
    }
  }

  // Resultado final
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + colors.cyan('='.repeat(70)));

  if (allMatch) {
    console.log(colors.green(`\n✅ VALIDAÇÃO COMPLETA E SUCESSO! (${duration}s)\n`));
    console.log(colors.green('Todos os dados foram migrados corretamente de Neon para Supabase.'));
    process.exit(0);
  } else {
    console.log(colors.red(`\n❌ VALIDAÇÃO FALHOU! (${duration}s)\n`));
    console.log(colors.red('Há discrepâncias entre os bancos. Revisar relatório acima.'));
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(colors.red(`\n❌ Erro fatal: ${error.message}`));
    process.exit(1);
  })
  .finally(async () => {
    await neon.$disconnect();
    await supabase.$disconnect();
  });
