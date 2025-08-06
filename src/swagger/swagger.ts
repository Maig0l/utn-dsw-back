import swaggerJsdoc from 'swagger-jsdoc';
import { parse } from 'yaml';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootInfo = parse(readFileSync(join(__dirname, 'apiInfo.yaml'), 'utf8'));
const components = parse(readFileSync(join(__dirname, 'components.yaml'), 'utf8'));

const options = {
  definition: {
    ...rootInfo,
    ...components,
  },
  apis: ['./**/*.routes.yaml'],
};

export const apiSpec = swaggerJsdoc(options);
