/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone } from '@angular/core';

import { ProxyCmp, proxyOutputs } from './angular-component-lib/utils';

import type { Components } from '@fuggetlenfe/components/components';

import { defineCustomElement as defineFfButton } from '@fuggetlenfe/components/components/ff-button.js';
@ProxyCmp({
  defineCustomElementFn: defineFfButton,
  inputs: ['disabled', 'ffAriaLabel', 'fullWidth', 'label', 'type', 'variant'],
  methods: ['setFocus']
})
@Component({
  selector: 'ff-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['disabled', 'ffAriaLabel', 'fullWidth', 'label', 'type', 'variant'],
  standalone: true
})
export class FfButton {
  protected el: HTMLFfButtonElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['ffClick']);
  }
}


export declare interface FfButton extends Components.FfButton {
  /**
   * Fired on click. Exposed as a dedicated event so consumers in every framework
(React, Angular, Vue, plain HTML) can subscribe through the generated wrapper
without worrying about DOM event bubbling semantics.
   */
  ffClick: EventEmitter<CustomEvent<MouseEvent>>;
}


