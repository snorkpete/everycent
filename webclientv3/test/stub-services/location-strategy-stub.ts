import { LocationChangeListener } from "@angular/common";

let LocationStrategyStub = {
  path(includeHash?: boolean): string {
    return "";
  },
  prepareExternalUrl(internal: string): string {
    return "";
  },
  pushState(
    state: any,
    title: string,
    url: string,
    queryParams: string
  ): void {},
  replaceState(
    state: any,
    title: string,
    url: string,
    queryParams: string
  ): void {},
  forward(): void {},
  back(): void {},
  onPopState(fn: LocationChangeListener): void {},
  getBaseHref(): string {
    return "";
  }
};

export { LocationStrategyStub };
