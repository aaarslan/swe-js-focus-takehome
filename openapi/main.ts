import { Server } from "./server";
import spec from "./spec.json";

import { env } from "../src/env";

const server = new Server(spec);

const { port } = new URL(env.API_URL);

(async () => {
  await server.setup();

  server.listen(port, () => {
    console.log(
      `🚀 [mock api server] Listening on http://localhost:${port} 🚀`
    );
  });
})();
