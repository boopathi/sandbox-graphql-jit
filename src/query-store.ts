import { GraphQLSchema, parse } from "graphql";
import { CompiledQuery, compileQuery, isCompiledQuery } from "graphql-jit";
import { GraphQLError } from "graphql-jit/dist/error";
import { CompilationError } from "./errors";

interface PersistedQuery {
  id: string;
  compiledQuery: CompiledQuery;
}

export class QueryStore {
  private queries = new Map<string, PersistedQuery>();

  constructor(private schema: GraphQLSchema) {}

  async get(id?: string, queryStr?: string): Promise<PersistedQuery> {
    if (id) {
      const query = this.queries.get(id);
      if (query) return query;
    }

    if (!queryStr) throw new GraphQLError("Query Not Found");

    const document = parse(queryStr);

    const compiledQuery = compileQuery(this.schema, document);
    if (!isCompiledQuery(compiledQuery)) {
      throw new CompilationError(compiledQuery);
    }
    const newQuery: PersistedQuery = {
      id,
      compiledQuery,
    };
    if (id) this.queries.set(id, newQuery);
    return newQuery;
  }
}
