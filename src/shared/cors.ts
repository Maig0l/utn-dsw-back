import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: process.env.frontendCorsUrl || 'http://localhost:4200/',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
}
