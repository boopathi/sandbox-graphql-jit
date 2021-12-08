import { createServer } from "http";
import { Driver } from "./driver";
import { internalError, notFoundError } from "./errors";
import { createGraphQLHandler, getSchema, graphiqlHandler } from "./graphql";
import { QueryStore } from "./query-store";

async function create() {
  const driver = new Driver();
  await driver.init();

  const schema = await getSchema();

  const queryStore = new QueryStore(schema);

  const graphqlHandler = createGraphQLHandler(driver, schema, queryStore);

  const server = createServer(async (req, res) => {
    switch (req.url) {
      case "/graphql":
        graphqlHandler(req, res).catch((e) => internalError(res, e.message));
        break;
      case "/graphiql":
        graphiqlHandler(req, res).catch((e) => internalError(res, e.message));
        break;
      default:
        notFoundError(res, req.url);
    }
  });

  return server;
}

async function main() {
  const server = await create();
  const port = process.env.PORT || "3000";
  server.listen(port, () => {
    console.log("Server started at " + port);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
