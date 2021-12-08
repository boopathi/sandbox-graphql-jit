import { makeExecutableSchema } from "@graphql-tools/schema";
import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { GraphQLSchema, parse } from "graphql";
import { compileQuery, isCompiledQuery } from "graphql-jit";
import { IncomingMessage, ServerResponse } from "http";
import { join } from "path";
import { Driver } from "./driver";
import { internalError } from "./errors";
import { QueryStore } from "./query-store";
import { resolvers } from "./resolvers";

const typeDefsFile = new URL("./typedefs.gql", import.meta.url).pathname;
const graphiqlHtmlFile = new URL("./graphiql.html", import.meta.url).pathname;

export function createGraphQLHandler(
  driver: Driver,
  schema: GraphQLSchema,
  queryStore: QueryStore
) {
  return async function graphqlHandler(
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const body = JSON.parse(await readRequestBody(req));

    try {
      const pq = await queryStore.get(body.id, body.query);
      const result = await pq.compiledQuery.query(
        {},
        { driver, schema },
        body.variables || {}
      );

      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (e) {
      internalError(res, e.message);
    }
  };
}

export async function getSchema() {
  const typeDefs = await readFile(typeDefsFile, "utf-8");
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  return schema;
}

export async function graphiqlHandler(_: IncomingMessage, res: ServerResponse) {
  createReadStream(graphiqlHtmlFile).pipe(res);
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const body: Uint8Array[] = [];
    req
      .on("data", (chunk) => body.push(chunk))
      .on("end", () => resolve(Buffer.concat(body).toString()));
  });
}
