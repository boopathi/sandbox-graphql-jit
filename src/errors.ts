import { ExecutionResult } from "graphql";
import { ServerResponse } from "http";

export function internalError(res: ServerResponse, message: string) {
  res.writeHead(500);
  res.end(`Internal Server Error: ${message}`);
}

export function notFoundError(res: ServerResponse, url: string) {
  res.writeHead(404);
  res.end(`Not Found : ${url}`);
}

export class CompilationError extends Error {
  constructor(private executionResult: ExecutionResult) {
    super("Failed to compile");
  }
}
