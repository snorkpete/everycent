import {Directive, ElementRef, HostBinding, Input, Renderer, Renderer2} from '@angular/core';

@Directive({
  selector: '[ecHighlightDeletedFor]',
})
export class HighlightDeletedDirective {

  @Input('ecHighlightDeletedFor')
  item: any;

  @HostBinding('class.deleted')
  get isDeleted() {
    return this.item.deleted;
  }

  @HostBinding('class.deactivated')
  get isDeactivated() {
    return this.item.deactivated;
  }

  constructor() { }

}
