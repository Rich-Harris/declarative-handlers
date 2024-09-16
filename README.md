# Declarative handlers in SvelteKit

Occasionally people ask for route-specific handlers in SvelteKit, as a more granular alternative to the singular `handle` hook in `src/hooks.server.js`. So far we've decided against adding such a thing, because it makes applications harder to understand ('where is this value being set?') and adds complexity around timing (if there are multiple handlers that could apply to a route, especially if some of them use `sequence`, it becomes very difficult to figure out the order in which things will happen). In short, they're a footgun.

That's not to say they're not _useful_ in certain circumstances. Luckily, all the tools needed to add route-specific logic to handlers (in a way that makes data flow and timing explicit and controllable) already exist. The most obvious approach is to just put the logic inside the main `handle` hook:

```js
// src/hooks.server.ts
export function handle({ event, resolve }) {
  if (event.route.id?.startsWith('/admin')) {
    // do this
  } else {
    // do that
  }
}
```

That doesn't scale to large apps though, so we can consider other approaches.

## Option one — helper functions

It's easy enough to create handlers that only run when certain conditions are met:

```ts
// src/hooks.server.ts
function conditional_handler(
  fn: Handle,
  predicate: (event: RequestEvent) => boolean
) {
  const handle: Handle = ({ event, resolve }) => {
    if (predicate(event)) {
      return fn({ event, resolve });
    }

    return resolve(event);
  };

  return handle;
}
```

This function takes a normal `handle` function, plus a `(event: RequestEvent) => boolean` predicate function that determines whether it applies. Taking it further, we can build easier-to-use abstractions on top of it:

```ts
// src/hooks.server.ts
function route_specific_handler(routes: string[], fn: Handle) {
  return conditional_handler(fn, (event) =>
    event.route.id ? routes.includes(event.route.id) : false
  );
}

const my_handler = route_specific_handler(['/my-route', '/my-other-route'], ({ event, resolve }) => {...});
```

## Option two — glob imports

The first option works well if you have handlers that need to apply to many routes. If you have logic that applies to a single route, another option is to colocate it with the route in question:

```ts
// src/hooks.server.ts
const route_specific_hooks = import.meta.glob('./routes/**/hooks.ts');

export async function handle({ event, resolve }) {
  const importer =
    route_specific_hooks['./routes' + event.route.id + '/hooks.ts'];

  if (importer) {
    const module = (await importer()) as any;
    if (module.handle) {
      return module.handle({ event, resolve });
    }
  }

  return resolve(event);
}
```

Then, you can create a `src/routes/my-route/hooks.ts` file containing your logic:

```ts
export function handle({ event, resolve }) {
  // my-route specific logic goes here
}
```
