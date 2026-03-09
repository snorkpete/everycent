import type { MenuItem } from 'primevue/menuitem';
import { Icon } from './menuIcons';

// Extends PrimeVue's MenuItem with a routePath for active-highlight tracking.
// routePath must match the Vue Router path of the page the item navigates to.
export interface AppMenuItem extends MenuItem {
  routePath?: string;
  items?: AppMenuItem[];
}

function buildMainItems(navigate: (path: string) => void): AppMenuItem[] {
  return [
    { label: 'Home', icon: Icon.HOME, command: () => navigate('/'), routePath: '/' },
    { label: '* Current Budget', icon: Icon.BUDGETS_CURRENT, url: '/#/budgets/current' },
    { label: '* Budgets', icon: Icon.BUDGETS, url: '/#/budgets' },
    { label: 'Future Budgets', icon: Icon.BUDGETS_FUTURE, command: () => navigate('/budgets/future'), routePath: '/budgets/future' },
    { label: '* Transactions', icon: Icon.TRANSACTIONS, url: '/#/transactions' },
    { label: '* Sink Funds', icon: Icon.SINK_FUND, url: '/#/sink-funds' },
    { label: '* Account Balances', icon: Icon.ACCOUNT_BALANCES, url: '/#/account-balances' },
    { label: '* Special Events', icon: Icon.SPECIAL_EVENTS, url: '/#/special-events' },
  ];
}

function buildReportsSection(): AppMenuItem {
  return {
    label: '* Reports',
    key: 'reports',
    icon: Icon.REPORTING,
    items: [
      { label: '* Net Worth Report', icon: Icon.NET_WORTH, url: '/#/reports/net-worth' },
      { label: '* Category Spending Report', icon: Icon.CATEGORY_SPENDING, url: '/#/reports/category-spending' },
      { label: '* Needs vs Wants Report', icon: Icon.NEEDS_VS_WANTS, url: '/#/reports/needs-vs-wants' },
    ],
  };
}

function buildSetupSection(navigate: (path: string) => void): AppMenuItem {
  return {
    label: 'Setup',
    key: 'setup',
    icon: Icon.SETUP,
    items: [
      { label: 'Allocation Categories', icon: Icon.ALLOCATION_CATEGORIES, command: () => navigate('/setup/allocation-categories'), routePath: '/setup/allocation-categories' },
      { label: 'Financial Institutions', icon: Icon.INSTITUTIONS, command: () => navigate('/setup/institutions'), routePath: '/setup/institutions' },
      { label: 'Bank Accounts', icon: Icon.BANK_ACCOUNTS, command: () => navigate('/setup/bank-accounts'), routePath: '/setup/bank-accounts' },
      { label: 'Settings', icon: Icon.SETTINGS, command: () => navigate('/setup/settings'), routePath: '/setup/settings' },
    ],
  };
}

export function buildMenuItems(onLogout: () => void, navigate: (path: string) => void): AppMenuItem[] {
  return [
    ...buildMainItems(navigate),
    { separator: true },
    buildReportsSection(),
    buildSetupSection(navigate),
    { separator: true },
    { label: 'Old Version', icon: Icon.OLD_VERSION, url: '/#/' },
    { label: 'Log Out', icon: Icon.LOGOUT, command: onLogout },
  ];
}
