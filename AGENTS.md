## Package Manager & Runtime

This project uses **Bun** as its package manager and execution runtime. Never use `npm`, `pnpm`, or `yarn`.

- Install dependencies: `bun install`
- Add packages: `bun add <pkg>` (or `bun add -d <pkg>` for dev dependencies)
- Remove packages: `bun remove <pkg>`

## Development

- Build project: `bun run build`
- Preview build: `bun run preview`

When starting the dev server, use background mode:

```
bun x astro dev --background
```

Manage the background server with `bun x astro dev stop`, `bun x astro dev status`, and `bun x astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
