import { Request } from "express";
import _ from "lodash";
import { match as matchFn } from "path-to-regexp";

export class Matchers {
  private req: Request;

  public match: {
    method: string;
    path: string;
    statusCode: string;
    body?: Record<string, any>;
    headers?: Record<string, any>;
    query?: Record<string, any>;
  };

  static matchers = {
    equality: (a: string, b: string | number) =>
      a.toLowerCase() === String(b).toLowerCase(),
    regexp: (a: string, b: string) => {
      return Boolean(matchFn(a)(new URL(`http://127.0.0.1${b}`).pathname));
    },
    object: (a: Record<string, any>, b: Record<string, any>) =>
      Object.keys(a).every((k) => _.isEqual(a[k], b[k])),
  };

  constructor(req: Request, match: Matchers["match"]) {
    this.req = req;
    this.match = match;
  }

  private matchPath(input: string) {
    return Matchers.matchers.regexp(input, this.req.originalUrl);
  }

  private matchMethod(input: string) {
    return Matchers.matchers.equality(input, this.req.method);
  }

  private matchStatusCode(input: string) {
    if (!this.req.statusCode) return false;
    return Matchers.matchers.equality(input, this.req.statusCode);
  }

  private matchBody(input: Record<string, any>) {
    return Matchers.matchers.object(input, this.req.body);
  }

  private matchHeaders(input: Record<string, any>) {
    return Matchers.matchers.object(input, this.req.headers);
  }

  private matchQuery(input: Record<string, any>) {
    return Matchers.matchers.object(input, this.req.query);
  }

  public get isMethodMatch() {
    return this.matchMethod(this.match.method);
  }

  public get isPathMatch() {
    return this.matchPath(this.match.path);
  }

  public get isStatusCodeMatch() {
    return this.matchStatusCode(this.match.statusCode);
  }
}
