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

### Browser

```typescript
import { createMissionsManager } from "@rescuetablet/missions-client/browser";

const manager = await createMissionsManager();
await manager.authorize(missionsApiKey);
```

### React

```tsx
import { createMissionsManager } from "@rescuetablet/missions-client/browser";
import {
  useMissions,
  useMissionsUser,
  MissionsContextProvider,
} from "@rescuetablet/missions-client/react";

// create the manager as described above
// const manager = …

export default function App() {
  return (
    <MissionsContextProvider manager={manager}>
      <Main />
    </MissionsContextProvider>
  );
}

function Main() {
  const missions = useMissions();
  const user = useMissionsUser();

  return <pre>{JSON.stringify({ missions, user }, null, 2)}</pre>;
}
```

### TypeScript Types

We export all types used in the API. You can import them like this:

```typescript
import { type Mission } from "@rescuetablet/missions-client";
```

### API Client

We provide a [`@hey-api/client-fetch`](https://heyapi.dev/) implementation to interact with the API.

```typescript
import { createMission } from "@rescuetablet/missions-client";

await createMission(
  {
    keyword: "TEST",
    message: "Test Mission",
    // more mission data
  },
  {
    client: manager.client,
    // additional hey-api/client-fetch options
  }
);
```

### Real-Time Updates

The `manager` object provides a way to subscribe to real-time updates. You can listen to changes in missions like this:

```typescript
manager.on("mission_added", (mission) => {
  console.log("Mission updated", mission);
});
```

## Maintainers

This library is provided as is under an [MIT license](LICENSE) by [rescueTABLET](https://rescuetablet.de/).
