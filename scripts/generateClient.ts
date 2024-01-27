import fs from "fs";
import { OASClientFromSpec, spec } from "../openapi";

(async () => {
  const client = new OASClientFromSpec();
  const js = await client.generate(spec);
  fs.writeFileSync("./cypress/support/client.generated.ts", js);
})();
