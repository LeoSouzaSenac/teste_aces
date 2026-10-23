import { db } from './db';

async function main() {
  await db.initialize();
  try {
    // Retira o índice antigo que impedia reutilizar horários cancelados.
    const indexes: Array<{ INDEX_NAME: string; NON_UNIQUE: number; columns: string }> =
      await db.query(`SELECT INDEX_NAME, NON_UNIQUE, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns
        FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointments'
        GROUP BY INDEX_NAME, NON_UNIQUE`);
    for (const index of indexes) {
      if (Number(index.NON_UNIQUE) === 0 && index.columns === 'professionalId,startsAt') {
        const escaped = index.INDEX_NAME.replace(/`/g, '``');
        await db.query(`ALTER TABLE appointments DROP INDEX \`${escaped}\``);
        console.log('Índice de agendamento antigo atualizado:', index.INDEX_NAME);
      }
    }
    await db.synchronize();
    console.log('Esquema atualizado');
  } finally {
    await db.destroy();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
