angular.module('everycent').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/budgets/budget-edit.html',
    "<div class=row><div class=col-xs-12><h2>{{ vm.budget.name }} <small>Setup Budget</small></h2></div></div><ec-income-list-editor budget=vm.budget></ec-income-list-editor><ec-allocation-list-editor allocations=vm.budget></ec-allocation-list-editor><div class=row><div class=col-xs-9><div><button class=\"btn btn-success\" ng-click=vm.saveChanges()>Save Changes</button> &nbsp; &nbsp; <button class=\"btn btn-danger\" ng-click=vm.cancelEdit()>Cancel</button></div></div></div><br>"
  );


  $templateCache.put('app/budgets/budget-list.html',
    "<div class=row><div class=col-xs-12><h2>Budgets</h2></div></div><div class=row><div class=col-xs-12><table class=\"table table-bordered clear-background rounded\"><thead><tr class=heading><th>Name</th><th>Start Date</th><th>End Date</th><th>Actions</th></tr></thead><tbody><tr ng-repeat=\"budget in vm.budgets\"><td>{{ budget.name }}</td><td>{{ budget.start_date }}</td><td>{{ budget.end_date }}</td><td><span ng-click=vm.selectBudgetForUpdate(budget) class=\"text-warning pull-right pointer\"><ec-icon type=edit></ec-icon>&nbsp; Edit &nbsp; &nbsp; &nbsp;</span></td></tr></tbody></table></div></div><div class=row><div class=col-xs-1 ng-show=\"vm.state.is('budgets')\"><button class=\"btn btn-primary\" ng-click=\"vm.state.goToState('budgets.new')\">Create New Budget</button></div><div class=col-xs-1 ng-show=\"vm.state.is('budgets.new')\"><button class=\"btn btn-default\" ng-click=\"vm.state.goToState('budgets')\">Cancel</button></div></div><br><ui-view></ui-view>"
  );


  $templateCache.put('app/budgets/budget-new.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.budgetForm ng-submit=\"vm.addBudget(vm.budget, vm.budgetForm)\"><ec-panel type=primary title=\"Add New Budget\"><ec-form-field label=Name label-width=2 name=start_date error=vm.budgetForm.start_date.$error field-width=6 placeholder=\"Starting date of the budget\" type=date ng-required=true ng-model=vm.budget.start_date></ec-form-field><div class=form-group><div class=\"col-xs-offset-2 col-xs-6\"><button type=submit class=\"btn btn-primary\">Add New Budget</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/budgets/ec-income-list-editor-directive.html',
    "<div class=row><div class=col-xs-12><ec-panel title=Incomes type=primary><table class=\"table table-bordered rounded\"><thead><tr class=heading><th>Name</th><th>Bank Account</th><th>Amount</th><th>Actions</th></tr></thead><tbody><tr ng-repeat=\"income in vm.budget.incomes\" ng-class=\"{ danger: income.deleted }\"><td><input ng-show=vm.isEditMode ng-model=\"income.name\"> <span ng-hide=vm.isEditMode ng-bind=income.name></span></td><td><select ng-show=vm.isEditMode ng-model=income.bank_account_id ng-options=\"bankAccount.id as bankAccount.name for bankAccount in vm.bankAccounts\"></select><span ng-hide=vm.isEditMode ng-bind=income.bank_account.name></span></td><td><input type=number ng-show=vm.isEditMode ng-model=\"income.amount\"> <span ng-hide=vm.isEditMode ng-bind=income.amount></span></td><td><span ng-hide=income.deleted ng-click=\"vm.markForDeletion(income, true)\" class=\"text-danger pull-right pointer\"><ec-icon type=trash></ec-icon></span> <span ng-show=income.deleted ng-click=\"vm.markForDeletion(income, false)\" class=\"text-success pull-right pointer\"><ec-icon type=refresh></ec-icon></span></td></tr></tbody><tfoot><tr class=total><th>Total</th><th></th><th>{{ vm.util.total(vm.budget.incomes, 'amount') }}</th><th></th></tr></tfoot></table><div class=row><div class=col-xs-2 ng-hide=vm.isEditMode><button class=\"btn btn-primary\" ng-click=vm.switchToEditMode()>Make Changes</button></div><div class=col-xs-3 ng-show=vm.isEditMode><button class=\"btn btn-primary\" ng-click=vm.addNewIncome()>Add Income</button></div><div class=col-xs-9><div class=pull-right ng-show=vm.isEditMode><button class=\"btn btn-success\" ng-click=vm.switchToViewMode()>Back to View Mode</button> &nbsp; &nbsp; <button class=\"btn btn-danger\" ng-click=vm.cancelEdit()>Cancel</button></div></div></div></ec-panel></div></div><br>"
  );


  $templateCache.put('app/common/ec-form-field-directive.html',
    "<div class=form-group ng-class=\"{'has-error': vm.error.server }\"><label class=\"col-xs-{{ vm.labelWidth }} control-label\">{{ vm.label }}</label><div class=\"col-xs-{{ vm.fieldWidth }}\"><ng-switch on=vm.type><select ng-switch-when=select name=vm.fieldName ng-model=vm.model ng-required=vm.isRequired ng-options=\"item.id as item.name for item in vm.items\" class=form-control></select><input ng-switch-default type=\"{{ vm.type }}\" name=vm.fieldName ng-model=vm.model class=form-control ng-required=vm.isRequired placeholder=\"{{ vm.placeholder }}\"></ng-switch><p class=help-block>{{ vm.error.server }}</p></div></div>"
  );


  $templateCache.put('app/common/ec-icon-directive.html',
    "<span class=\"glyphicon glyphicon-{{ vm.type }}\" aria-hidden=true></span>"
  );


  $templateCache.put('app/common/ec-message-directive.html',
    "<div class=message-container><div class=\"message alert alert-success\" ng-show=vm.ui.message>{{ vm.ui.message }} <span ng-click=vm.remove() class=\"pull-right pointer\"><ec-icon type=remove></ec-icon></span></div><div class=\"message alert alert-danger\" ng-show=vm.ui.errorMessage><span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=true></span> {{ vm.ui.errorMessage }} <span ng-click=vm.remove() class=\"pull-right pointer\"><ec-icon type=remove></ec-icon></span></div><div class=\"message alert alert-warning\" ng-show=vm.ui.warningMessage>{{ vm.ui.warningMessage }} <span ng-click=vm.remove() class=\"pull-right pointer\"><ec-icon type=remove></ec-icon></span></div></div>"
  );


  $templateCache.put('app/common/ec-panel-directive.html',
    "<div class=\"panel panel-{{ vm.type }}\"><div class=panel-heading>{{ vm.title }}</div><div class=panel-body ng-transclude></div></div>"
  );


  $templateCache.put('app/common/modal.html',
    "<div class=modal-header><h3>{{vm.options.headerText}}</h3></div><div class=modal-body><p>{{vm.options.bodyText}}</p></div><div class=modal-footer><button type=button class=\"btn btn-danger\" ng-click=vm.options.cancel()>{{vm.options.cancelButtonText}}</button> <button class=\"btn btn-primary\" ng-click=vm.options.confirm();>{{vm.options.confirmButtonText}}</button></div>"
  );


  $templateCache.put('app/home/home.html',
    "<h2>Welcome to EveryCent!!!</h2>"
  );


  $templateCache.put('app/menu/ec-navbar-directive.html',
    "<nav ng-hide=\"vm.isActive('sign_in')\" class=\"navbar navbar-fixed-top navbar-inverse\" role=navigation><div class=container><div class=navbar-header><button ng-init=\"navCollapsed = true\" ng-click=\"navCollapsed = !navCollapsed\" type=button class=navbar-toggle><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a class=navbar-brand ng-click=\"vm.goToPage('home')\">EveryCent</a></div><div collapse=navCollapsed class=\"collapse navbar-collapse\"><ul class=\"nav navbar-nav navbar-right\"><li><p class=navbar-text>Hi, <strong>{{ vm.user.name }}</strong></p></li><li><a ng-click=vm.signOut()>Sign Out</a></li></ul><ul class=\"main-menu nav navbar-nav\"><li class=dropdown ng-class=\"{ active: vm.isActive('setup'), open: setupOpen }\"><a class=dropdown-toggle data-toggle=dropdown role=button ng-init=\"setupOpen = false\" ng-click=\"setupOpen = !setupOpen\" aria-expanded=false>Setup <span class=caret></span></a><ul class=dropdown-menu role=menu><li><a ng-click=\"vm.state.go('institutions');setupOpen = false;\">Institutions</a></li><li><a ng-click=\"vm.state.go('bank-accounts');setupOpen = false;\">Bank Accounts</a></li><li><a ng-click=\"vm.state.go('recurring-incomes');setupOpen = false;\">Recurring Incomes</a></li><li><a ng-click=\"vm.state.go('recurring-allocations');setupOpen = false;\">Recurring Allocations</a></li><li><a ng-click=\"vm.state.go('allocation-categories');setupOpen = false;\">Allocation Categories</a></li></ul></li><li ng-class=\"{ active: vm.isActive('budgets')}\"><a ng-click=\"vm.state.go('budgets');\">Budgets</a></li></ul></div></div></nav>"
  );


  $templateCache.put('app/security/sign-in.html',
    "<br><h2>EveryCent <small>the zero-based budget manager</small></h2><br><br><ec-panel title=\"Sign In\" type=primary><form ng-submit=vm.signIn(vm.loginForm) role=form><div class=form-group><label>Email Address</label><input type=email name=email ng-model=vm.loginForm.email required=required class=\"form-control\"></div><div class=form-group><label>Password</label><input type=password name=password ng-model=vm.loginForm.password required=required class=\"form-control\"></div><button type=submit class=\"btn btn-primary btn-lg\">Sign In</button></form></ec-panel><br>"
  );


  $templateCache.put('app/setup/allocation-categories/list.html',
    "<div class=row><div class=col-xs-12><h2>Allocation Categories <small>Expenses, Savings, Debt etc</small></h2></div></div><div class=row><div class=col-xs-12><table class=table><thead><tr class=heading><th style=\"width: 40%\">Allocation Category</th><th style=\"width: 10%\" class=text-right>% Of Income</th><th style=\"width: 40%\"></th><th style=\"width: 10%\"></th></tr></thead><tbody><tr ng-repeat=\"category in vm.allocationCategories\" ng-class=\"{ danger: category.deleted }\"><td><span ng-hide=vm.isEditMode>{{ category.name }}</span> <span ng-show=vm.isEditMode><input ng-model=category.name></span></td><td class=text-right><span ng-hide=vm.isEditMode>{{ category.percentage }}</span> <span ng-show=vm.isEditMode><input type=number ng-model=category.percentage class=text-right></span></td><td></td><td><span ng-show=vm.isEditMode><span ng-hide=category.deleted ng-click=\"vm.markForDeletion(category, true)\" class=\"text-danger pull-right pointer\"><ec-icon type=trash></ec-icon></span> <span ng-show=category.deleted ng-click=\"vm.markForDeletion(category, false)\" class=\"text-success pull-right pointer\"><ec-icon type=refresh></ec-icon></span></span></td></tr><tr class=total><th>Total</th><th class=text-right><span ng-class=\"{ 'text-danger': vm.percentageTotal() > 100, 'text-warning': vm.percentageTotal() < 100, 'text-success': vm.percentageTotal() === 100 }\">{{ vm.percentageTotal() }}</span></th><th><span ng-show=\"vm.percentageTotal() < 100\"><span class=\"label label-warning\">{{ 100 - vm.percentageTotal() }}% unallocated.</span> &nbsp; <span class=\"label label-warning\">Total should be 100%.</span></span> <span ng-show=\"vm.percentageTotal() > 100\"><span class=\"label label-danger\">Over-allocated by {{ vm.percentageTotal() - 100 }}%.</span> &nbsp; <span class=\"label label-danger\">Total should not exceed 100%</span></span></th><th></th></tr></tbody></table></div></div><div class=row><div class=col-xs-2 ng-hide=vm.isEditMode><button class=\"btn btn-primary\" ng-click=vm.switchToEditMode()>Make Changes</button></div><div class=col-xs-3 ng-show=vm.isEditMode><button class=\"btn btn-primary\" ng-click=vm.newAllocationCategory()>New Allocation Category</button></div><div class=col-xs-9><div class=pull-right ng-show=vm.isEditMode><button class=\"btn btn-success\" ng-click=vm.saveChanges()>Save Changes</button> &nbsp; &nbsp; <button class=\"btn btn-danger\" ng-click=vm.cancelEdit()>Cancel</button></div></div></div><br>"
  );


  $templateCache.put('app/setup/bank-accounts/edit.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.bankAccountForm ng-submit=\"vm.updateBankAccount(vm.bankAccount, vm.bankAccountForm)\"><ec-panel type=primary title=\"Edit Bank Account\"><ng-include src=\"'app/setup/bank-accounts/form.html'\"></ng-include><div class=form-group><div class=\"col-xs-offset-2 col-xs-2\"><button type=submit class=\"btn btn-primary\">Update Bank Account</button></div><div class=col-xs-2><button type=button class=\"btn btn-danger\" ng-click=vm.cancelEdit()>Cancel</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/setup/bank-accounts/form.html',
    "<ec-form-field label=Name label-width=2 name=name error=vm.bankAccountForm.name.$error field-width=6 placeholder=\"Bank Account's name\" type=text ng-required=true ng-model=vm.bankAccount.name></ec-form-field><ec-form-field label=\"Account Type\" label-width=2 name=account_type error=vm.bankAccountForm.account_type.$error field-width=6 placeholder=\"Money Market Fund, Savings, Checking etc\" type=text ng-required=true ng-model=vm.bankAccount.account_type></ec-form-field><ec-form-field label=\"Account Owner\" label-width=2 name=user_id error=vm.bankAccountForm.user_id.$error field-width=6 type=select list-of=users ng-required=true ng-model=vm.bankAccount.user_id></ec-form-field><ec-form-field label=Institution label-width=2 name=institution_id error=vm.bankAccountForm.institution_id.$error field-width=6 type=select list-of=institutions ng-required=true ng-model=vm.bankAccount.institution_id></ec-form-field><ec-form-field label=\"Account No\" label-width=2 name=account_no error=vm.bankAccountForm.account_no.$error field-width=6 placeholder=\"Official Account #\" type=text ng-required=true ng-model=vm.bankAccount.account_no></ec-form-field><ec-form-field label=\"Opening Balance\" label-width=2 name=opening_balance error=vm.bankAccountForm.opening_balance.$error field-width=6 placeholder=\"Balance when you started budget\" type=number ng-required=true ng-model=vm.bankAccount.opening_balance></ec-form-field>"
  );


  $templateCache.put('app/setup/bank-accounts/list.html',
    "<div class=row><div class=col-xs-12><h2>Bank Accounts</h2></div></div><div class=row><div class=col-xs-12><table class=\"table table-bordered clear-background rounded\"><thead><tr class=heading><th>Name</th><th>Institution</th><th>Account Type</th><th>Account #</th><th>Owner</th><th>Opening Balance</th><th>Actions</th></tr></thead><tbody><tr ng-repeat=\"bankAccount in vm.bankAccounts\"><td>{{ bankAccount.name }}</td><td>{{ bankAccount.institution.name }}</td><td>{{ bankAccount.account_type }}</td><td>{{ bankAccount.account_no }}</td><td>{{ bankAccount.user.first_name + ' ' + bankAccount.user.last_name }}</td><td>{{ bankAccount.opening_balance }}</td><td><span ng-click=vm.deleteBankAccount(bankAccount) class=\"text-danger pull-right pointer\"><ec-icon type=trash></ec-icon></span> <span ng-click=vm.selectBankAccountForUpdate(bankAccount) class=\"text-warning pull-right pointer\"><ec-icon type=edit></ec-icon>&nbsp; Edit &nbsp; &nbsp; &nbsp;</span></td></tr></tbody></table></div></div><div class=row><div class=col-xs-1 ng-show=\"vm.state.is('bank-accounts')\"><button class=\"btn btn-primary\" ng-click=\"vm.state.goToState('bank-accounts.new')\">Add New Bank Account</button></div><div class=col-xs-1 ng-show=\"vm.state.is('bank-accounts.new')\"><button class=\"btn btn-default\" ng-click=\"vm.state.goToState('bank-accounts')\">Cancel</button></div></div><br><ui-view></ui-view>"
  );


  $templateCache.put('app/setup/bank-accounts/new.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.bankAccountForm ng-submit=\"vm.addBankAccount(vm.bankAccount, vm.bankAccountForm)\"><ec-panel type=primary title=\"Add an Bank Account\"><ng-include src=\"'app/setup/bank-accounts/form.html'\"></ng-include><div class=form-group><div class=\"col-xs-offset-2 col-xs-6\"><button type=submit class=\"btn btn-primary\">Add Bank Account</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/setup/institutions/edit.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.institutionForm ng-submit=\"vm.updateInstitution(vm.institution, vm.institutionForm)\"><ec-panel type=primary title=\"Edit Institution\"><ec-form-field label=Name label-width=2 name=name error=vm.institutionForm.name.$error field-width=6 placeholder=\"Institution's name\" type=text ng-required=true ng-model=vm.institution.name></ec-form-field><div class=form-group><div class=\"col-xs-offset-2 col-xs-2\"><button type=submit class=\"btn btn-primary\">Update Institution</button></div><div class=col-xs-2><button type=button class=\"btn btn-danger\" ng-click=vm.cancelEdit()>Cancel</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/setup/institutions/list.html',
    "<div class=row><div class=col-xs-12><h2>Banking Institutions</h2></div></div><div class=row><div class=col-xs-12><ul class=list-group><li class=list-group-item ng-repeat=\"institution in vm.institutions\">{{ $index + 1 }}. {{ institution.name }} <em>(id: {{ institution.id }})</em> <span ng-click=vm.deleteInstitution(institution) class=\"text-danger pull-right pointer\"><ec-icon type=trash></ec-icon></span> <span ng-click=vm.selectInstitutionForUpdate(institution) class=\"text-warning pull-right pointer\"><ec-icon type=edit></ec-icon>&nbsp; Edit &nbsp; &nbsp; &nbsp;</span></li></ul></div></div><div class=row><div class=col-xs-1 ng-show=\"vm.state.is('institutions')\"><button class=\"btn btn-primary\" ng-click=\"vm.state.goToState('institutions.new')\">Add New Institution</button></div><div class=col-xs-1 ng-show=\"vm.state.is('institutions.new')\"><button class=\"btn btn-default\" ng-click=\"vm.state.goToState('institutions')\">Cancel</button></div></div><br><ui-view></ui-view>"
  );


  $templateCache.put('app/setup/institutions/new.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.institutionForm ng-submit=\"vm.addInstitution(vm.institution, vm.institutionForm)\"><ec-panel type=primary title=\"Add an Institution\"><ec-form-field label=Name label-width=2 name=name error=vm.institutionForm.name.$error field-width=6 placeholder=\"Institution's name\" type=text ng-required=true ng-model=vm.institution.name></ec-form-field><div class=form-group><div class=\"col-xs-offset-2 col-xs-6\"><button type=submit class=\"btn btn-primary\">Add Institution</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/setup/recurring-allocations/edit.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.recurringAllocationForm ng-submit=\"vm.updateRecurringAllocation(vm.recurringAllocation, vm.recurringAllocationForm)\"><ec-panel type=primary title=\"Edit Recurring Allocation\"><ng-include src=\"'app/setup/recurring-allocations/form.html'\"></ng-include><div class=form-group><div class=\"col-xs-offset-2 col-xs-3\"><button type=submit class=\"btn btn-primary\">Update Recurring Allocation</button></div><div class=col-xs-2><button type=button class=\"btn btn-danger\" ng-click=vm.cancelEdit()>Cancel</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/setup/recurring-allocations/form.html',
    "<ec-form-field label=Name label-width=2 name=name error=vm.recurringAllocationForm.name.$error field-width=6 placeholder=\"eg. rent, Aidan's savings, food etc\" type=text ng-required=true ng-model=vm.recurringAllocation.name></ec-form-field><ec-form-field label=Amount label-width=2 name=amount error=vm.recurringAllocationForm.amount.$error field-width=6 type=number ng-required=true ng-model=vm.recurringAllocation.amount></ec-form-field><div class=form-group ng-class=\"{'has-error': vm.recurringAllocationForm.allocation_type.$error.server }\"><label class=\"col-xs-2 control-label\">Type</label><div class=col-xs-6><select name=allocation_type ng-model=vm.recurringAllocation.allocation_type class=form-control><option value=expense selected=selected>Expense</option><option value=savings>Savings</option><option value=\"sinking fund\">Sinking Fund</option></select><p class=help-block>{{ vm.recurringAllocationForm.allocation_type.$error.server }}</p></div></div><ec-form-field label=Category label-width=2 name=allocation_category_id error=vm.recurringAllocationForm.allocation_category_id.$error field-width=6 type=select list-of=allocation_categories ng-required=true ng-model=vm.recurringAllocation.allocation_category_id></ec-form-field><div class=form-group ng-class=\"{'has-error': vm.recurringAllocationForm.is_standing_error.$error.server }\"><div class=\"col-sm-offset-2 col-xs-10\"><div class=checkbox><label><input type=checkbox name=is_standing_order ng-model=vm.recurringAllocation.is_standing_order> Standing Order?</label></div></div><p class=help-block>{{ vm.recurringAllocationForm.is_standing_order.$error.server }}</p></div><ec-form-field ng-show=vm.recurringAllocation.is_standing_order label=\"Bank Account\" label-width=2 name=bank_account_id error=vm.recurringAllocationForm.bank_account_id.$error field-width=6 type=select list-of=bank_accounts ng-required=true ng-model=vm.recurringAllocation.bank_account_id></ec-form-field>"
  );


  $templateCache.put('app/setup/recurring-allocations/list.html',
    "<div class=row><div class=col-xs-12><h2>Recurring Allocations</h2></div></div><div class=row><div class=col-xs-12><table class=\"table table-bordered clear-background rounded\"><thead><tr class=heading><th>Name</th><th>Amount</th><th>Type</th><th>Category</th><th>Frequency</th><th>Standing Order?</th><th>Bank Account</th><th>Actions</th></tr></thead><tbody><tr ng-repeat=\"recurringAllocation in vm.recurringAllocations\"><td>{{ recurringAllocation.name }}</td><td>{{ recurringAllocation.amount }}</td><td>{{ recurringAllocation.allocation_type }}</td><td>{{ recurringAllocation.allocation_category.name }}</td><td>{{ recurringAllocation.frequency }}</td><td>{{ recurringAllocation.is_standing_order ? 'Yes': 'No' }}</td><td>{{ recurringAllocation.bank_account.name }}</td><td><span ng-click=vm.deleteRecurringAllocation(recurringAllocation) class=\"text-danger pull-right pointer\"><ec-icon type=trash></ec-icon></span> <span ng-click=vm.selectRecurringAllocationForUpdate(recurringAllocation) class=\"text-warning pull-right pointer\"><ec-icon type=edit></ec-icon>&nbsp; Edit &nbsp; &nbsp; &nbsp;</span></td></tr></tbody></table></div></div><div class=row><div class=col-xs-1 ng-show=\"vm.state.is('recurring-allocations')\"><button class=\"btn btn-primary\" ng-click=\"vm.state.goToState('recurring-allocations.new')\">Add New Recurring Allocation</button></div><div class=col-xs-1 ng-show=\"vm.state.is('recurring-allocations.new')\"><button class=\"btn btn-default\" ng-click=\"vm.state.goToState('recurring-allocations')\">Cancel</button></div></div><br><ui-view></ui-view>"
  );


  $templateCache.put('app/setup/recurring-allocations/new.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.recurringAllocationForm ng-submit=\"vm.addRecurringAllocation(vm.recurringAllocation, vm.recurringAllocationForm)\"><ec-panel type=primary title=\"Add an Recurring Allocation\"><ng-include src=\"'app/setup/recurring-allocations/form.html'\"></ng-include><div class=form-group><div class=\"col-xs-offset-2 col-xs-6\"><button type=submit class=\"btn btn-primary\">Add Recurring Allocation</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/setup/recurring-incomes/edit.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.recurringIncomeForm ng-submit=\"vm.updateRecurringIncome(vm.recurringIncome, vm.recurringIncomeForm)\"><ec-panel type=primary title=\"Edit Recurring Income\"><ng-include src=\"'app/setup/recurring-incomes/form.html'\"></ng-include><div class=form-group><div class=\"col-xs-offset-2 col-xs-2\"><button type=submit class=\"btn btn-primary\">Update Recurring Income</button></div><div class=col-xs-2><button type=button class=\"btn btn-danger\" ng-click=vm.cancelEdit()>Cancel</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/setup/recurring-incomes/form.html',
    "<ec-form-field label=Name label-width=2 name=name error=vm.recurringIncomeForm.name.$error field-width=6 placeholder=\"eg. Kion's Salary, Pat's Su-su payment etc\" type=text ng-required=true ng-model=vm.recurringIncome.name></ec-form-field><ec-form-field label=Amount label-width=2 name=amount error=vm.recurringIncomeForm.amount.$error field-width=6 type=number ng-required=true ng-model=vm.recurringIncome.amount></ec-form-field><ec-form-field label=\"Bank Account\" label-width=2 name=bank_account_id error=vm.recurringIncomeForm.bank_account_id.$error field-width=6 type=select list-of=bank_accounts ng-required=true ng-model=vm.recurringIncome.bank_account_id></ec-form-field>"
  );


  $templateCache.put('app/setup/recurring-incomes/list.html',
    "<div class=row><div class=col-xs-12><h2>Recurring Incomes</h2></div></div><div class=row><div class=col-xs-12><table class=\"table table-bordered clear-background rounded\"><thead><tr class=heading><th>Name</th><th>Amount</th><th>Frequency</th><th>Bank Account</th><th>Owner</th><th>Actions</th></tr></thead><tbody><tr ng-repeat=\"recurringIncome in vm.recurringIncomes\"><td>{{ recurringIncome.name }}</td><td>{{ recurringIncome.amount }}</td><td>{{ recurringIncome.frequency }}</td><td>{{ recurringIncome.bank_account.name }}</td><td>{{ recurringIncome.user_id.name }}</td><td><span ng-click=vm.deleteRecurringIncome(recurringIncome) class=\"text-danger pull-right pointer\"><ec-icon type=trash></ec-icon></span> <span ng-click=vm.selectRecurringIncomeForUpdate(recurringIncome) class=\"text-warning pull-right pointer\"><ec-icon type=edit></ec-icon>&nbsp; Edit &nbsp; &nbsp; &nbsp;</span></td></tr></tbody></table></div></div><div class=row><div class=col-xs-1 ng-show=\"vm.state.is('recurring-incomes')\"><button class=\"btn btn-primary\" ng-click=\"vm.state.goToState('recurring-incomes.new')\">Add New Recurring Income</button></div><div class=col-xs-1 ng-show=\"vm.state.is('recurring-incomes.new')\"><button class=\"btn btn-default\" ng-click=\"vm.state.goToState('recurring-incomes')\">Cancel</button></div></div><br><ui-view></ui-view>"
  );


  $templateCache.put('app/setup/recurring-incomes/new.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.recurringIncomeForm ng-submit=\"vm.addRecurringIncome(vm.recurringIncome, vm.recurringIncomeForm)\"><ec-panel type=primary title=\"Add an Recurring Income\"><ng-include src=\"'app/setup/recurring-incomes/form.html'\"></ng-include><div class=form-group><div class=\"col-xs-offset-2 col-xs-6\"><button type=submit class=\"btn btn-primary\">Add Recurring Income</button></div></div></ec-panel></form></div></div>"
  );

}]);
