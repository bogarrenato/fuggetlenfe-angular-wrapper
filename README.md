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
