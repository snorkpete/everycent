import { describe, it, expect, vi } from 'vitest';
import { buildMenuItems } from './menuItems';
import { Icon } from './menuIcons';

describe('menuItems', () => {
  it('includes Home as the first item using command-based Vue navigation', () => {
    const navigate = vi.fn();
    const items = buildMenuItems(vi.fn(), navigate);

    expect(items[0].label).toBe('Home');
    expect(items[0].icon).toBe(Icon.HOME);
    expect(items[0].routePath).toBe('/');
    items[0].command!({ originalEvent: new Event('click'), item: items[0] });
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('points non-migrated routes to Angular app via url', () => {
    const items = buildMenuItems(vi.fn(), vi.fn());
    const budgets = items.find((item) => item.label === '* Budgets');

    expect(budgets!.url).toBe('/#/budgets');
  });

  it('includes Future Budgets with command-based Vue navigation and routePath', () => {
    const navigate = vi.fn();
    const items = buildMenuItems(vi.fn(), navigate);
    const futureBudgets = items.find((item) => item.label === 'Future Budgets');

    expect(futureBudgets!.routePath).toBe('/budgets/future');
    futureBudgets!.command!({ originalEvent: new Event('click'), item: futureBudgets! });
    expect(navigate).toHaveBeenCalledWith('/budgets/future');
  });

  it('includes expandable Reports section with sub-items', () => {
    const items = buildMenuItems(vi.fn(), vi.fn());
    const reports = items.find((item) => item.label === '* Reports');

    expect(reports).toBeDefined();
    expect(reports!.icon).toBe(Icon.REPORTING);
    expect(reports!.items).toHaveLength(3);
    expect(reports!.items![0].label).toBe('* Net Worth Report');
  });

  it('Reports section has a key for expandedKeys tracking', () => {
    const items = buildMenuItems(vi.fn(), vi.fn());
    const reports = items.find((item) => item.label === '* Reports');

    expect(reports!.key).toBe('reports');
  });

  it('includes expandable Setup section with sub-items', () => {
    const items = buildMenuItems(vi.fn(), vi.fn());
    const setup = items.find((item) => item.label === 'Setup');

    expect(setup).toBeDefined();
    expect(setup!.icon).toBe(Icon.SETUP);
    expect(setup!.items).toHaveLength(4);
    expect(setup!.items![0].label).toBe('Allocation Categories');
  });

  it('Setup section has a key for expandedKeys tracking', () => {
    const items = buildMenuItems(vi.fn(), vi.fn());
    const setup = items.find((item) => item.label === 'Setup');

    expect(setup!.key).toBe('setup');
  });

  it('Setup sub-items use command-based Vue navigation with routePath', () => {
    const navigate = vi.fn();
    const items = buildMenuItems(vi.fn(), navigate);
    const setup = items.find((item) => item.label === 'Setup');
    const institutions = setup!.items!.find((item) => item.label === 'Financial Institutions');

    expect(institutions!.routePath).toBe('/setup/institutions');
    expect(institutions!.url).toBeUndefined();
    institutions!.command!({ originalEvent: new Event('click'), item: institutions! });
    expect(navigate).toHaveBeenCalledWith('/setup/institutions');
  });

  it('includes Old Version link to Angular app', () => {
    const items = buildMenuItems(vi.fn(), vi.fn());
    const oldVersion = items.find((item) => item.label === 'Old Version');

    expect(oldVersion).toBeDefined();
    expect(oldVersion!.url).toBe('/#/');
  });

  it('includes Log Out item that calls the onLogout callback', () => {
    const onLogout = vi.fn();
    const items = buildMenuItems(onLogout, vi.fn());
    const logOut = items.find((item) => item.label === 'Log Out');

    expect(logOut).toBeDefined();
    logOut!.command!({ originalEvent: new Event('click'), item: logOut! });

    expect(onLogout).toHaveBeenCalled();
  });
});
