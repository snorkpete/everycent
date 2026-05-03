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
    {
      label: 'Current Budget',
      icon: Icon.BUDGETS_CURRENT,
      command: () => navigate('/budgets/current'),
      routePath: '/budgets/current',
    },
    {
      label: 'Budgets',
      icon: Icon.BUDGETS,
      command: () => navigate('/budgets'),
      routePath: '/budgets',
    },
    {
      label: 'Future Budgets',
      icon: Icon.BUDGETS_FUTURE,
      command: () => navigate('/budgets/future'),
      routePath: '/budgets/future',
    },
    {
      label: 'Transactions',
      icon: Icon.TRANSACTIONS,
      command: () => navigate('/transactions'),
      routePath: '/transactions',
    },
    {
      label: 'Import',
      icon: Icon.IMPORT,
      command: () => navigate('/import'),
      routePath: '/import',
    },
    {
      label: 'Sink Funds',
      icon: Icon.SINK_FUND,
      command: () => navigate('/sink-funds'),
      routePath: '/sink-funds',
    },
    {
      label: 'Account Balances',
      icon: Icon.ACCOUNT_BALANCES,
      command: () => navigate('/account-balances'),
      routePath: '/account-balances',
    },
    {
      label: 'Special Events',
      icon: Icon.SPECIAL_EVENTS,
      command: () => navigate('/special-events'),
      routePath: '/special-events',
    },
  ];
}

function buildReportsSection(navigate: (path: string) => void): AppMenuItem {
  return {
    label: 'Reports',
    key: 'reports',
    icon: Icon.REPORTING,
    items: [
      {
        label: 'Net Worth Report',
        icon: Icon.NET_WORTH,
        command: () => navigate('/reports/net-worth'),
        routePath: '/reports/net-worth',
      },
      {
        label: 'Category Spending Report',
        icon: Icon.CATEGORY_SPENDING,
        command: () => navigate('/reports/category-spending'),
        routePath: '/reports/category-spending',
      },
      {
        label: 'Needs vs Wants Report',
        icon: Icon.NEEDS_VS_WANTS,
        command: () => navigate('/reports/needs-vs-wants'),
        routePath: '/reports/needs-vs-wants',
      },
    ],
  };
}

function buildSetupSection(navigate: (path: string) => void): AppMenuItem {
  return {
    label: 'Setup',
    key: 'setup',
    icon: Icon.SETUP,
    items: [
      {
        label: 'Allocation Categories',
        icon: Icon.ALLOCATION_CATEGORIES,
        command: () => navigate('/setup/allocation-categories'),
        routePath: '/setup/allocation-categories',
      },
      {
        label: 'Financial Institutions',
        icon: Icon.INSTITUTIONS,
        command: () => navigate('/setup/institutions'),
        routePath: '/setup/institutions',
      },
      {
        label: 'Bank Accounts',
        icon: Icon.BANK_ACCOUNTS,
        command: () => navigate('/setup/bank-accounts'),
        routePath: '/setup/bank-accounts',
      },
      {
        label: 'Settings',
        icon: Icon.SETTINGS,
        command: () => navigate('/setup/settings'),
        routePath: '/setup/settings',
      },
      {
        label: 'Chat Settings',
        icon: Icon.CHAT_SETTINGS,
        command: () => navigate('/setup/chat-settings'),
        routePath: '/setup/chat-settings',
      },
    ],
  };
}

export function buildMenuItems(
  onLogout: () => void,
  navigate: (path: string) => void,
): AppMenuItem[] {
  return [
    ...buildMainItems(navigate),
    { separator: true },
    buildReportsSection(navigate),
    buildSetupSection(navigate),
    { separator: true },
    { label: 'Old Version', icon: Icon.OLD_VERSION, url: '/v3/#/' },
    { label: 'Log Out', icon: Icon.LOGOUT, command: onLogout },
  ];
}
