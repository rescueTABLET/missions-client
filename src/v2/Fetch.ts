export class Fetch {
  readonly #fetch: typeof globalThis.fetch;

  constructor({ fetch }: { readonly fetch: typeof globalThis.fetch }) {
    this.#fetch = fetch;
  }

  static create(): Fetch {
    return new Fetch({
      fetch: global.fetch,
    });
  }

  static createNull({
    requests,
  }: {
    readonly requests: readonly StubbedRequest[];
  }): Fetch {
    return new Fetch({ fetch: createFetchStub({ requests }) });
  }

  readonly fetch: typeof globalThis.fetch = async (
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> => this.#fetch(input, init);
}

export type RequestSpec = {
  readonly method: string;
  readonly url: string;
};

export type RequestMatcher = (request: Request) => boolean;

export type StubbedRequest = {
  readonly request: RequestSpec | RequestMatcher;
  readonly response: Response;
};

function createFetchStub({
  requests,
}: {
  readonly requests: readonly StubbedRequest[];
}): typeof globalThis.fetch {
  const matchers: readonly {
    readonly matcher: RequestMatcher;
    readonly response: Response;
  }[] = requests.map((request) => ({
    matcher: toRequestMatcher(request.request),
    response: request.response,
  }));

  return async (input, init) => {
    const request = new Request(input, init);
    const response = matchers.find((m) => m.matcher(request))?.response;
    if (response) return response;

    console.warn(`No stubbed request for ${request.method} ${request.url}`);
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  };
}

function toRequestMatcher(spec: RequestSpec | RequestMatcher): RequestMatcher {
  if (typeof spec === "function") {
    return spec;
  }

  return (request: Request) => {
    return (
      request.method.toUpperCase() === spec.method.toUpperCase() &&
      request.url === spec.url
    );
  };
}
