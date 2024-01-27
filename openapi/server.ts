import { openapiSchemaToJsonSchema as convert } from "@openapi-contrib/openapi-schema-to-json-schema";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import { JSONSchemaFaker } from "json-schema-faker";
import SWP from "swagger-parser";
import { Matchers } from "./matchers";

JSONSchemaFaker.option({
  useDefaultValue: true,
});

export class Server {
  public spec: any;

  private interceptors: Map<string, [Function, Function]>;

  public server: Express;

  private httpServer?: ReturnType<Express["listen"]>;

  constructor(spec: any) {
    this.spec = spec;
    this.interceptors = new Map();
    this.server = express();
    this.server
      .use(bodyParser.json())
      .use(cors())
      .post("/mock", this.mock.bind(this))
      .get("/unmock", this.unmock.bind(this))
      .get("/teardown", this.teardown.bind(this))
      .use("*", this.handler.bind(this));
  }

  public async setup() {
    // @ts-expect-error - SWP types are wrong
    this.spec = await SWP.dereference(this.spec);
  }

  private get buildDefaults(): [Function, Function][] {
    const defaults: [Function, Function][] = [];

    Object.entries<any>(this.spec.paths).forEach(([path, pathDef]) => {
      Object.entries<any>(pathDef).forEach(([method, responsesDef]) => {
        if (!responsesDef.responses) return;
        Object.entries<any>(responsesDef.responses).forEach(
          ([statusCode, statusDef]) => {
            const matcher = (req: Request) => {
              const cleanPath = path.replace(/{([^}]+)}/g, ":$1");
              const match = new Matchers(req, {
                method,
                path: cleanPath,
                statusCode,
              });
              return match.isMethodMatch && match.isPathMatch;
            };

            const handler = (res: Response) => {
              const jsonSchema = convert(
                statusDef.content["application/json"].schema,
                {
                  definitionKeywords: ["definitions"],
                }
              );

              const faked = JSONSchemaFaker.generate(jsonSchema);

              res.send(faked);
            };

            defaults.push([matcher, handler]);
          }
        );
      });
    });

    return defaults;
  }

  private handler(req: Request, res: Response) {
    const [, handler] =
      Array.from(this.interceptors.values())
        .concat(this.buildDefaults)
        .find(([matcher]) => matcher(req)) || [];

    if (handler) {
      return handler(res);
    }

    res.sendStatus(404);
  }

  private mock(req: Request, res: Response): void {
    this.interceptors.set(req.body.key || Date.now().toString(), [
      (_req: Request) => {
        const match = new Matchers(_req, req.body.match);
        return match.isMethodMatch && match.isPathMatch;
      },
      (_res: Response) => _res.send(req.body.response),
    ]);
    res.sendStatus(200);
  }

  private unmock(req: Request, res: Response): void {
    this.interceptors.delete(req.body.key);
    res.sendStatus(200);
  }

  private teardown(_req: Request, res: Response): void {
    this.interceptors.clear();
    res.sendStatus(200);
  }

  public listen(port: string, cb: () => void): this {
    this.httpServer = this.server.listen(port, cb);
    return this;
  }

  public close(): this {
    this.httpServer?.close();
    return this;
  }
}
