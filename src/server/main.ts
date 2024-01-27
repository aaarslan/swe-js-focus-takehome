import { server } from "./server";

import { env } from "../env";

server.listen(env.APPLICATION_PORT, () => {
  console.log(
    `🚀 [application server] Listening on http://localhost:${env.APPLICATION_PORT}/test/book 🚀`
  );
});
