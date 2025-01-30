# rescueTABLET missions-client

This is a client library to work with the Missions Service of rescueTABLET. It allows you to create, update, delete and retrieve missions as well as subscribe to real-time updates.

Sorry for the lack of documentation, this is a work in progress.

> [!CAUTION]
> This library is still under heavy development. Until we've reached a stable 1.0.0 version, please expect breaking changes even in minor releases.

## Installation

Add the following line to `.npmrc` in your project directory (create the file if it doesn't exist yet):

```
@rescuetablet:registry=https://npm.pkg.github.com/
```

Install the library and its peer dependencies in your project:

```bash
npm i @rescuetablet/missions-client @hey-api/client-fetch firebase
```

## Usage

In a regular Node.js or browser environment, initialize the library like this:

```typescript
import { connectMissions } from "@rescuetablet/missions-client";

const context = await connectMissions({ apiKey });
```

The created `context` contains three fields:

- `user`: Information about the authorized user.
- `client`: A pre-authorized `@hey-api/client-fetch` client. (see below)
- `manager`: A service that provides real-time updates to missions. (see below)

### TypeScript Types

We export all types used in the API. You can import them like this:

```typescript
import { type Mission } from "@rescuetablet/missions-client";
```

### API Client

We provide a [`@hey-api/client-fetch`](https://heyapi.dev/) implementation to interact with the API. Use the `client` object returned from `connectMissions()` for authenticated requests.

```typescript
import { createMission } from "@rescuetablet/missions-client";

await createMission(
  {
    keyword: "TEST",
    message: "Test Mission",
    // more mission data
  },
  {
    client: context.client,
    // additional hey-api/client-fetch options
  }
);
```

### Real-Time Updates

The `manager` object returned from `connectMissions()` provides a way to subscribe to real-time updates. You can listen to changes in missions like this:

```typescript
context.manager.on("mission_added", (mission) => {
  console.log("Mission updated", mission);
});
```

## Maintainers

This library is provided as is under an [MIT license](LICENSE) by [rescueTABLET](https://rescuetablet.de/).
