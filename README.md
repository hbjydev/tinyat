# `@tinyat/*`

A series of lightweight TypeScript packages for the AT Protocol, largely
designed to support & complement packages in [atcute](https://github.com/mary-ext/atcute).

---

| Packages |
| -------- |
| **Services** |
| [`xrpc-server`](./packages/xrpc-server): Fetch-compliant XRPC server constructs. |
| **Utilities** |
| [`identity`](./packages/identity): Small utilities for working with atproto DIDs, including handle resolution for `did:plc` and `did:web` accounts. |
| [`jwt`](./packages/jwt): JWT utilities at a higher level than atcute provides (working with proxied service tokens, etc) |

## Contributing

This monorepo is built using [Bun](https://bun.sh) as a package manager. It is
also developed using Nodejs, but is not built to rely on Nodejs APIs (`node:*`
and similar)

```bash
# install packages
$ bun install

# build all packages
$ bun run --filter '*' build

# lint all packages
$ bun run --filter '*' lint
```
