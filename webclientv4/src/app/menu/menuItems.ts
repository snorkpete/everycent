import type { MenuItem } from 'primevue/menuitem';
import { Icon } from './menuIcons';

const mainItems: MenuItem[] = [
  { label: 'Home', icon: Icon.HOME, url: '/v4/#/' },
  { label: 'Current Budget', icon: Icon.BUDGETS_CURRENT, url: '/#/budgets/current' },
  { label: 'Budgets', icon: Icon.BUDGETS, url: '/#/budgets' },
  { label: 'Future Budgets', icon: Icon.BUDGETS_FUTURE, url: '/#/budgets/future' },
  { label: 'Transactions', icon: Icon.TRANSACTIONS, url: '/#/transactions' },
  { label: 'Sink Funds', icon: Icon.SINK_FUND, url: '/#/sink-funds' },
  { label: 'Account Balances', icon: Icon.ACCOUNT_BALANCES, url: '/#/account-balances' },
  { label: 'Special Events', icon: Icon.SPECIAL_EVENTS, url: '/#/special-events' },
];

const reportsSection: MenuItem = {
  label: 'Reports',
  icon: Icon.REPORTING,
  items: [
    { label: 'Net Worth Report', icon: Icon.NET_WORTH, url: '/#/reports/net-worth' },
    { label: 'Category Spending Report', icon: Icon.CATEGORY_SPENDING, url: '/#/reports/category-spending' },
    { label: 'Needs vs Wants Report', icon: Icon.NEEDS_VS_WANTS, url: '/#/reports/needs-vs-wants' },
  ],
};

const setupSection: MenuItem = {
  label: 'Setup',
  icon: Icon.SETUP,
  items: [
    { label: 'Allocation Categories', icon: Icon.ALLOCATION_CATEGORIES, url: '/#/setup/allocation-categories' },
    { label: 'Financial Institutions', icon: Icon.INSTITUTIONS, url: '/#/setup/institutions' },
    { label: 'Bank Accounts', icon: Icon.BANK_ACCOUNTS, url: '/#/setup/bank-accounts' },
    { label: 'Settings', icon: Icon.SETTINGS, url: '/#/setup/settings' },
  ],
};

export function buildMenuItems(onLogout: () => void): MenuItem[] {
  return [
    ...mainItems,
    { separator: true },
    reportsSection,
    setupSection,
    { separator: true },
    { label: 'Old Version', icon: Icon.OLD_VERSION, url: '/#/' },
    { label: 'Log Out', icon: Icon.LOGOUT, command: onLogout },
  ];
}
