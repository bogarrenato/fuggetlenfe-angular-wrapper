/**
 * Angular Universal helper entry point for @fuggetlenfe/angular-wrapper.
 *
 * ## Why a separate entry
 * The main entry (./index.ts) re-exports the Stencil-generated standalone directives
 * which call `defineCustomElement` at module evaluation time. That call requires a
 * real `customElements` registry. On the Angular Universal server platform (Node +
 * `@angular/platform-server`), the registry exists but its behavior differs from a
 * live browser — in particular, upgrades are deferred until `hydrateDocument` runs.
 *
 * This file gives consumer applications a single import site to pre-render their
 * Angular Universal HTML with Declarative Shadow DOM for every <ff-*> element.
 *
 * ## Typical usage inside an Angular Universal app
 *
 * ```ts
 * // server.ts (Express + angular/ssr)
 * import { renderToString } from '@fuggetlenfe/angular-wrapper/server';
 *
 * app.get('*', async (req, res) => {
 *   const angularHtml = await ngRenderToString(req);
 *   const { html } = await renderToString(angularHtml, {
 *     fullDocument: true,
 *     serializeShadowRoot: 'declarative-shadow-dom',
 *     runtimeLogging: false
 *   });
 *   res.send(html);
 * });
 * ```
 *
 * ## Bootstrap checklist (inside the consumer Angular app)
 * 1. In `main.server.ts` (or equivalent), do NOT call `defineCustomElements()`.
 *    The hydrate module handles it internally during renderToString.
 * 2. In the browser entry (`main.ts`), call `defineCustomElements()` from
 *    `@fuggetlenfe/components/loader` to upgrade the DSD-rendered HTML.
 * 3. Add `CUSTOM_ELEMENTS_SCHEMA` to the standalone component `schemas` array
 *    or bootstrap the directives from `@fuggetlenfe/angular-wrapper`.
 * 4. Include the token contract + brand pack CSS in `styles.css` so the
 *    CSS cascade applies before first paint.
 *
 * ## What this does NOT do
 * - It does NOT render Angular templates. Use `@angular/ssr` for that.
 * - It does NOT modify the NgZone or change change-detection semantics.
 * - It does NOT polyfill browser globals beyond what Stencil ships internally.
 */
export { renderToString, hydrateDocument } from '@fuggetlenfe/components/hydrate';
