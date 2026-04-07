/**
 * Angular bridge layer for the shared Stencil web components.
 *
 * This file is the public entry point of @fuggetlenfe/angular-wrapper.
 * It re-exports auto-generated Angular standalone directives from ./lib/generated/.
 *
 * The generated directives (created by @stencil/angular-output-target) use the @ProxyCmp
 * decorator to proxy Angular @Input bindings to the underlying web component element.
 * They use OnPush change detection and run property writes outside Angular's zone
 * for optimal performance.
 *
 * ## What this package provides
 * - FfButton: Angular standalone directive that wraps the <ff-button> web component
 * - DIRECTIVES: Array of all directive exports for convenience
 *
 * ## What this package does NOT provide
 * - No styling, brand, or theme logic
 * - No CSS imports (consumers must import contract.css + a brand pack in styles.css)
 * - No business logic
 *
 * The visual identity comes from external CSS packages:
 *   @fuggetlenfe/tokens/contract.css     → stable token API
 *   @fuggetlenfe/brand-styles/*.css      → brand+theme overrides
 */
export * from './lib/generated/components';
export * from './lib/generated/index';
