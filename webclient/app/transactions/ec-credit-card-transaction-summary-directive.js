
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecCreditCardTransactionSummary', ecCreditCardTransactionSummary);

  function ecCreditCardTransactionSummary(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/transactions/ec-credit-card-transaction-summary-directive.html',
      scope: {
        bankAccount: '=',
        transactions: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['UtilService'];
  function controller(UtilService){
    var vm = this;

    vm.util = UtilService;

    vm.previousStatementBalance = previousStatementBalance;
    vm.previousStatementBalancePaid = previousStatementBalancePaid;
    vm.previousStatementOutstanding = previousStatementOutstanding;

    vm.currentStatementBalance = currentStatementBalance;
    vm.currentStatementBalancePaid = currentStatementBalancePaid;
    vm.currentStatementOutstanding = currentStatementOutstanding;


    activate();

    function activate(){
    }


    function previousStatementBalance(){
      if(!vm.bankAccount){
        return 0;
      }
      return vm.bankAccount.previous_period_starting_balance;
    }

    function previousStatementBalancePaid(){
      if(!vm.bankAccount){
        return 0;
      }

      return sumTransactionsBetweenDates(vm.transactions,
          vm.bankAccount.previous_period_statement_start,
          vm.bankAccount.previous_period_statement_end,
          'paid'
      );
    }

    function previousStatementOutstanding(){
      if(!vm.bankAccount){
        return 0;
      }

      return sumTransactionsBetweenDates(vm.transactions,
                vm.bankAccount.previous_period_statement_start,
                vm.bankAccount.previous_period_statement_end,
                'unpaid'
            );
    }

    function currentStatementBalance(){
      if(!vm.bankAccount){
        return 0;
      }
      return sumTransactionsBetweenDates(vm.transactions,
          vm.bankAccount.previous_period_statement_start,
          new Date()
      ) + vm.bankAccount.previous_period_starting_balance;
    }

    function currentStatementBalancePaid(){
      if(!vm.bankAccount){
        return 0;
      }

      var totalPaid = sumTransactionsBetweenDates(vm.transactions,
          vm.bankAccount.previous_period_statement_start,
          new Date(),
          'paid'
      );

      return totalPaid - previousStatementBalancePaid();
    }

    function currentStatementOutstanding(){
      if(!vm.bankAccount){
        return 0;
      }

      var totalOutstanding = sumTransactionsBetweenDates(vm.transactions,
          vm.bankAccount.previous_period_statement_start,
          new Date(),
          'unpaid'
      );

      return totalOutstanding - previousStatementOutstanding();
      //return currentStatementBalance() - currentStatementBalanceUnpaid();
    }


    function sumTransactionsBetweenDates(transactions, start, end, status){
       if(!transactions){
        return 0;
      }

      var transactionsBetween = transactions.filter(function(transaction){
        var transactionDate = new Date(transaction.transaction_date);
        var startDate = new Date(start);
        var endDate = new Date(end);

        // apply the unpaid filter if requested
        // ------------------------------------
        if(status){
          if(status === 'paid' && !transaction.paid){
            return false;
          }

          if(status === 'unpaid' && transaction.paid){
            return false;
          }

          if(status === 'brought_forward'){
            if(transaction.brought_forward_status !== 'added'){
              return false;
            }

            if(transaction.paid){
              return false;
            }
          }
        }

        return transactionDate >= startDate && transactionDate <= endDate;
      });

      return vm.util.total(transactionsBetween, 'net_amount');
   }


  } // end of controller

})();
