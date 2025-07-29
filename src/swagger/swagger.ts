import swaggerJsdoc from "swagger-jsdoc";
import { parse } from "yaml";

const rootInfo = parse('./apiInfo.yaml');
const components = parse('./components.yaml');

const options = {
  definition: {
    ...rootInfo,
    components,
  },
  apis: ['../**/*.routes.ts', '../**/*.routes.js'],
}

export const apiSpec = swaggerJsdoc(options);
