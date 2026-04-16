import { fromEvent } from 'rxjs';
import type { Type } from '@angular/core';

/**
 * An HTMLElement extended with a string index signature.
 *
 * Stencil web component elements expose framework-specific properties (inputs)
 * and methods that are not part of the base HTMLElement interface. Because the
 * proxy utilities access them dynamically by name, the element reference must
 * support arbitrary keyed reads and writes.  This interface captures that
 * contract without resorting to `any`.
 */
export interface WebComponentElement extends HTMLElement {
  [key: string]: unknown;
}

/**
 * The shape every proxied Angular directive must satisfy so that the utility
 * functions can reach the underlying DOM element and Angular's NgZone.
 */
export interface ProxiedDirective {
  el: WebComponentElement;
  z: import('@angular/core').NgZone;
  [key: string]: unknown;
}

/**
 * Defines a custom element in the browser registry if it hasn't been registered yet.
 */
export const defineCustomElement = (tagName: string, customElement: CustomElementConstructor): void => {
  if (customElement !== undefined && typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, customElement);
  }
};

/**
 * For each declared input, defines a getter/setter pair on the Angular directive prototype
 * that forwards reads and writes to the underlying web component DOM element.
 *
 * Setter runs outside Angular's zone so component-internal re-renders don't trigger
 * unnecessary Angular change detection cycles.
 */
export const proxyInputs = <T extends ProxiedDirective>(
  Cmp: Type<T>,
  inputs: readonly string[]
): void => {
  const Prototype: ProxiedDirective = Cmp.prototype;
  inputs.forEach((item) => {
    Object.defineProperty(Prototype, item, {
      get(this: ProxiedDirective): unknown {
        return this.el[item];
      },
      set(this: ProxiedDirective, val: unknown): void {
        this.z.runOutsideAngular(() => {
          this.el[item] = val;
        });
      },
      /**
       * In the event that proxyInputs is called
       * multiple times re-defining these inputs
       * will cause an error to be thrown. As a result
       * we set configurable: true to indicate these
       * properties can be changed.
       */
      configurable: true,
    });
  });
};

/**
 * Proxies imperative method calls from the Angular directive to the web component element.
 */
export const proxyMethods = <T extends ProxiedDirective>(
  Cmp: Type<T>,
  methods: readonly string[]
): void => {
  const Prototype: ProxiedDirective = Cmp.prototype;
  methods.forEach((methodName) => {
    Object.defineProperty(Prototype, methodName, {
      value(this: ProxiedDirective, ...args: unknown[]): unknown {
        const method = this.el[methodName];
        if (typeof method === 'function') {
          return this.z.runOutsideAngular(() => method.apply(this.el, args));
        }
        return undefined;
      },
      configurable: true,
    });
  });
};

/**
 * Bridges DOM CustomEvents from the web component to Angular EventEmitter observables.
 */
export const proxyOutputs = (
  instance: ProxiedDirective,
  el: HTMLElement,
  events: readonly string[]
): void => {
  events.forEach((eventName) => {
    instance[eventName] = fromEvent(el, eventName);
  });
};

/**
 * Options for the @ProxyCmp class decorator.
 */
interface ProxyCmpOptions {
  defineCustomElementFn?: () => void;
  inputs?: readonly string[];
  methods?: readonly string[];
}

/**
 * Class decorator that registers the custom element, then wires input
 * and method proxies from the Angular directive to the underlying web component.
 */
export function ProxyCmp(opts: ProxyCmpOptions) {
  const decorator = <T extends Type<ProxiedDirective>>(cls: T): T => {
    const { defineCustomElementFn, inputs, methods } = opts;

    if (defineCustomElementFn !== undefined) {
      defineCustomElementFn();
    }

    if (inputs) {
      proxyInputs(cls, inputs);
    }
    if (methods) {
      proxyMethods(cls, methods);
    }
    return cls;
  };
  return decorator;
}
