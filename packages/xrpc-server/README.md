# `@tinyat/xrpc-server`

A Web Standards-driven XRPC server implementation that provides a routing and validation (in and
out) system powered by Zod, without caring about how you serve the API.

## Usage

As an example using Deno:

```ts
// test.ts
import { z } from 'npm:zod';
import { defineHandler, handle } from 'npm:@tinyat/xrpc-server';

defineHandler(
	'com.atproto.identity.resolveHandle',
	{
		input: z.object({
			handle: z.string(),
		}),
		output: z.object({
			did: z.string(),
		}),
	},
	({ input: { handle } }) => ({
		did: handle,
	}),
);

export default { fetch: handle };
```

You could then use:

```bash
$ deno serve test.ts
```

And find `localhost:8000/com.atproto.identity.resolveHandle` resolves.

```http
GET localhost:8000/com.atproto.identity.resolveHandle?handle=hayden.moe

...
Content-Type: application/json

{"did":"hayden.moe"}
```
