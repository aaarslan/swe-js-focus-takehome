import { defineConfig } from "cypress";
import { env } from "./src/env";

export default defineConfig({
  env,
  e2e: {
    baseUrl: `http://localhost:${env.APPLICATION_PORT}`,
    specPattern: "cypress/e2e/*.ts",
  },
  experimentalInteractiveRunEvents: true,
});
