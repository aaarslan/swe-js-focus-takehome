import { openapiSchemaToJsonSchema as convert } from "@openapi-contrib/openapi-schema-to-json-schema";
import { builders as b } from "ast-types";
import {
  FunctionExpressionKind,
  PropertyKind,
  StatementKind,
} from "ast-types/lib/gen/kinds";
import escodegen from "escodegen";
import { parseScript } from "esprima";
import SWP from "swagger-parser";

export class OASClientFromSpec {
  async generate(spec: unknown): Promise<string> {
    // @ts-expect-error - SWP types are wrong
    const dereferenced = await SWP.dereference(spec);

    const program = b.program([
      ...this.buildImports(),
      ...this.buildSDKExport(this.buildClientMethods(dereferenced)),
    ]);

    const code = escodegen.generate(program, {
      format: {
        compact: true,
      },
    });

    return `// This file is generated, do not modify it! \n${code}`;
  }

  buildImports(): StatementKind[] {
    return [
      b.importDeclaration(
        [b.importSpecifier(b.identifier("produce"))],
        b.literal("immer")
      ),
      b.importDeclaration(
        [b.importDefaultSpecifier(b.identifier("jsf"))],
        b.literal("json-schema-faker")
      ),
    ];
  }

  buildSDKExport(expressions: PropertyKind[]): StatementKind[] {
    return [
      b.exportNamedDeclaration(
        b.variableDeclaration("const", [
          b.variableDeclarator(
            b.identifier("client"),
            b.objectExpression(expressions)
          ),
        ])
      ),
    ];
  }

  buildClientMethods(schema: any): PropertyKind[] {
    const properties: PropertyKind[] = [];

    Object.entries<any>(schema.paths).forEach(([path, pathDef]) => {
      Object.entries<any>(pathDef).forEach(([method, responsesDef]) => {
        if (!responsesDef.responses) return;
        Object.entries<any>(responsesDef.responses).forEach(
          ([statusCode, statusDef]) => {
            const clientMethodKey = `${method.toLowerCase()} ${path.replace(
              /{([^}]+)}/g,
              ":$1"
            )} ${statusCode}`;

            const jsonSchema = convert(
              statusDef.content["application/json"].schema
            );

            properties.push(
              b.property(
                "init",
                b.literal(clientMethodKey),
                this.buildClientMethodDefinition(
                  this.buildAstFromJson(jsonSchema)
                )
              )
            );
          }
        );
      });
    });

    return properties;
  }

  // Comments added by LLM
  buildClientMethodDefinition(schema: PropertyKind[]): FunctionExpressionKind {
    return b.functionExpression(
      null,
      [b.identifier("producer")], // Keep the producer parameter, but it will be treated as optional.
      b.blockStatement([
        b.variableDeclaration("const", [
          b.variableDeclarator(
            b.identifier("faked"),
            b.callExpression(b.identifier("jsf.generate"), [
              b.objectExpression(schema),
            ])
          ),
        ]),
        b.ifStatement(
          b.identifier("producer"), // Check if producer is provided.
          b.blockStatement([
            // If producer is provided, use it to modify 'faked'.
            b.variableDeclaration("const", [
              b.variableDeclarator(
                b.identifier("result"),
                b.callExpression(b.identifier("produce"), [
                  b.identifier("faked"),
                  b.identifier("producer"),
                ])
              ),
            ]),
            b.returnStatement(b.identifier("result")),
          ]),
          b.blockStatement([
            // If producer is not provided, return 'faked' directly.
            b.returnStatement(b.identifier("faked")),
          ])
        ),
      ])
    );
  }

  buildAstFromJson(schema: any): PropertyKind[] {
    const ast = parseScript(`const a = ${JSON.stringify(schema)}`);
    // @ts-expect-error - this is fine
    return ast.body[0].declarations[0].init.properties;
  }
}
