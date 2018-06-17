import { Directive, HostBinding, Input } from "@angular/core";

@Directive({
  selector: "[ecHighlightDeletedFor]"
})
export class HighlightDeletedDirective {
  /* tslint:disable no-input-rename */
  @Input("ecHighlightDeletedFor") item: any;

  @HostBinding("class.closed")
  get isClosed() {
    return this.item && this.item.status === "closed";
  }

  @HostBinding("class.deleted")
  get isDeleted() {
    return this.item.deleted;
  }

  @HostBinding("class.unpaid")
  get isUnpaid() {
    if (this.item.status === undefined) {
      return false;
    }

    // explicitly skip open items -
    // this is used in sink funds to show open sink fund allocations
    if (this.item.status === "open" || this.item.status === "closed") {
      return false;
    }

    return this.item.status !== "paid";
  }

  @HostBinding("class.deactivated")
  get isDeactivated() {
    return this.item.deactivated;
  }

  constructor() {}
}
