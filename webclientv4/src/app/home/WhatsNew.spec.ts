import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import WhatsNew from './WhatsNew.vue';
import { HIGHLIGHTS, NOTEWORTHY } from './whatsNewContent';

function createWrapper(): VueWrapper {
  return mount(WhatsNew);
}

describe('WhatsNew', () => {
  it('renders the "What\'s new" heading', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="whats-new-heading"]').text()).toBe("What's new");
  });

  it('renders a card for each highlight with its title, body, and date', () => {
    const wrapper = createWrapper();

    const cards = wrapper.findAll('[data-testid="highlight-card"]');
    // Explicit literal so the test catches regressions in the rendering loop
    // even if the content file grows/shrinks. Update this when HIGHLIGHTS changes.
    expect(cards).toHaveLength(3);

    HIGHLIGHTS.forEach((highlight, i) => {
      const card = cards[i];
      expect(card.find('[data-testid="highlight-title"]').text()).toBe(highlight.title);
      expect(card.find('[data-testid="highlight-body"]').text()).toBe(highlight.body);
      // The date is displayed in a friendly format (e.g. "4 Apr 2026"), not
      // the raw ISO string, so we just assert presence of a date element.
      expect(card.find('[data-testid="highlight-date"]').exists()).toBe(true);
    });
  });

  it('formats highlight dates in "D MMM YYYY" form', () => {
    const wrapper = createWrapper();

    // First highlight has date 2026-04-05 → "5 Apr 2026"
    const firstCard = wrapper.findAll('[data-testid="highlight-card"]')[0];
    expect(firstCard.find('[data-testid="highlight-date"]').text()).toBe('5 Apr 2026');
  });

  it('renders the "Also worth knowing" subheading', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="noteworthy-heading"]').text()).toBe('Also worth knowing');
  });

  it('renders each noteworthy entry', () => {
    const wrapper = createWrapper();

    const items = wrapper.findAll('[data-testid="noteworthy-item"]');
    // Explicit literal — update when NOTEWORTHY changes.
    expect(items).toHaveLength(3);

    NOTEWORTHY.forEach((text, i) => {
      expect(items[i].text()).toBe(text);
    });
  });
});
