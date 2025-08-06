import { MikroORM } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL or MYSQL_URL from Railway if available, otherwise use individual variables
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  `mysql://${process.env.dbUser}:${process.env.dbPasswd}@${process.env.dbHost}:${process.env.dbPort}/${process.env.dbName}`;

const dbName = process.env.MYSQLDATABASE || process.env.dbName || 'railway';

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
