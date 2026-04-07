#!/usr/bin/env node
/*
 * SSR / SSG demonstration prerender for the Angular showcase.
 *
 * ## What this does
 * Generates a dedicated static page at `dist/ssr-demo.html` that shows every
 * <ff-*> component from the library fully server-rendered with Declarative
 * Shadow DOM inlined. This proves that the hydrate module works end-to-end
 * and that first paint is visually correct before any client JS runs.
 *
 * ## Why a dedicated page (not full Angular Universal)
 * The main Angular showcase uses the standalone wrapper directives, while the
 * `@fuggetlenfe/angular-wrapper/server` entry gives the app a server-safe path
 * to the Stencil hydrate module. A full Angular Universal stack would render
 * the Angular route first, then pass the resulting HTML through this helper.
 * That extra server pipeline is orthogonal to what this demo is proving: that
 * the component runtime itself is SSR-safe and can emit Declarative Shadow DOM.
 *
 * This script imports ONLY the Stencil hydrate module (exposed via
 * @fuggetlenfe/angular-wrapper/server), feeds it a hand-written HTML template
 * with <ff-*> tags, and lets the hydrate module upgrade every custom element
 * to Declarative Shadow DOM in Node. The output is a complete HTML document
 * that any static host (GitHub Pages, S3, CDN) can serve with zero runtime.
 *
 * ## Verification contract
 *  - The process exits non-zero if the hydrate module reports any diagnostic
 *    of level "error". Warnings are printed but non-fatal.
 *  - The emitted HTML is checked for the `<template shadowrootmode="open">`
 *    substring before being written to disk. Missing DSD tags mean the build
 *    produced client-only output, which is a regression.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToString as hydrateToString } from '@fuggetlenfe/angular-wrapper/server';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const distDir = resolve(appRoot, process.env.SSR_OUTPUT_DIR || 'dist');
const outPath = resolve(distDir, 'ssr-demo.html');

/*
 * Brand identity for this SSR demo — overridable via SSR_BRAND / SSR_THEME env
 * vars so the same script produces differently-skinned outputs for each
 * showcase app without code duplication.
 */
const BRAND = process.env.SSR_BRAND || 'brand-1';
const THEME = process.env.SSR_THEME || 'light';

/*
 * Inline the token contract + active brand pack CSS as "critical CSS" in the
 * demo document head. This is the key architectural step of SSR for tokenized
 * web components: the first paint needs the --ff-* custom properties set
 * BEFORE any shadow DOM rule can resolve its var(...) references. Without
 * this, every shadow DOM CSS rule falls back to its transparent/inherit
 * default and the page looks unstyled even though the DSD serialization
 * itself is 100% correct.
 *
 * Reading the published package files directly keeps the prerender self-contained:
 * no monorepo path assumptions, no bundler output dependency, deterministic bytes.
 */
const tokenContractCss = readFileSync(require.resolve('@fuggetlenfe/tokens/contract.css'), 'utf8');
const brandPackCss = readFileSync(
  require.resolve(`@fuggetlenfe/brand-styles/${BRAND}-${THEME}.css`),
  'utf8'
);

