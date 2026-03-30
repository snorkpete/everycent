import type { DOMWrapper, VueWrapper } from '@vue/test-utils';

interface PrimeVueTooltipElement extends Element {
  $_ptooltipValue?: string;
}

export function getTooltipValue(wrapper: DOMWrapper<Element> | VueWrapper): string | undefined {
  return (wrapper.element as PrimeVueTooltipElement).$_ptooltipValue;
}
