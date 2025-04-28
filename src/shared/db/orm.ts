import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import dotenv from "dotenv";

dotenv.config();
const user = process.env.dbUser;
const passwd = process.env.dbPasswd;
const host = process.env.dbHost;
const port = process.env.dbPort;
const name = process.env.dbName;

console.info("--(i)-- Connecting to DB");

export const orm = await MikroORM.init({
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  dbName: name,
  type: "mysql",
  clientUrl: `mysql://${user}:${passwd}@${host}:${port}/${name}`,
  highlighter: new SqlHighlighter(),
  debug: true,
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
