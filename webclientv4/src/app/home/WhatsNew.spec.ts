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

  it('renders a card for each highlight with its title, body, and formatted date', () => {
    const wrapper = createWrapper();

    const cards = wrapper.findAll('[data-testid="highlight-card"]');
    expect(cards).toHaveLength(HIGHLIGHTS.length);

    HIGHLIGHTS.forEach((highlight, i) => {
      const card = cards[i];
      expect(card.find('[data-testid="highlight-title"]').text()).toBe(highlight.title);
      expect(card.find('[data-testid="highlight-body"]').text()).toBe(highlight.body);
      expect(card.find('[data-testid="highlight-date"]').text()).toBeTruthy();
    });
  });

  it('renders highlights before noteworthy items in the DOM', () => {
    const wrapper = createWrapper();

    const allTestIds = wrapper.findAll('[data-testid]').map((el) => el.attributes('data-testid'));
    const lastHighlightIndex = allTestIds.lastIndexOf('highlight-card');
    const noteworthyHeadingIndex = allTestIds.indexOf('noteworthy-heading');

    expect(lastHighlightIndex).toBeGreaterThanOrEqual(0);
    expect(noteworthyHeadingIndex).toBeGreaterThanOrEqual(0);
    expect(lastHighlightIndex).toBeLessThan(noteworthyHeadingIndex);
  });

  it('renders the "Also worth knowing" subheading', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="noteworthy-heading"]').text()).toBe('Also worth knowing');
  });

  it('renders each noteworthy entry in order', () => {
    const wrapper = createWrapper();

    const items = wrapper.findAll('[data-testid="noteworthy-item"]');
    expect(items).toHaveLength(NOTEWORTHY.length);

    NOTEWORTHY.forEach((text, i) => {
      expect(items[i].text()).toBe(text);
    });
  });
});
