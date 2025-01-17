import { createClient, type Client } from "@hey-api/client-fetch";

export type MissionsApiArgs = {
  apiKey: string;
  baseUrl?: string;
  userAgent?: string;
};

export function createMissionsClient(args: MissionsApiArgs): Client {
  return createClient({
    baseUrl: args.baseUrl ?? "https://missions-api.rescuetablet.com",
    headers: {
      authorization: args.apiKey,
      ...(args.userAgent ? { "user-agent": args.userAgent } : {}),
    },
  });
}