// Minimal document template. Uses the same brand pack as the runtime Angular app
// (brand-1 light by default) so the visual identity matches byte-for-byte.
const template = /* html */ `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSR demo · Fuggetlenfe DS</title>
    <style>
      /* inline minimal host layout; real apps would link their design system CSS */
      body {
        margin: 0;
        padding: 2.5rem 1.5rem;
        min-height: 100vh;
        background: #f6f7fb;
        color: #0f172a;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      }
      .ssr-shell {
        max-width: 960px;
        margin: 0 auto;
        display: grid;
        gap: 2rem;
      }
      h1 { margin: 0; font-size: 1.5rem; }
      h2 { margin: 2rem 0 0.75rem; font-size: 1.125rem; }
      p { margin: 0.5rem 0 1rem; line-height: 1.55; color: #475569; }
      .swatch-row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
      .note {
        border-left: 3px solid #6366f1;
        padding: 0.5rem 1rem;
        background: #eef2ff;
        border-radius: 8px;
        color: #312e81;
      }
    </style>
    <!--
      Critical CSS for the SSR first paint: token contract + active brand pack
      inlined below. These two style blocks set the --ff-* custom properties
      that the shadow DOM rules read via var(...) references. Without them the
      first paint would show unstyled native buttons even though the DSD markup
      is 100% correct — a classic SSR "I serialized the component but forgot
      the cascade" pitfall.
    -->
    <style data-ff-critical="token-contract">${tokenContractCss}</style>
    <style data-ff-critical="brand-pack">${brandPackCss}</style>
  </head>
  <body data-brand="${BRAND}" data-theme="${THEME}">
    <main class="ssr-shell">
      <header>
        <h1>Server-rendered primitives · Declarative Shadow DOM</h1>
        <p>
          Every component below was rendered in Node through the Stencil hydrate
          module. Open DevTools on any element and look for
          <code>&lt;template shadowrootmode="open"&gt;</code> — the full shadow tree and
          its scoped CSS are inlined so first paint is already correct.
        </p>
        <div class="note">
          Hydrate output is byte-deterministic. The same input HTML produces the
          same output on every build, which means CI can diff the rendered bytes as
          a cheap regression gate.
        </div>
      </header>

      <section>
        <h2>ff-button — all variants (Figma-backed)</h2>
        <p>
          This is the sole Figma-backed component in the design system. Every visual
          token value (background, foreground, radius, padding, font) comes from the
          Figma Variables API via the token contract. The component library contains
          only primitives that exist in Figma — nothing is added manually.
        </p>
        <div class="swatch-row">
          <ff-button variant="primary">Primary</ff-button>
          <ff-button variant="secondary">Secondary</ff-button>
          <ff-button variant="ghost">Ghost</ff-button>
          <ff-button variant="danger">Danger</ff-button>
          <ff-button disabled>Disabled</ff-button>
          <ff-button full-width>Full width</ff-button>
        </div>
      </section>

      <section>
        <h2>Multi-brand token cascade</h2>
        <p>
          The same <code>&lt;ff-button&gt;</code> binary renders with three distinct
          visual identities by swapping only the inline CSS brand pack. The component
          source code is identical across all brands — differentiation is purely
          a CSS cascade concern, driven by the Figma Variables export.
        </p>
        <div class="note">
          Brand 1 = purple (#695EFD), Arial, radius 0. Brand 2 = green (#8DFF8D),
          Inter, radius 4px. Brand 3 = teal, Open Sans, pill (radius 999px).
          All values flow from the Figma file, not from hardcoded CSS.
        </div>
      </section>
    </main>
  </body>
</html>`;

async function main() {
  const { html, diagnostics } = await hydrateToString(template, {
    fullDocument: true,
    serializeShadowRoot: 'declarative-shadow-dom',
    removeUnusedStyles: false,
    prettyHtml: false
  });

  const errors = diagnostics.filter((diag) => diag.level === 'error');
  const warnings = diagnostics.filter((diag) => diag.level === 'warn');

  if (warnings.length > 0) {
    console.warn('[prerender] Stencil hydrate warnings:');
    for (const warning of warnings) {
      console.warn('  -', warning.messageText);
    }
  }

  if (errors.length > 0) {
    console.error('[prerender] Stencil hydrate reported errors:');
    for (const error of errors) {
      console.error('  -', error.messageText);
    }
    process.exit(1);
  }

  if (!html.includes('shadowrootmode="open"')) {
    console.error('[prerender] Output missing shadowrootmode="open" — SSR contract broken.');
    process.exit(1);
  }

  writeFileSync(outPath, html);
  console.log('[prerender] dist/ssr-demo.html written with Declarative Shadow DOM markup.');
}

main().catch((error) => {
  console.error('[prerender] fatal:', error);
  process.exit(1);
});
