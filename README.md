# fuggetlenfe-angular-wrapper

Angular standalone bridge layer for the Fuggetlenfe web component core.

## Scope

This repository owns:

- the published Angular wrapper package
- the server-side helper entry point for Angular SSR / prerender pipelines
- the wrapper documentation site

It does not own:

- Stencil component logic
- tokens or brand packs
- React integrations
- the token sync or official brand pack generation

## Best-practice boundary

- This package bridges Angular template ergonomics only.
- Semantic tokens, control tokens, and component aliases live in `@fuggetlenfe/tokens`.
- Concrete brand values live in `@fuggetlenfe/brand-styles`.
- The Stencil core remains the single behavioral source of truth.

## Local commands

```bash
npm install
npm run build
npm run build:docs-site
npm run pack:check
```

## Release order

Release this repository after:

1. `@fuggetlenfe/tokens`
2. `@fuggetlenfe/brand-styles`
3. `@fuggetlenfe/components`

## Publishing

Publishing is handled by GitHub Actions and requires:

- `NPM_TOKEN` repository secret
- a published `@fuggetlenfe/components` version

The release workflow updates the dependency version, builds the wrapper, publishes
the npm package, pushes a release tag, and deploys the current docs site to GitHub Pages.
