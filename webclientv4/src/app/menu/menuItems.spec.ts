import { describe, it, expect, vi } from 'vitest';
import { buildMenuItems } from './menuItems';
import { Icon } from './menuIcons';

describe('menuItems', () => {
  it('includes Home as the first item pointing to Vue app', () => {
    const items = buildMenuItems(vi.fn());

    expect(items[0].label).toBe('Home');
    expect(items[0].icon).toBe(Icon.HOME);
    expect(items[0].url).toBe('/v4/#/');
  });

  it('points non-migrated routes to Angular app', () => {
    const items = buildMenuItems(vi.fn());
    const budgets = items.find((item) => item.label === 'Budgets');

    expect(budgets!.url).toBe('/#/budgets');
  });

  it('includes expandable Reports section with sub-items', () => {
    const items = buildMenuItems(vi.fn());
    const reports = items.find((item) => item.label === 'Reports');

    expect(reports).toBeDefined();
    expect(reports!.icon).toBe(Icon.REPORTING);
    expect(reports!.items).toHaveLength(3);
    expect(reports!.items![0].label).toBe('Net Worth Report');
  });

  it('includes expandable Setup section with sub-items', () => {
    const items = buildMenuItems(vi.fn());
    const setup = items.find((item) => item.label === 'Setup');

    expect(setup).toBeDefined();
    expect(setup!.icon).toBe(Icon.SETUP);
    expect(setup!.items).toHaveLength(4);
    expect(setup!.items![0].label).toBe('Allocation Categories');
  });

  it('includes Old Version link to Angular app', () => {
    const items = buildMenuItems(vi.fn());
    const oldVersion = items.find((item) => item.label === 'Old Version');

    expect(oldVersion).toBeDefined();
    expect(oldVersion!.url).toBe('/#/');
  });

  it('includes Log Out item that calls the onLogout callback', () => {
    const onLogout = vi.fn();
    const items = buildMenuItems(onLogout);
    const logOut = items.find((item) => item.label === 'Log Out');

    expect(logOut).toBeDefined();
    logOut!.command!({ originalEvent: new Event('click'), item: logOut! });

    expect(onLogout).toHaveBeenCalled();
  });
});
