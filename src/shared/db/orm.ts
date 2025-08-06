import { MikroORM } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import dotenv from 'dotenv';

dotenv.config();

// Use dbURL if available, otherwise construct from individual components
const databaseUrl =
  process.env.dbUrl ||
  `mysql://${process.env.dbUser}:${process.env.dbPasswd}@${process.env.dbHost}:${process.env.dbPort}/${process.env.dbName}`;

const dbName = process.env.MYSQLDATABASE || process.env.dbName || 'railway';



// Debug: let's see what URL we're actually using
console.log('DEBUG - Using DB URL?:', process.env.dbUrl ? 'Yes' : 'No');
console.log('DEBUG - Final connection:', databaseUrl);
console.log('DEBUG - dbName:', dbName);

console.info('--(i)-- Connecting to DB');

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: dbName,
  type: 'mysql',
  clientUrl: databaseUrl,
  highlighter: new SqlHighlighter(),
  debug: true,
  // TODO: not recommended in prod, bad for scoping and stuff
  allowGlobalContext: true,
  schemaGenerator: {
    // TODO: Never in prod
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator();

  // Utilizar dropSchema/createSchema si un cambio grande en las entities rompe
  await generator.updateSchema();
};
